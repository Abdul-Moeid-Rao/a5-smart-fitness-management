import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.workoutLog.findMany({
      where: { userId: session.user.id },
      orderBy: { loggedAt: "desc" },
      skip,
      take: limit,
      include: {
        exercise: {
          select: { name: true, muscleGroup: true, category: true },
        },
        sets: { orderBy: { setNumber: "asc" } },
      },
    }),
    prisma.workoutLog.count({ where: { userId: session.user.id } }),
  ]);

  // Calculate total volume per log
  const logsWithVolume = logs.map((log) => ({
    ...log,
    totalVolume: log.sets.reduce(
      (sum, s) => sum + (s.weightKg ?? 0) * (s.reps ?? 0),
      0
    ),
  }));

  return NextResponse.json({
    success: true,
    data: logsWithVolume,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { exerciseId, notes, sets } = body as {
    exerciseId: string;
    notes?: string;
    sets: { setNumber: number; weightKg?: number; reps?: number; rpe?: number }[];
  };

  if (!exerciseId) {
    return NextResponse.json({ success: false, error: "exerciseId is required" }, { status: 400 });
  }

  // Verify exercise exists
  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise) {
    return NextResponse.json({ success: false, error: "Exercise not found" }, { status: 404 });
  }

  const log = await prisma.$transaction(async (tx) => {
    const workoutLog = await tx.workoutLog.create({
      data: {
        userId: session.user.id,
        exerciseId,
        notes: notes ?? null,
        sets: {
          create: (sets ?? []).map((s) => ({
            setNumber: s.setNumber,
            weightKg: s.weightKg ?? null,
            reps: s.reps ?? null,
            rpe: s.rpe ?? null,
          })),
        },
      },
      include: {
        exercise: { select: { name: true, muscleGroup: true } },
        sets: true,
      },
    });

    // Update streak on UserProfile
    await tx.userProfile.upsert({
      where: { userId: session.user.id },
      update: { lastWorkoutAt: new Date() },
      create: { userId: session.user.id, lastWorkoutAt: new Date() },
    });

    return workoutLog;
  });

  return NextResponse.json({ success: true, data: log }, { status: 201 });
}
