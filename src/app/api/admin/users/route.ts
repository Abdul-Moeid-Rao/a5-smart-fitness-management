import { prisma } from "@/lib/prisma";
import { ok, fail, handleApiError } from "@/lib/api";
import { paginationSchema } from "@/lib/validations";
import { requirePermission, getSession } from "@/lib/rbac";
import { writeAuditFromHeaders } from "@/lib/audit";

const SORTABLE = new Set(["name", "email", "role", "status", "plan", "createdAt", "lastLoginAt"]);

export async function GET(request: Request) {
  try {
    await requirePermission("users.read");
    const params = paginationSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams)
    );

    const where: Record<string, unknown> = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
      ];
    }
    if (params.status) where.status = params.status;
    if (params.role) where.role = params.role;

    const orderBy = SORTABLE.has(params.sortBy ?? "")
      ? { [params.sortBy!]: params.sortDir }
      : { createdAt: "desc" as const };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          status: true,
          plan: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { sessions: true, apiKeys: true, articles: true } },
        },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return ok({ items, total, page: params.page, pageSize: params.pageSize });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requirePermission("users.manage");
    return ok({ message: "Use /api/admin/users/:id for updates" });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requirePermission("users.manage");
    const session = await getSession();
    if (!session) throw new Error("UNAUTHORIZED");

    const body = await request.json();
    const { id } = body as { id?: string };
    if (!id) throw new Error("User id is required");

    if (id === session.user.id) {
      return fail("You cannot delete your own account", 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return fail("User not found", 404);

    await prisma.user.delete({ where: { id } });
    await writeAuditFromHeaders(request.headers, {
      action: "user.delete",
      entityType: "user",
      entityId: id,
      actorId: session.user.id,
      details: { email: user.email },
    });

    return ok({ message: "User deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
