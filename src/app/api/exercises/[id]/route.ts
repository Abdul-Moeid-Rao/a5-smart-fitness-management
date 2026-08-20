import { prisma } from "@/lib/prisma";
import { ok, fail, noContent, handleApiError } from "@/lib/api";
import { exerciseSchema } from "@/lib/validations";
import { requirePermission, getSession } from "@/lib/rbac";
import { writeAuditFromHeaders } from "@/lib/audit";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const exercise = await prisma.exercise.findUnique({ where: { id } });
    if (!exercise) return fail("Exercise not found", 404);
    return ok(exercise);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    await requirePermission("exercises.write");
    const { id } = await params;
    const existing = await prisma.exercise.findUnique({ where: { id } });
    if (!existing) return fail("Exercise not found", 404);

    const body = await request.json();
    const data = exerciseSchema.partial().parse(body);

    if (data.slug && data.slug !== existing.slug) {
      const dup = await prisma.exercise.findUnique({ where: { slug: data.slug } });
      if (dup) return fail("An exercise with this slug already exists", 409);
    }

    const exercise = await prisma.exercise.update({
      where: { id },
      data: { ...data, imageUrl: data.imageUrl === undefined ? undefined : data.imageUrl || null },
    });

    const session = await getSession();
    await writeAuditFromHeaders(request.headers, {
      action: "exercise.update",
      entityType: "exercise",
      entityId: id,
      actorId: session?.user.id,
      details: { name: exercise.name },
    });

    return ok(exercise);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    await requirePermission("exercises.write");
    const { id } = await params;
    const existing = await prisma.exercise.findUnique({ where: { id } });
    if (!existing) return fail("Exercise not found", 404);

    await prisma.exercise.delete({ where: { id } });

    const session = await getSession();
    await writeAuditFromHeaders(request.headers, {
      action: "exercise.delete",
      entityType: "exercise",
      entityId: id,
      actorId: session?.user.id,
      details: { name: existing.name },
    });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
