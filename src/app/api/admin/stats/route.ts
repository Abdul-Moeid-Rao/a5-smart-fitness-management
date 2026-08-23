import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api";
import { requirePermission } from "@/lib/rbac";

export async function GET(_request: Request) {
  try {
    await requirePermission("users.read");

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeToday,
      newSignups,
      sessions,
      suspendedUsers,
      adminUsers,
      exercises,
      articles,
      apiKeys,
      auditLogs,
      activeLogsToday,
      allSets,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "active", lastLoginAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.session.count({ where: { expiresAt: { gt: now } } }),
      prisma.user.count({ where: { status: "suspended" } }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.exercise.count(),
      prisma.article.count({ where: { status: "published" } }),
      prisma.apiKey.count({ where: { status: "active" } }),
      prisma.auditLog.count(),
      prisma.workoutLog.count({ where: { loggedAt: { gte: todayStart } } }),
      prisma.workoutSet.findMany({ select: { weightKg: true, reps: true } }),
    ]);

    const globalVolumeLifted = allSets.reduce(
      (sum, s) => sum + (s.weightKg ?? 0) * (s.reps ?? 0),
      0
    );

    const roleCounts = await prisma.user.groupBy({ by: ["role"], _count: { _all: true } });

    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const day = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      return { start };
    });

    const signupsByDay = await prisma.user.groupBy({
      by: ["createdAt"],
      _count: { _all: true },
      where: { createdAt: { gte: last30Days[0].start } },
    });

    const growthMap = new Map<string, number>();
    for (const { createdAt, _count } of signupsByDay) {
      const dayKey = createdAt.toISOString().slice(0, 10);
      growthMap.set(dayKey, (growthMap.get(dayKey) ?? 0) + _count._all);
    }

    const cumulative = [];
    const totalInWindow = Array.from(growthMap.values()).reduce((a, b) => a + b, 0);
    let running = Math.max(0, totalUsers - totalInWindow);
    for (const { start } of last30Days) {
      const dayKey = start.toISOString().slice(0, 10);
      running += growthMap.get(dayKey) ?? 0;
      cumulative.push({ date: dayKey, value: running });
    }

    const sessionsByDay = await prisma.session.groupBy({
      by: ["createdAt"],
      _count: { _all: true },
      where: { createdAt: { gte: weekStart } },
    });

    const sessionDayMap = new Map<string, number>();
    for (const { createdAt, _count } of sessionsByDay) {
      const dayKey = createdAt.toISOString().slice(0, 10);
      sessionDayMap.set(dayKey, (sessionDayMap.get(dayKey) ?? 0) + _count._all);
    }

    const sessionsSeries = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const key = day.toISOString().slice(0, 10);
      return { date: key, sessions: sessionDayMap.get(key) ?? 0 };
    });

    const activityByDay = await prisma.auditLog.groupBy({
      by: ["createdAt"],
      _count: { _all: true },
      where: { createdAt: { gte: weekStart } },
    });

    const activityDayMap = new Map<string, number>();
    for (const { createdAt, _count } of activityByDay) {
      const dayKey = createdAt.toISOString().slice(0, 10);
      activityDayMap.set(dayKey, (activityDayMap.get(dayKey) ?? 0) + _count._all);
    }

    const activitySeries = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const key = day.toISOString().slice(0, 10);
      return { date: key, actions: activityDayMap.get(key) ?? 0 };
    });

    return ok({
      kpis: {
        totalUsers,
        activeToday,
        newSignups,
        sessions,
        suspendedUsers,
        adminUsers,
        exercises,
        articles,
        apiKeys,
        auditLogs,
        activeLogsToday,
        globalVolumeLifted: Math.round(globalVolumeLifted),
      },
      roleDistribution: roleCounts.map((r) => ({
        role: r.role,
        count: r._count._all,
      })),
      growth: cumulative,
      sessionsSeries,
      activitySeries,
      period: { from: monthStart, to: now },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
