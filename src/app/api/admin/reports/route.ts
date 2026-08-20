import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api";
import { requirePermission } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    await requirePermission("reports.read");
    const now = new Date();

    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return d;
    });

    const monthRange = (d: Date) => ({
      start: d,
      end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
    });

    const userSeries = await Promise.all(
      months.map(async (m) => {
        const { start, end } = monthRange(m);
        const count = await prisma.user.count({
          where: { createdAt: { gte: start, lt: end } },
        });
        return {
          label: start.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          signups: count,
        };
      })
    );

    const [roleCounts, statusCounts, planCounts, publishedExercises, publishedArticles, totalAuditLogs] =
      await Promise.all([
        prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
        prisma.user.groupBy({ by: ["status"], _count: { _all: true } }),
        prisma.user.groupBy({ by: ["plan"], _count: { _all: true } }),
        prisma.exercise.count({ where: { isPublished: true } }),
        prisma.article.count({ where: { status: "published" } }),
        prisma.auditLog.count(),
      ]);

    const topActions = await prisma.auditLog.groupBy({
      by: ["action"],
      _count: { _all: true },
      orderBy: { _count: { action: "desc" } },
      take: 8,
    });

    const recentAudit = await prisma.auditLog.findMany({
      take: 25,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { id: true, name: true, image: true } } },
    });

    return ok({
      userSeries,
      roleDistribution: roleCounts.map((r) => ({ key: r.role, value: r._count._all })),
      statusDistribution: statusCounts.map((s) => ({ key: s.status, value: s._count._all })),
      planDistribution: planCounts.map((p) => ({ key: p.plan, value: p._count._all })),
      content: { publishedExercises, publishedArticles },
      topActions: topActions.map((a) => ({ action: a.action, count: a._count._all })),
      recentAudit,
      totalAuditLogs,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
