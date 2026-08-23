import type { Metadata } from "next";
import { requirePageAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { WorkoutPlanner } from "@/components/workouts/workout-planner";

export const metadata: Metadata = { title: "Workouts" };

export default async function WorkoutsPage() {
  const { user } = await requirePageAuth();

  const [exercises, recentLogs] = await Promise.all([
    prisma.exercise.findMany({
      where: { isPublished: true },
      orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
    }),
    prisma.workoutLog.findMany({
      where: { userId: user.id },
      orderBy: { loggedAt: "desc" },
      take: 5,
      include: {
        exercise: { select: { name: true, muscleGroup: true } },
        sets: true,
      },
    }),
  ]);

  const exerciseList = exercises.map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    muscleGroup: e.muscleGroup,
    difficulty: e.difficulty,
    equipment: e.equipment,
    description: e.description,
    instructions: e.instructions,
  }));

  const recentList = recentLogs.map((l) => ({
    id: l.id,
    loggedAt: l.loggedAt.toISOString(),
    exercise: l.exercise,
    setsCount: l.sets.length,
    totalVolume: l.sets.reduce((sum, s) => sum + (s.weightKg ?? 0) * (s.reps ?? 0), 0),
  }));

  return <WorkoutPlanner exercises={exerciseList} recentLogs={recentList} />;
}
