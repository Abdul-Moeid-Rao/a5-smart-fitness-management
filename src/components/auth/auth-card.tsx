"use client";

import * as React from "react";
import Link from "next/link";
import { Dumbbell, Activity, Shield, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const HERO_BULLETS = [
  { icon: Activity, text: "Log every workout in real-time" },
  { icon: TrendingUp, text: "Track body weight & volume trends" },
  { icon: Shield, text: "Role-based access & secure sessions" },
];

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  backHref?: string;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* ── Left panel (decorative hero) ─────────────────────────────────── */}
      <div
        className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden bg-[#090d16]"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(132,204,22,0.18) 0%, rgba(9,13,22,0) 60%), radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.12) 0%, rgba(9,13,22,0) 50%), #090d16",
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(132,204,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(132,204,22,0.04) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating glow orbs */}
        <div
          className="absolute top-32 right-16 h-64 w-64 rounded-full opacity-15 blur-3xl bg-[#84cc16]"
        />
        <div
          className="absolute bottom-24 left-12 h-48 w-48 rounded-full opacity-15 blur-3xl bg-[#06b6d4]"
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-500/15 border border-lime-500/30 shadow-sm"
          >
            <Dumbbell className="h-5 w-5 text-lime-400" />
          </div>
          <span
            className="text-xl font-bold text-white tracking-wide"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            SmartFitness
          </span>
        </div>

        {/* Hero content */}
        <div className="relative z-10">
          <h2
            className="text-4xl font-black text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Every rep counts.{" "}
            <span className="gradient-text">Track it.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            Join athletes logging workouts, hitting metabolic calorie goals and watching their performance climb.
          </p>

          <ul className="space-y-4">
            {HERO_BULLETS.map((b) => (
              <li key={b.text} className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-500/15 border border-lime-500/25"
                >
                  <b.icon className="h-4 w-4 text-lime-400" />
                </div>
                <span className="text-sm text-slate-300 font-medium">{b.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quote footer */}
        <div
          className="relative z-10 rounded-2xl p-5 bg-white/5 border border-white/10"
        >
          <p className="text-sm text-slate-300 italic mb-1.5">
            "The pain you feel today will be the strength you feel tomorrow."
          </p>
          <p className="text-xs text-slate-500 font-semibold">— Arnold Schwarzenegger</p>
        </div>
      </div>

      {/* ── Right panel (form container) ─────────────────────────────────── */}
      <div
        className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background"
      >
        {/* Top right theme toggle */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 border border-primary/30 shadow-sm"
          >
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          <span
            className="text-xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            SmartFitness
          </span>
        </div>

        <div className="w-full max-w-md">
          {/* Form card */}
          <div
            className="rounded-3xl p-8 border border-border bg-card shadow-lg"
          >
            <div className="mb-8 text-center">
              <h1
                className="text-2xl font-bold mb-2 text-foreground"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {title}
              </h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>

            {children}
          </div>

          {/* Footer */}
          <div className="mt-5 text-center">{footer}</div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared styled input & label for auth forms ──────────────────────────── */
export function AuthInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  disabled,
}: {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </label>
      ) : null}
      <input
        id={id}
        type={type}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl px-4 py-3 text-sm transition-all border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
      />
    </div>
  );
}

export function AuthButton({
  type = "button",
  loading,
  children,
  onClick,
}: {
  type?: "button" | "submit";
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={loading}
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-200 disabled:opacity-60 bg-primary text-primary-foreground shadow-md hover:opacity-90 cursor-pointer"
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
