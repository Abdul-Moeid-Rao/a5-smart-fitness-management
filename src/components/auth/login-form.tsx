"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard, AuthInput, AuthButton } from "@/components/auth/auth-card";
import { signIn } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({ email: "", password: "" });
  const [showForgot, setShowForgot] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState("");
  const [resetLoading, setResetLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn.email({
        email: form.email,
        password: form.password,
      });
      if (error) {
        toast.error(error.message ?? "Invalid email or password");
        return;
      }
      toast.success("Signed in successfully");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Reset link sent — check your inbox");
      setShowForgot(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  }

  if (showForgot) {
    return (
      <AuthCard
        title="Forgot password"
        subtitle="Enter your email and we'll send a reset link"
        footer={
          <p className="text-sm text-muted-foreground">
            Remembered it?{" "}
            <button
              className="font-semibold text-primary hover:underline cursor-pointer"
              onClick={() => setShowForgot(false)}
            >
              Back to sign in
            </button>
          </p>
        }
      >
        <form onSubmit={handleForgotPassword} className="space-y-5">
          <AuthInput
            id="reset-email"
            label="Email address"
            type="email"
            required
            placeholder="you@example.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          <AuthButton type="submit" loading={resetLoading}>
            Send reset link
          </AuthButton>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your SmartFitness account"
      footer={
        <p className="text-sm text-muted-foreground">
          No account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Create one →
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          id="email"
          label="Email"
          type="email"
          required
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <AuthInput
            id="password"
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <AuthButton type="submit" loading={loading}>
          Sign in
        </AuthButton>
      </form>
    </AuthCard>
  );
}
