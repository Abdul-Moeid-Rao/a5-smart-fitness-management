import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PermissionKey } from "@/lib/permissions";

export const getSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
});

export interface AuthContext {
  user: NonNullable<Awaited<ReturnType<typeof getSession>>>["user"];
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>["session"];
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await getSession();
  if (!session) return null;
  return { user: session.user, session: session.session };
}

export async function requireAuth(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) throw new Error("UNAUTHORIZED");
  return ctx;
}

export async function requireRole(
  ...roles: string[]
): Promise<AuthContext> {
  const ctx = await requireAuth();
  if (!roles.includes(ctx.user.role)) throw new Error("FORBIDDEN");
  return ctx;
}

export async function requirePermission(
  permission: PermissionKey
): Promise<AuthContext> {
  const ctx = await requireAuth();
  if (ctx.user.role === "admin") return ctx;

  const role = await prisma.role.findUnique({
    where: { name: ctx.user.role },
    include: { permissions: { include: { permission: true } } },
  });

  const granted = await prisma.userPermission.findUnique({
    where: {
      userId_permissionId: {
        userId: ctx.user.id,
        permissionId: (await prisma.permission.findUnique({ where: { key: permission } }))?.id ?? "",
      },
    },
  });

  const allowed = role?.permissions.some((rp) => rp.permission.key === permission);
  if (allowed || granted) return ctx;
  throw new Error("FORBIDDEN");
}

export function errorStatus(error: unknown): number {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") return 401;
    if (error.message === "FORBIDDEN") return 403;
  }
  return 500;
}

export function can(user: { role: string }, permission: string): boolean {
  if (user.role === "admin") return true;
  return false;
}
