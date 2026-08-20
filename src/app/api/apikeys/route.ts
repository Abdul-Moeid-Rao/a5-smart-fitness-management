import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ok, created, handleApiError } from "@/lib/api";
import { apiKeySchema } from "@/lib/validations";
import { requireAuth } from "@/lib/rbac";
import { writeAuditFromHeaders } from "@/lib/audit";

const PREFIX = "sfm_";

function generateKey(): string {
  return PREFIX + crypto.randomBytes(24).toString("base64url");
}

export async function GET() {
  try {
    const ctx = await requireAuth();
    const keys = await prisma.apiKey.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        key: true,
        permissions: true,
        lastUsedAt: true,
        expiresAt: true,
        status: true,
        createdAt: true,
      },
    });
    return ok({
      items: keys.map((k) => ({ ...k, key: `${k.key.slice(0, 7)}••••••••${k.key.slice(-4)}` })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireAuth();
    const body = await request.json();
    const data = apiKeySchema.parse(body);

    const rawKey = generateKey();
    const key = await prisma.apiKey.create({
      data: {
        name: data.name,
        key: rawKey,
        userId: ctx.user.id,
        permissions: data.permissions?.length ? JSON.stringify(data.permissions) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    await writeAuditFromHeaders(request.headers, {
      action: "apikey.create",
      entityType: "apikey",
      entityId: key.id,
      actorId: ctx.user.id,
      details: { name: data.name },
    });

    return created({ id: key.id, name: key.name, rawKey });
  } catch (error) {
    return handleApiError(error);
  }
}
