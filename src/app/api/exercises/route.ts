import { prisma } from "@/lib/prisma";
import { ok, created, fail, handleApiError } from "@/lib/api";
import { exerciseSchema, paginationSchema } from "@/lib/validations";
import { requirePermission, getSession } from "@/lib/rbac";
import { rateLimit, rateLimitKeyFromHeaders } from "@/lib/rate-limit";
import { writeAuditFromHeaders } from "@/lib/audit";

const SORTABLE = new Set(["name", "category", "muscleGroup", "difficulty", "createdAt", "updatedAt"]);

export async function GET(request: Request) {
  try {
    const rl = rateLimit(rateLimitKeyFromHeaders(request.headers, "exercises"), 200, 60);
    if (!rl.ok) {
      return fail(`Rate limit exceeded. Retry in ${rl.retryAfterSeconds}s`, 429);
    }

    const params = paginationSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams)
    );

    const where: Record<string, unknown> = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { muscleGroup: { contains: params.search } },
        { category: { contains: params.search } },
      ];
    }
    if (params.status) where.isPublished = params.status === "published";

    const orderBy = SORTABLE.has(params.sortBy ?? "")
      ? { [params.sortBy!]: params.sortDir }
      : { createdAt: "desc" as const };

    const [items, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        orderBy,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.exercise.count({ where }),
    ]);

    return ok({ items, total, page: params.page, pageSize: params.pageSize });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission("exercises.write");
    const body = await request.json();
    const data = exerciseSchema.parse(body);

    const existing = await prisma.exercise.findUnique({ where: { slug: data.slug } });
    if (existing) return fail("An exercise with this slug already exists", 409);

    const session = await getSession();
    const exercise = await prisma.exercise.create({
      data: {
        ...data,
        imageUrl: data.imageUrl || null,
        instructions: data.instructions,
        createdById: session?.user.id,
      },
    });

    await writeAuditFromHeaders(request.headers, {
      action: "exercise.create",
      entityType: "exercise",
      entityId: exercise.id,
      actorId: session?.user.id,
      details: { name: exercise.name },
    });

    return created(exercise);
  } catch (error) {
    return handleApiError(error);
  }
}
