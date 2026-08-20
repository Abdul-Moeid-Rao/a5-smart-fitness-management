import { prisma } from "@/lib/prisma";
import { ok, handleApiError } from "@/lib/api";
import { paginationSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    await requirePermission("audit.read");
    const params = paginationSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams)
    );

    const where: Record<string, unknown> = {};
    if (params.search) {
      where.OR = [
        { action: { contains: params.search } },
        { entityType: { contains: params.search } },
        { actor: { name: { contains: params.search } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { actor: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return ok({ items, total, page: params.page, pageSize: params.pageSize });
  } catch (error) {
    return handleApiError(error);
  }
}
