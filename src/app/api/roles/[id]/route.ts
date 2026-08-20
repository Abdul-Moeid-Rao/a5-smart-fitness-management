import { prisma } from "@/lib/prisma";
import { ok, fail, handleApiError } from "@/lib/api";
import { roleUpdateSchema } from "@/lib/validations";
import { requirePermission, getSession } from "@/lib/rbac";
import { writeAuditFromHeaders } from "@/lib/audit";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Context) {
  try {
    await requirePermission("roles.manage");
    const { id } = await params;
    const session = await getSession();
    if (!session) throw new Error("UNAUTHORIZED");

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return fail("Role not found", 404);

    const body = await request.json();
    const data = roleUpdateSchema.parse(body);

    let permissionData: { deleteMany: {}; create: { permissionId: string }[] } | undefined;
    if (data.permissions) {
      const permissions = await prisma.permission.findMany({
        where: { key: { in: data.permissions } },
      });
      const keyToId = new Map(permissions.map((p) => [p.key, p.id]));
      permissionData = {
        deleteMany: {},
        create: data.permissions
          .filter((key) => keyToId.has(key))
          .map((key) => ({ permissionId: keyToId.get(key)! })),
      };
    }

    const updated = await prisma.role.update({
      where: { id },
      data: {
        description: data.description,
        permissions: permissionData,
      },
      include: { permissions: { include: { permission: true } } },
    });

    await writeAuditFromHeaders(request.headers, {
      action: "role.update",
      entityType: "role",
      entityId: id,
      actorId: session.user.id,
      details: { name: role.name, permissionCount: permissionData?.create.length ?? 0 },
    });

    return ok({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      system: updated.system,
      permissions: updated.permissions.map((rp) => rp.permission.key),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    await requirePermission("roles.manage");
    const { id } = await params;
    const session = await getSession();
    if (!session) throw new Error("UNAUTHORIZED");

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return fail("Role not found", 404);
    if (role.system) return fail("System roles cannot be deleted", 400);

    const usersWithRole = await prisma.user.count({ where: { role: role.name } });
    if (usersWithRole > 0) {
      return fail(`Cannot delete role: ${usersWithRole} user(s) still have it`, 400);
    }

    await prisma.role.delete({ where: { id } });

    await writeAuditFromHeaders(request.headers, {
      action: "role.delete",
      entityType: "role",
      entityId: id,
      actorId: session.user.id,
      details: { name: role.name },
    });

    return ok({ message: "Role deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
