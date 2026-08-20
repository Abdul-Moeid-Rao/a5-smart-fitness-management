import { prisma } from "@/lib/prisma";
import { ok, fail, handleApiError } from "@/lib/api";
import { requireAuth } from "@/lib/rbac";
import { writeAuditFromHeaders } from "@/lib/audit";

interface Context {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const ctx = await requireAuth();
    const { id } = await params;

    const key = await prisma.apiKey.findUnique({ where: { id } });
    if (!key || key.userId !== ctx.user.id) return fail("API key not found", 404);

    await prisma.apiKey.update({ where: { id }, data: { status: "revoked" } });

    await writeAuditFromHeaders(request.headers, {
      action: "apikey.revoke",
      entityType: "apikey",
      entityId: id,
      actorId: ctx.user.id,
      details: { name: key.name },
    });

    return ok({ message: "API key revoked" });
  } catch (error) {
    return handleApiError(error);
  }
}
