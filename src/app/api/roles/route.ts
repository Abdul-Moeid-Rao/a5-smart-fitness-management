import { prisma } from "@/lib/prisma";
import { ok, fail, handleApiError } from "@/lib/api";
import { PERMISSIONS } from "@/lib/permissions";
import { requirePermission } from "@/lib/rbac";

export async function GET() {
  try {
    await requirePermission("users.read");
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
          orderBy: { permission: { group: "asc" } },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    });
    const roleCountMap = new Map(usersByRole.map((r) => [r.role, r._count._all]));

    return ok({
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        system: r.system,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        userCount: roleCountMap.get(r.name) ?? 0,
        permissions: r.permissions.map((rp) => rp.permission.key),
      })),
      availablePermissions: PERMISSIONS,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission("roles.manage");
    const body = await request.json();
    const { name, description } = body as {
      name?: string;
      description?: string;
    };
    if (!name || !/^[a-z0-9-]{2,40}$/.test(name)) {
      return fail("Role name must be 2-40 lowercase characters, digits or hyphens", 422);
    }

    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) return fail("Role already exists", 409);

    const role = await prisma.role.create({
      data: { name, description },
      include: { permissions: { include: { permission: true } } },
    });

    return ok(role, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
