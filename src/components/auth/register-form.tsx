"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard, AuthInput, AuthButton } from "@/components/auth/auth-card";
import { signUp } from "@/lib/auth-client";

const FITNESS_GOALS = [
  { value: "lose", label: "🔥 Lose Weight" },
  { value: "maintain", label: "⚡ Maintain Weight" },
  { value: "gain", label: "💪 Build Muscle / Gain" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary (desk job, no exercise)" },
  { value: "light", label: "Light (1-3 days/week)" },
  { value: "moderate", label: "Moderate (3-5 days/week)" },
  { value: "active", label: "Active (6-7 days/week)" },
  { value: "very_active", label: "Very Active (2x/day or physical job)" },
];

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    fitnessGoal: "maintain",
    heightCm: "",
    weightKg: "",
    activityLevel: "moderate",
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { error } = await signUp.email({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      if (error) {
        toast.error(error.message ?? "Could not create account");
        return;
      }

      // Create UserProfile with biometrics
      await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fitnessGoal: form.fitnessGoal,
          activityLevel: form.activityLevel,
          heightCm: form.heightCm ? parseFloat(form.heightCm) : null,
          weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
        }),
      });

      toast.success("Account created — welcome to SmartFitness! 🎉");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "0.75rem",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "var(--color-foreground)",
    outline: "none",
    appearance: "none",
    cursor: "pointer",
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start your fitness journey today"
      footer={
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold transition-colors" style={{ color: "#84cc16" }}>
            Sign in →
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          id="reg-name"
          label="Full name"
          required
          placeholder="Jane Doe"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <AuthInput
          id="reg-email"
          label="Email"
          type="email"
          required
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <AuthInput
          id="reg-password"
          label="Password"
          type="password"
          required
          placeholder="Min 8 chars, include uppercase + number"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <AuthInput
          id="reg-confirm"
          label="Confirm password"
          type="password"
          required
          placeholder="Repeat password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />

        {/* Divider */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
          <p className="text-xs text-muted-foreground">Fitness Goals (optional)</p>
          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Fitness Goal */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Primary Goal
          </label>
          <select
            value={form.fitnessGoal}
            onChange={(e) => setForm({ ...form, fitnessGoal: e.target.value })}
            style={selectStyle}
          >
            {FITNESS_GOALS.map((g) => (
              <option key={g.value} value={g.value} style={{ backgroundColor: "#111827" }}>
                {g.label}
              </option>
            ))}
          </select>
        </div>

        {/* Height & Weight */}
        <div className="grid grid-cols-2 gap-3">
          <AuthInput
            id="reg-height"
            label="Height (cm)"
            type="number"
            placeholder="175"
            value={form.heightCm}
            onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
          />
          <AuthInput
            id="reg-weight"
            label="Weight (kg)"
            type="number"
            placeholder="70"
            value={form.weightKg}
            onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
          />
        </div>

        {/* Activity Level */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Activity Level
          </label>
          <select
            value={form.activityLevel}
            onChange={(e) => setForm({ ...form, activityLevel: e.target.value })}
            style={selectStyle}
          >
            {ACTIVITY_LEVELS.map((a) => (
              <option key={a.value} value={a.value} style={{ backgroundColor: "#111827" }}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2">
          <AuthButton type="submit" loading={loading}>
            Create account
          </AuthButton>
        </div>
      </form>
    </AuthCard>
  );
}
