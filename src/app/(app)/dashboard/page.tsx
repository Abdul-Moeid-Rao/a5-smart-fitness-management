import type { Metadata } from "next";
import { requirePageAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { user } = await requirePageAuth();

  const [profile, recentLogs, exerciseCount, workoutTotal] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: user.id } }),
    prisma.workoutLog.findMany({
      where: { userId: user.id },
      orderBy: { loggedAt: "desc" },
      take: 8,
      include: {
        exercise: { select: { name: true, muscleGroup: true, category: true } },
        sets: true,
      },
    }),
    prisma.exercise.count({ where: { isPublished: true } }),
    prisma.workoutLog.count({ where: { userId: user.id } }),
  ]);

  // Volume per log
  const logsWithVolume = recentLogs.map((log) => ({
    id: log.id,
    loggedAt: log.loggedAt.toISOString(),
    notes: log.notes,
    exercise: log.exercise,
    sets: log.sets.map((s) => ({ setNumber: s.setNumber, weightKg: s.weightKg, reps: s.reps, rpe: s.rpe })),
    totalVolume: log.sets.reduce((sum, s) => sum + (s.weightKg ?? 0) * (s.reps ?? 0), 0),
  }));

  // BMR / TDEE calculation
  const ACTIVITY_MULTIPLIERS: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  };
  let bmr: number | null = null;
  let tdee: number | null = null;
  if (profile?.weightKg && profile.heightCm && profile.age) {
    bmr = Math.round(10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5);
    tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[profile.activityLevel] ?? 1.55));
  }

  // Streak calculation: count consecutive days ending today
  let streakDays = 0;
  if (recentLogs.length > 0) {
    const logDays = [...new Set(
      recentLogs.map((l) => new Date(l.loggedAt).toDateString())
    )];
    const today = new Date();
    for (let i = 0; i < logDays.length; i++) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (logDays[i] === expected.toDateString()) streakDays++;
      else break;
    }
  }

  return (
    <DashboardClient
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      }}
      stats={{
        totalWorkouts: workoutTotal,
        streakDays,
        tdee,
        exerciseCount,
        currentWeight: profile?.weightKg ?? null,
        goalWeight: profile?.goalWeightKg ?? null,
      }}
      recentLogs={logsWithVolume}
    />
  );
}
