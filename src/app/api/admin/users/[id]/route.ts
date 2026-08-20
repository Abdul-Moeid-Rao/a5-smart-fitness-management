import { prisma } from "@/lib/prisma";
import { ok, fail, handleApiError } from "@/lib/api";
import { userUpdateSchema } from "@/lib/validations";
import { requirePermission, getSession } from "@/lib/rbac";
import { writeAuditFromHeaders } from "@/lib/audit";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Context) {
  try {
    await requirePermission("users.read");
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        bio: true,
        role: true,
        status: true,
        plan: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: { sessions: true, apiKeys: true, articles: true, auditLogs: true },
        },
      },
    });
    if (!user) return fail("User not found", 404);
    return ok(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    await requirePermission("users.manage");
    const { id } = await params;
    const session = await getSession();
    if (!session) throw new Error("UNAUTHORIZED");

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return fail("User not found", 404);

    const body = await request.json();
    const data = userUpdateSchema.parse(body);

    if (data.role) {
      const role = await prisma.role.findUnique({ where: { name: data.role } });
      if (!role) return fail(`Role '${data.role}' does not exist`, 400);
    }
    if (data.status === "suspended" && id === session.user.id) {
      return fail("You cannot suspend your own account", 400);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        status: data.status === "active" ? "active" : data.status === "suspended" ? "suspended" : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        bio: true,
        role: true,
        status: true,
        plan: true,
        emailVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    await writeAuditFromHeaders(request.headers, {
      action: "user.update",
      entityType: "user",
      entityId: id,
      actorId: session.user.id,
      details: { changes: data, email: existing.email },
    });

    return ok(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    await requirePermission("users.manage");
    const { id } = await params;
    const session = await getSession();
    if (!session) throw new Error("UNAUTHORIZED");

    if (id === session.user.id) return fail("You cannot delete your own account", 400);

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return fail("User not found", 404);

    await prisma.user.delete({ where: { id } });

    await writeAuditFromHeaders(request.headers, {
      action: "user.delete",
      entityType: "user",
      entityId: id,
      actorId: session.user.id,
      details: { email: existing.email },
    });

    return ok({ message: "User deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
