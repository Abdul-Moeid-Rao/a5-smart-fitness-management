import { prisma } from "@/lib/prisma";

interface AuditOptions {
  action: string;
  entityType?: string;
  entityId?: string;
  actorId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function writeAuditLog(options: AuditOptions): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: options.action,
        entityType: options.entityType,
        entityId: options.entityId,
        actorId: options.actorId,
        details: options.details ? JSON.stringify(options.details) : null,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
      },
    });
  } catch {
    // Audit logging must never break the primary operation.
  }
}

export async function writeAuditFromHeaders(
  headers: Headers,
  options: Omit<AuditOptions, "ipAddress" | "userAgent">
): Promise<void> {
  await writeAuditLog({
    ...options,
    ipAddress:
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headers.get("x-real-ip") ??
      null,
    userAgent: headers.get("user-agent") ?? null,
  });
}
