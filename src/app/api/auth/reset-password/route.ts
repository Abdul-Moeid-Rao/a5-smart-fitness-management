import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  const session = await getSession();
  // Anyone can request a reset (even non-authed)
  const body = await req.json();
  const { email } = body as { email: string };

  if (!email) {
    return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
  }

  if (!resend) {
    // No Resend key configured — still return success to avoid leaking info
    return NextResponse.json({ success: true, message: "If an account exists, a reset link was sent." });
  }

  try {
    const resetUrl = `${process.env.BETTER_AUTH_URL}/reset-password?email=${encodeURIComponent(email)}`;

    await resend.emails.send({
      from: "SmartFitness <noreply@smartfitness.app>",
      to: email,
      subject: "Reset your SmartFitness password",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <div style="background: #090d16; border: 1px solid rgba(132,204,22,0.2); border-radius: 16px; padding: 32px; color: #e2e8f0;">
            <h1 style="color: #84cc16; font-size: 24px; margin-bottom: 8px;">Reset your password</h1>
            <p style="color: #94a3b8; margin-bottom: 24px;">Click the button below to reset your SmartFitness password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="display: inline-block; background: #84cc16; color: #0a0f00; font-weight: bold; padding: 12px 24px; border-radius: 12px; text-decoration: none;">
              Reset Password →
            </a>
            <p style="color: #475569; margin-top: 24px; font-size: 12px;">If you didn't request this, ignore this email.</p>
          </div>
        </div>
      `,
    });
  } catch {
    // Silent fail — don't leak whether email exists
  }

  return NextResponse.json({ success: true, message: "If an account exists, a reset link was sent." });
}
