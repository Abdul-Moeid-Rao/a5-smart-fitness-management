import { buildOpenApi } from "@/lib/openapi";

export async function GET() {
  return Response.json(buildOpenApi(), {
    headers: { "Content-Type": "application/openapi+json" },
  });
}
