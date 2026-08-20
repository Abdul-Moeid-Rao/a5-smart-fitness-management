import { auth } from "@/lib/auth";
import { ok, fail, handleApiError } from "@/lib/api";
import { profileSchema } from "@/lib/validations";
import { requireAuth } from "@/lib/rbac";
import { writeAuditFromHeaders } from "@/lib/audit";

export async function PATCH(request: Request) {
  try {
    const ctx = await requireAuth();
    const body = await request.json();
    const data = profileSchema.parse(body);

    const updated = await auth.api.updateUser({
      headers: request.headers,
      body: {
        name: data.name,
        image: data.image || null,
        phone: data.phone ?? undefined,
        bio: data.bio ?? undefined,
      },
    });

    await writeAuditFromHeaders(request.headers, {
      action: "profile.update",
      entityType: "user",
      entityId: ctx.user.id,
      actorId: ctx.user.id,
      details: { name: data.name },
    });

    return ok({ user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const ctx = await requireAuth();
    return ok({ user: ctx.user });
  } catch (error) {
    return fail("Unauthorized", 401);
  }
}
