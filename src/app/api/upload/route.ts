import { writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { requireAuth } from "@/lib/rbac";
import { ok, fail, handleApiError } from "@/lib/api";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  try {
    await requireAuth();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) return fail("No file uploaded", 400);
    if (!ALLOWED.has(file.type)) return fail("Only JPEG, PNG, WEBP and GIF are allowed", 415);
    if (file.size > MAX_SIZE) return fail("File exceeds 2MB limit", 413);

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".png";
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await writeFile(path.join(uploadDir, filename), bytes);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return ok({ url: `${baseUrl}/uploads/${filename}` });
  } catch (error) {
    return handleApiError(error);
  }
}
