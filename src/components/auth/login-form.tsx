"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({ email: "", password: "" });

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

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your SmartFitness account"
      footer={
        <p className="text-sm text-slate-500">
          No account?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <div className="mt-5 rounded-md border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
        <p className="font-medium">Demo accounts</p>
        <p className="mt-1">
          Admin: <code className="font-mono">admin@smartfitness.app</code> /{" "}
          <code className="font-mono">Admin@12345</code>
        </p>
        <p>
          User: <code className="font-mono">user@smartfitness.app</code> /{" "}
          <code className="font-mono">User@12345</code>
        </p>
      </div>
    </AuthCard>
  );
}
