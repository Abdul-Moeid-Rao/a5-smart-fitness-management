import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

// Activity level multipliers (Harris-Benedict / Mifflin-St Jeor)
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function calculateBMR(weightKg: number, heightCm: number, age: number, sex = "male") {
  // Mifflin-St Jeor
  if (sex === "female") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  let profile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } });

  if (!profile) {
    profile = await prisma.userProfile.create({
      data: { userId: session.user.id },
    });
  }

  let bmr: number | null = null;
  let tdee: number | null = null;

  if (profile.weightKg && profile.heightCm && profile.age) {
    bmr = Math.round(calculateBMR(profile.weightKg, profile.heightCm, profile.age));
    const multiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel] ?? 1.55;
    tdee = Math.round(bmr * multiplier);
  }

  return NextResponse.json({ success: true, data: { ...profile, bmr, tdee } });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { age, heightCm, weightKg, goalWeightKg, activityLevel, fitnessGoal } = body;

  const profile = await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    update: {
      ...(age !== undefined && { age: age ? parseInt(age) : null }),
      ...(heightCm !== undefined && { heightCm: heightCm ? parseFloat(heightCm) : null }),
      ...(weightKg !== undefined && { weightKg: weightKg ? parseFloat(weightKg) : null }),
      ...(goalWeightKg !== undefined && { goalWeightKg: goalWeightKg ? parseFloat(goalWeightKg) : null }),
      ...(activityLevel && { activityLevel }),
      ...(fitnessGoal && { fitnessGoal }),
    },
    create: {
      userId: session.user.id,
      ...(age && { age: parseInt(age) }),
      ...(heightCm && { heightCm: parseFloat(heightCm) }),
      ...(weightKg && { weightKg: parseFloat(weightKg) }),
      ...(goalWeightKg && { goalWeightKg: parseFloat(goalWeightKg) }),
      ...(activityLevel && { activityLevel }),
      ...(fitnessGoal && { fitnessGoal }),
    },
  });

  let bmr: number | null = null;
  let tdee: number | null = null;
  if (profile.weightKg && profile.heightCm && profile.age) {
    bmr = Math.round(calculateBMR(profile.weightKg, profile.heightCm, profile.age));
    const multiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel] ?? 1.55;
    tdee = Math.round(bmr * multiplier);
  }

  return NextResponse.json({ success: true, data: { ...profile, bmr, tdee } });
}
