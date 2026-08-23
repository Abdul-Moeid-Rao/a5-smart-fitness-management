"use client";

import * as React from "react";
import {
  Dumbbell, Flame, Zap, TrendingUp, Calendar, Target,
  Trash2, ChevronDown, ChevronUp, BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface WorkoutSet {
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  rpe: number | null;
}

interface WorkoutLog {
  id: string;
  loggedAt: string;
  notes: string | null;
  exercise: { name: string; muscleGroup: string; category: string };
  sets: WorkoutSet[];
  totalVolume: number;
}

interface DashboardClientProps {
  user: {
    name?: string | null;
    email: string;
    role: string;
    plan: string;
    createdAt: string;
  };
  stats: {
    totalWorkouts: number;
    streakDays: number;
    tdee: number | null;
    exerciseCount: number;
    currentWeight: number | null;
    goalWeight: number | null;
  };
  recentLogs: WorkoutLog[];
}

export function DashboardClient({ user, stats, recentLogs }: DashboardClientProps) {
  const [logs, setLogs] = React.useState(recentLogs);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const firstName = user.name?.split(" ")[0] ?? "there";

  // Animated counter
  function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
    const [count, setCount] = React.useState(0);
    React.useEffect(() => {
      let start = 0;
      const steps = 40;
      const increment = target / steps;
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 30);
      return () => clearInterval(timer);
    }, [target]);
    return <span>{count.toLocaleString()}{suffix}</span>;
  }

  async function deleteLog(id: string) {
    const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLogs((prev) => prev.filter((l) => l.id !== id));
      toast.success("Workout deleted");
    } else {
      toast.error("Failed to delete workout");
    }
  }

  const STAT_CARDS = [
    {
      label: "Total Workouts",
      value: stats.totalWorkouts,
      suffix: "",
      icon: Dumbbell,
      color: "#84cc16",
      desc: "sessions logged",
    },
    {
      label: "Streak",
      value: stats.streakDays,
      suffix: " days",
      icon: Flame,
      color: "#f59e0b",
      desc: "consecutive days",
    },
    {
      label: "Daily Calories",
      value: stats.tdee ?? 0,
      suffix: " kcal",
      icon: Zap,
      color: "#06b6d4",
      desc: stats.tdee ? "TDEE goal" : "update profile",
    },
    {
      label: "Current Weight",
      value: stats.currentWeight ? Math.round(stats.currentWeight * 10) / 10 : 0,
      suffix: " kg",
      icon: Target,
      color: "#a855f7",
      desc: stats.goalWeight ? `Goal: ${stats.goalWeight} kg` : "update profile",
    },
  ];

  const muscleGroupColors: Record<string, string> = {
    Chest: "#ef4444", Back: "#06b6d4", Legs: "#84cc16", Core: "#f59e0b",
    Arms: "#a855f7", Shoulders: "#ec4899", Hips: "#f97316", "Full Body": "#14b8a6",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* ── Welcome Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-black tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Member since {formatDate(user.createdAt)} ·{" "}
            <span
              className="capitalize rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
            >
              {user.role}
            </span>
          </p>
        </div>
        <a
          href="/workouts"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all bg-primary text-primary-foreground shadow-md hover:opacity-90 cursor-pointer"
        >
          <Dumbbell className="h-4 w-4" />
          Log Workout
        </a>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-5 transition-all duration-200 border border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
            </div>
            <p
              className="text-2xl font-black mb-1 text-foreground"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {stat.value > 0 ? (
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              ) : (
                <span className="text-muted-foreground text-base">—</span>
              )}
            </p>
            <p className="text-xs font-semibold text-muted-foreground mb-0.5">{stat.label}</p>
            <p className="text-xs font-medium" style={{ color: stat.color }}>{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Recent Activity ─────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              Recent Workouts
            </h2>
            <a href="/workouts" className="text-xs font-semibold text-primary hover:underline">
              View all →
            </a>
          </div>

          {logs.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center border border-border bg-card"
            >
              <Dumbbell className="h-10 w-10 mx-auto mb-3 opacity-20 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No workouts logged yet.</p>
              <a
                href="/workouts"
                className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Log your first workout →
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const color = muscleGroupColors[log.exercise.muscleGroup] ?? "#64748b";
                const isExpanded = expandedId === log.id;
                return (
                  <div
                    key={log.id}
                    className="rounded-2xl overflow-hidden transition-all border border-border bg-card shadow-sm"
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                      >
                        <Dumbbell className="h-4.5 w-4.5" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate text-foreground">
                          {log.exercise.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.exercise.muscleGroup} · {log.sets.length} sets
                          {log.totalVolume > 0 && ` · ${Math.round(log.totalVolume).toLocaleString()} kg total`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.loggedAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => deleteLog(log.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete workout"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                          title="Toggle set details"
                        >
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && log.sets.length > 0 && (
                      <div className="px-4 pb-4 border-t border-border pt-3">
                        <div className="rounded-xl overflow-hidden border border-border">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="px-3 py-2 text-left text-muted-foreground font-semibold">Set</th>
                                <th className="px-3 py-2 text-left text-muted-foreground font-semibold">Weight</th>
                                <th className="px-3 py-2 text-left text-muted-foreground font-semibold">Reps</th>
                                <th className="px-3 py-2 text-left text-muted-foreground font-semibold">RPE</th>
                              </tr>
                            </thead>
                            <tbody>
                              {log.sets.map((s) => (
                                <tr key={s.setNumber} className="border-t border-border">
                                  <td className="px-3 py-2 font-bold" style={{ color: color }}>#{s.setNumber}</td>
                                  <td className="px-3 py-2 text-foreground font-medium">{s.weightKg ? `${s.weightKg} kg` : "BW"}</td>
                                  <td className="px-3 py-2 text-foreground font-medium">{s.reps ?? "—"}</td>
                                  <td className="px-3 py-2 text-foreground font-medium">{s.rpe ?? "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {log.notes && (
                          <p className="mt-2 text-xs text-muted-foreground italic">"{log.notes}"</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Sidebar stats ────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div
            className="rounded-2xl p-5 border border-border bg-card shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                Quick Stats
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Exercises available", value: stats.exerciseCount },
                { label: "This month", value: logs.filter(l => new Date(l.loggedAt).getMonth() === new Date().getMonth()).length + " sessions" },
                { label: "Total volume (recent)", value: logs.reduce((s, l) => s + l.totalVolume, 0) > 0 ? `${Math.round(logs.reduce((s, l) => s + l.totalVolume, 0)).toLocaleString()} kg` : "—" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-bold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl p-5 border border-primary/20 bg-primary/5"
          >
            <TrendingUp className="h-8 w-8 mb-3 text-primary" />
            <h3 className="text-sm font-bold mb-2 text-foreground">
              Keep it up!
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {stats.streakDays > 0
                ? `You're on a ${stats.streakDays}-day streak. Don't break the chain!`
                : "Log a workout today to start your streak."}
            </p>
            <a
              href="/workouts"
              className="block text-center rounded-xl py-2.5 text-xs font-bold transition-all bg-primary text-primary-foreground shadow-sm hover:opacity-90"
            >
              Log workout
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
