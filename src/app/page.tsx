import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Dumbbell,
  ShieldCheck,
  Users,
  Zap,
  Activity,
  Target,
  TrendingUp,
  CheckCircle2,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ThemeToggle } from "@/components/theme-toggle";

const FEATURES = [
  {
    icon: Activity,
    title: "Real-time Progress Tracking",
    description:
      "Log every set, rep and weight. Watch your volume, strength and body composition trend upward over time with live analytics.",
    accent: "#84cc16",
  },
  {
    icon: Users,
    title: "User Management",
    description:
      "Search, filter, sort and manage all members from a single admin panel. Change roles and suspend accounts instantly.",
    accent: "#06b6d4",
  },
  {
    icon: Dumbbell,
    title: "Exercise Library",
    description:
      "12+ real exercises with step-by-step instructions, muscle diagrams and equipment requirements. Admin-editable.",
    accent: "#a855f7",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access Control",
    description:
      "Admin, Trainer and User roles enforced with session-based auth and fine-grained permission guards.",
    accent: "#f59e0b",
  },
  {
    icon: TrendingUp,
    title: "BMR & TDEE Calculator",
    description:
      "Real Mifflin-St Jeor equations calculate your daily calorie goal based on your age, weight, height and activity level.",
    accent: "#ec4899",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Admin-level charts for user growth, active sessions, role distribution and audit log activity.",
    accent: "#06b6d4",
  },
];

const KPIS = [
  { label: "Exercises", value: "12+", suffix: "", icon: Dumbbell },
  { label: "Muscle Groups", value: "8", suffix: "", icon: Target },
  { label: "Active Members", value: "1.2k", suffix: "", icon: Users },
  { label: "Workouts Tracked", value: "10k", suffix: "+", icon: Zap },
];

export default async function LandingPage() {
  const exercises = await prisma.exercise.findMany({
    where: { isPublished: true },
    take: 6,
    orderBy: { createdAt: "asc" },
  });

  const difficultyColor: Record<string, string> = {
    beginner: "#22c55e",
    intermediate: "#f59e0b",
    advanced: "#ef4444",
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-border bg-background/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/30 shadow-sm"
            >
              <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <span
              className="text-base sm:text-lg font-bold tracking-wide text-foreground"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              SmartFitness
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground sm:flex">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#exercises" className="hover:text-foreground transition-colors">Exercises</a>
            <a href="#platform" className="hover:text-foreground transition-colors">Platform</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme switcher in navbar */}
            <ThemeToggle />

            <Link
              href="/login"
              className="rounded-xl px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all whitespace-nowrap"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold transition-all bg-primary text-primary-foreground shadow-sm hover:opacity-90 whitespace-nowrap shrink-0"
            >
              <span className="sm:hidden">Start</span>
              <span className="hidden sm:inline">Get started →</span>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Background decoration */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, rgba(132,204,22,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(6,182,212,0.15) 0%, transparent 50%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              color: "var(--color-border)",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 py-28 text-center sm:px-6 sm:py-36">
            {/* Live Badge */}
            <div
              className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold bg-primary/10 border border-primary/30 text-primary"
            >
              <Zap className="h-3.5 w-3.5" />
              Smart Fitness Platform · Live System
              <Star className="h-3.5 w-3.5" />
            </div>

            {/* Headline */}
            <h1
              className="mx-auto max-w-4xl text-4xl font-black tracking-tight sm:text-5xl md:text-7xl text-foreground"
              style={{ fontFamily: "var(--font-outfit)", lineHeight: 1.1 }}
            >
              Train smarter,{" "}
              <span className="gradient-text block sm:inline">track everything.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              One platform to log workouts, calculate your exact metabolic calorie goals, analyse body trends, and manage fitness members seamlessly.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                id="hero-cta-start"
                className="group flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold transition-all duration-200 bg-primary text-primary-foreground shadow-md hover:opacity-90"
              >
                Start Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#features"
                id="hero-cta-explore"
                className="flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all border border-border bg-card/60 text-foreground hover:bg-muted"
              >
                Explore Features
              </a>
            </div>
          </div>
        </section>

        {/* ── KPI Strip ──────────────────────────────────────────────────── */}
        <section className="border-y border-border bg-card/40">
          <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4 px-4 sm:px-6">
            {KPIS.map((kpi, i) => (
              <div
                key={kpi.label}
                className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start text-center sm:text-left gap-3 sm:gap-4 py-6 sm:px-8 sm:py-8 border-border ${
                  i === 0 ? "border-b border-r lg:border-b-0" : 
                  i === 1 ? "border-b lg:border-r lg:border-b-0" : 
                  i === 2 ? "border-r" : ""
                }`}
              >
                <div
                  className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary"
                >
                  <kpi.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p
                    className="text-2xl sm:text-3xl font-black text-foreground"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {kpi.value}
                    <span className="text-primary">{kpi.suffix}</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────────────────── */}
        <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-primary">
              Platform Features
            </p>
            <h2
              className="text-4xl font-black tracking-tight sm:text-5xl text-foreground"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Everything you need to{" "}
              <span className="gradient-text">perform</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
              Built with Next.js, Better Auth and Prisma — a high-performance system for both athletes and platform administrators.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 border border-border bg-card shadow-sm hover:shadow-md"
              >
                <div
                  className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300"
                  style={{
                    background: `${feature.accent}15`,
                    border: `1px solid ${feature.accent}30`,
                  }}
                >
                  <feature.icon className="h-5 w-5" style={{ color: feature.accent }} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Exercise Highlights Carousel ──────────────────────────────────────────── */}
        {exercises.length > 0 && (
          <section
            id="exercises"
            className="border-y border-border py-24 bg-card/20"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="text-center mb-16">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-accent">
                  Exercise Library
                </p>
                <h2
                  className="text-4xl font-black tracking-tight sm:text-5xl text-foreground"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  Real exercises,{" "}
                  <span className="text-accent">ready to log</span>
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
                  Every exercise comes with step-by-step instructions, target muscle groups and equipment requirements.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="group rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 border border-border bg-card shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 text-accent"
                      >
                        <Dumbbell className="h-4 w-4" />
                      </div>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                        style={{
                          backgroundColor: `${difficultyColor[ex.difficulty] ?? "#64748b"}15`,
                          color: difficultyColor[ex.difficulty] ?? "#64748b",
                          border: `1px solid ${difficultyColor[ex.difficulty] ?? "#64748b"}30`,
                        }}
                      >
                        {ex.difficulty}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-1 text-foreground">
                      {ex.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {ex.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground border border-border"
                      >
                        {ex.muscleGroup}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground border border-border"
                      >
                        {ex.category}
                      </span>
                      {ex.equipment && (
                        <span className="text-xs text-muted-foreground">
                          {ex.equipment}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all border border-accent/30 text-accent bg-accent/5 hover:bg-accent/15"
                >
                  Log in to start tracking →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Platform Section ───────────────────────────────────────────── */}
        <section id="platform" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-primary">
                Built to scale
              </p>
              <h2
                className="text-4xl font-black tracking-tight sm:text-5xl mb-6 text-foreground"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                A complete SaaS shell,{" "}
                <span className="text-primary">ready to ship</span>
              </h2>
              <ul className="space-y-4">
                {[
                  "Fixed sidebar with role-aware navigation and active states",
                  "Sortable, paginated admin data tables with search & filters",
                  "KPI cards, growth line charts and role distribution charts",
                  "Audit trail of every administrative action",
                  "Mifflin-St Jeor BMR and TDEE calculations for nutrition goals",
                  "Multi-theme dark and light mode support across all screens",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock dashboard card */}
            <div
              className="rounded-2xl p-6 border border-border bg-card shadow-lg"
            >
              <div className="flex items-center gap-2 border-b border-border pb-4 mb-5">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">dashboard / overview</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: "Total Workouts", value: "284", color: "#84cc16" },
                  { label: "Streak Days", value: "12", color: "#06b6d4" },
                  { label: "Daily Calories", value: "2,450", color: "#a855f7" },
                  { label: "Volume (kg)", value: "18.4k", color: "#f59e0b" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-4 border border-border bg-muted/40"
                  >
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p
                      className="text-xl font-black"
                      style={{ fontFamily: "var(--font-outfit)", color: stat.color }}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
              <div
                className="rounded-xl p-4 border border-primary/20 bg-primary/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">Volume trend</p>
                  <span className="text-xs font-semibold text-primary">↑ 12%</span>
                </div>
                <div className="flex items-end gap-1 h-12">
                  {[40, 55, 45, 70, 60, 80, 75, 90, 85, 95, 88, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t"
                      style={{
                        height: `${h}%`,
                        backgroundColor: i >= 9 ? "var(--color-primary)" : "rgba(132,204,22,0.3)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
          <div
            className="rounded-3xl px-8 py-20 border border-primary/25 bg-card shadow-lg"
          >
            <h2
              className="text-4xl font-black tracking-tight sm:text-5xl mb-5 text-foreground"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Ready to hit your goals?
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground mb-10">
              Create a free account and start logging workouts today with real-time biometric tracking.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="rounded-xl px-8 py-3.5 text-sm font-bold transition-all bg-primary text-primary-foreground shadow-md hover:opacity-90"
              >
                Create free account
              </Link>
              <Link
                href="/login"
                className="rounded-xl px-8 py-3.5 text-sm font-semibold transition-all border border-border bg-muted/60 text-foreground hover:bg-muted"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-10 bg-card/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 border border-primary/30"
            >
              <Dumbbell className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-outfit)" }}>
              SmartFitness
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
            >
              ● Live
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SmartFitness — Smart Fitness Management System
          </p>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
