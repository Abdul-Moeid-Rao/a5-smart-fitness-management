import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { errorStatus } from "@/lib/rbac";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: message, details }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    const details = error.flatten();
    return fail("Validation failed", 422, details);
  }
  if (error instanceof Error) {
    return fail(error.message, errorStatus(error));
  }
  return fail("Internal server error", 500);
}

export function clientIp(headers: Headers): string | null {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    null
  );
}
