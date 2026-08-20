import { prisma } from "@/lib/prisma";
import { ok, created, fail, handleApiError } from "@/lib/api";
import { articleSchema, paginationSchema } from "@/lib/validations";
import { requirePermission, getSession } from "@/lib/rbac";
import { rateLimit, rateLimitKeyFromHeaders } from "@/lib/rate-limit";
import { writeAuditFromHeaders } from "@/lib/audit";

const SORTABLE = new Set(["title", "status", "createdAt", "updatedAt", "publishedAt"]);

export async function GET(request: Request) {
  try {
    const rl = rateLimit(rateLimitKeyFromHeaders(request.headers, "articles"), 200, 60);
    if (!rl.ok) return fail(`Rate limit exceeded. Retry in ${rl.retryAfterSeconds}s`, 429);

    const params = paginationSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams)
    );

    const session = await getSession();
    const isEditor = session?.user.role === "admin" || session?.user.role === "trainer";

    const where: Record<string, unknown> = {};
    if (!isEditor) where.status = "published";
    if (params.status && isEditor) where.status = params.status;
    if (params.search) {
      where.OR = [
        { title: { contains: params.search } },
        { excerpt: { contains: params.search } },
      ];
    }

    const orderBy = SORTABLE.has(params.sortBy ?? "")
      ? { [params.sortBy!]: params.sortDir }
      : { createdAt: "desc" as const };

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy,
        include: { author: { select: { id: true, name: true, image: true } } },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.article.count({ where }),
    ]);

    return ok({ items, total, page: params.page, pageSize: params.pageSize });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission("articles.write");
    const body = await request.json();
    const data = articleSchema.parse(body);

    const existing = await prisma.article.findUnique({ where: { slug: data.slug } });
    if (existing) return fail("An article with this slug already exists", 409);

    const session = await getSession();
    const article = await prisma.article.create({
      data: {
        ...data,
        tags: data.tags && data.tags.length ? JSON.stringify(data.tags) : null,
        coverImage: data.coverImage || null,
        authorId: session?.user.id,
        publishedAt: data.status === "published" ? new Date() : null,
      },
    });

    await writeAuditFromHeaders(request.headers, {
      action: "article.create",
      entityType: "article",
      entityId: article.id,
      actorId: session?.user.id,
      details: { title: article.title },
    });

    return created(article);
  } catch (error) {
    return handleApiError(error);
  }
}
