import { prisma } from "@/lib/prisma";
import { ok, fail, noContent, handleApiError } from "@/lib/api";
import { articleSchema } from "@/lib/validations";
import { requirePermission, getSession } from "@/lib/rbac";
import { writeAuditFromHeaders } from "@/lib/audit";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, image: true } } },
    });
    if (!article) return fail("Article not found", 404);
    return ok(article);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    await requirePermission("articles.write");
    const { id } = await params;
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return fail("Article not found", 404);

    const body = await request.json();
    const data = articleSchema.partial().parse(body);

    if (data.slug && data.slug !== existing.slug) {
      const dup = await prisma.article.findUnique({ where: { slug: data.slug } });
      if (dup) return fail("An article with this slug already exists", 409);
    }

    const wasPublished = existing.status === "published";
    const willBePublished = data.status === "published";

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...data,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
        coverImage: data.coverImage === undefined ? undefined : data.coverImage || null,
        publishedAt: willBePublished && !wasPublished ? new Date() : undefined,
      },
    });

    const session = await getSession();
    await writeAuditFromHeaders(request.headers, {
      action: "article.update",
      entityType: "article",
      entityId: id,
      actorId: session?.user.id,
      details: { title: article.title, status: article.status },
    });

    return ok(article);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    await requirePermission("articles.write");
    const { id } = await params;
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return fail("Article not found", 404);

    await prisma.article.delete({ where: { id } });

    const session = await getSession();
    await writeAuditFromHeaders(request.headers, {
      action: "article.delete",
      entityType: "article",
      entityId: id,
      actorId: session?.user.id,
      details: { title: existing.title },
    });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
