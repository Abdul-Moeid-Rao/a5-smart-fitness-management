"use client";

import * as React from "react";
import {
  Dumbbell, Search, X, Plus, Info,
  Flame, Target, Zap, BookOpen,
} from "lucide-react";
import { LogWorkoutModal } from "@/components/workouts/log-workout-modal";

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
  difficulty: string;
  equipment: string | null;
  description: string;
  instructions: string;
}

interface RecentLog {
  id: string;
  loggedAt: string;
  exercise: { name: string; muscleGroup: string };
  setsCount: number;
  totalVolume: number;
}

interface WorkoutPlannerProps {
  exercises: Exercise[];
  recentLogs: RecentLog[];
}

const MUSCLE_GROUPS = ["All", "Chest", "Back", "Legs", "Core", "Arms", "Shoulders", "Hips", "Full Body"];
const DIFFICULTIES = ["All", "beginner", "intermediate", "advanced"];

const difficultyColors: Record<string, string> = {
  beginner: "#22c55e",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

const muscleColors: Record<string, string> = {
  Chest: "#ef4444", Back: "#06b6d4", Legs: "#84cc16", Core: "#f59e0b",
  Arms: "#a855f7", Shoulders: "#ec4899", Hips: "#f97316", "Full Body": "#14b8a6",
};

export function WorkoutPlanner({ exercises, recentLogs }: WorkoutPlannerProps) {
  const [search, setSearch] = React.useState("");
  const [muscleFilter, setMuscleFilter] = React.useState("All");
  const [diffFilter, setDiffFilter] = React.useState("All");
  const [selectedExercise, setSelectedExercise] = React.useState<Exercise | null>(null);
  const [logTarget, setLogTarget] = React.useState<Exercise | null>(null);
  const [logs, setLogs] = React.useState(recentLogs);

  const filtered = exercises.filter((ex) => {
    const matchSearch =
      search === "" ||
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = muscleFilter === "All" || ex.muscleGroup === muscleFilter;
    const matchDiff = diffFilter === "All" || ex.difficulty === diffFilter;
    return matchSearch && matchMuscle && matchDiff;
  });

  function handleLogged(newLog: RecentLog) {
    setLogs((prev) => [newLog, ...prev.slice(0, 4)]);
    setLogTarget(null);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-black tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Workout Planner & Library
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse {exercises.length} exercises · log sets, dynamic weights, reps & RPE
          </p>
        </div>
        <button
          onClick={() => setLogTarget(exercises[0] ?? null)}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all bg-primary text-primary-foreground shadow-md hover:opacity-90 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Log Workout
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-5">
          {/* Search */}
          <div
            className="rounded-2xl p-4 border border-border bg-card shadow-sm"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search exercises…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Muscle Groups */}
          <div
            className="rounded-2xl p-4 border border-border bg-card shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Muscle Group</p>
            <div className="flex flex-col gap-1">
              {MUSCLE_GROUPS.map((m) => {
                const color = muscleColors[m] ?? "#84cc16";
                const active = muscleFilter === m;
                return (
                  <button
                    key={m}
                    onClick={() => setMuscleFilter(m)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-left transition-all cursor-pointer"
                    style={{
                      backgroundColor: active ? `${color}18` : "transparent",
                      color: active ? color : "var(--color-foreground)",
                      border: active ? `1px solid ${color}35` : "1px solid transparent",
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: active ? color : "var(--color-muted-foreground)" }}
                    />
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div
            className="rounded-2xl p-4 border border-border bg-card shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Difficulty</p>
            <div className="flex flex-col gap-1">
              {DIFFICULTIES.map((d) => {
                const color = d === "All" ? "var(--color-primary)" : difficultyColors[d];
                const active = diffFilter === d;
                return (
                  <button
                    key={d}
                    onClick={() => setDiffFilter(d)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold capitalize text-left transition-all cursor-pointer"
                    style={{
                      backgroundColor: active ? `${color}18` : "transparent",
                      color: active ? color : "var(--color-foreground)",
                      border: active ? `1px solid ${color}35` : "1px solid transparent",
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent logs */}
          {logs.length > 0 && (
            <div
              className="rounded-2xl p-4 border border-border bg-card shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Recent Logs</p>
              <div className="space-y-2">
                {logs.map((log) => {
                  const color = muscleColors[log.exercise.muscleGroup] ?? "#84cc16";
                  return (
                    <div key={log.id} className="flex items-center gap-2.5 rounded-xl p-2.5 border border-border bg-muted/30">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate text-foreground">{log.exercise.name}</p>
                        <p className="text-[11px] text-muted-foreground">{log.setsCount} sets{log.totalVolume > 0 ? ` · ${Math.round(log.totalVolume)}kg` : ""}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Exercise Grid ───────────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-bold text-foreground">{filtered.length}</span> exercises
            </p>
          </div>

          {filtered.length === 0 ? (
            <div
              className="rounded-2xl p-16 text-center border border-border bg-card"
            >
              <Search className="h-10 w-10 mx-auto mb-3 opacity-20 text-muted-foreground" />
              <p className="text-muted-foreground text-sm font-medium">No exercises match your filters.</p>
              <button
                onClick={() => { setSearch(""); setMuscleFilter("All"); setDiffFilter("All"); }}
                className="mt-3 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((ex) => {
                const muscleColor = muscleColors[ex.muscleGroup] ?? "#84cc16";
                const diffColor = difficultyColors[ex.difficulty] ?? "#64748b";
                return (
                  <div
                    key={ex.id}
                    className="group rounded-2xl p-5 transition-all duration-200 flex flex-col border border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: `${muscleColor}15`, border: `1px solid ${muscleColor}25` }}
                      >
                        <Dumbbell className="h-4.5 w-4.5" style={{ color: muscleColor }} />
                      </div>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                        style={{
                          backgroundColor: `${diffColor}15`,
                          color: diffColor,
                          border: `1px solid ${diffColor}25`,
                        }}
                      >
                        {ex.difficulty}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm mb-1 text-foreground">
                      {ex.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 flex-1 line-clamp-2">
                      {ex.description}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: `${muscleColor}12`,
                          color: muscleColor,
                          border: `1px solid ${muscleColor}25`,
                        }}
                      >
                        {ex.muscleGroup}
                      </span>
                      {ex.equipment && (
                        <span className="text-xs text-muted-foreground font-medium">{ex.equipment}</span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => setSelectedExercise(ex)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all border border-border bg-muted/40 text-foreground hover:bg-muted cursor-pointer"
                      >
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        Details
                      </button>
                      <button
                        onClick={() => setLogTarget(ex)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer"
                        style={{
                          backgroundColor: `${muscleColor}18`,
                          color: muscleColor,
                          border: `1px solid ${muscleColor}30`,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = muscleColor;
                          (e.currentTarget as HTMLButtonElement).style.color = "#0a0f00";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${muscleColor}18`;
                          (e.currentTarget as HTMLButtonElement).style.color = muscleColor;
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Log
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Exercise Detail Drawer ──────────────────────────────────────── */}
      {selectedExercise && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelectedExercise(null)}
        >
          <div
            className="w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-border bg-card shadow-2xl text-foreground"
            style={{
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5 border-b border-border pb-4">
              <div>
                <h2
                  className="text-xl font-black text-foreground"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {selectedExercise.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedExercise.muscleGroup} · {selectedExercise.category}</p>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: Target, label: "Muscle", value: selectedExercise.muscleGroup, color: muscleColors[selectedExercise.muscleGroup] ?? "#84cc16" },
                { icon: Flame, label: "Difficulty", value: selectedExercise.difficulty, color: difficultyColors[selectedExercise.difficulty] ?? "#64748b" },
                { icon: Zap, label: "Equipment", value: selectedExercise.equipment ?? "None", color: "#06b6d4" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl p-3 text-center border border-border bg-muted/30"
                >
                  <item.icon className="h-4 w-4 mx-auto mb-1" style={{ color: item.color }} />
                  <p className="text-[11px] text-muted-foreground font-semibold">{item.label}</p>
                  <p className="text-xs font-bold capitalize mt-0.5" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{selectedExercise.description}</p>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Step-by-Step Instructions</h3>
              </div>
              <ol className="space-y-2.5">
                {selectedExercise.instructions.split(/\d+\./).filter(Boolean).map((step, i) => (
                  <li key={i} className="flex gap-3 text-xs leading-relaxed text-muted-foreground">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold mt-0.5 bg-primary/15 text-primary border border-primary/30"
                    >
                      {i + 1}
                    </span>
                    {step.trim()}
                  </li>
                ))}
              </ol>
            </div>

            <button
              onClick={() => { setSelectedExercise(null); setLogTarget(selectedExercise); }}
              className="w-full rounded-xl py-3 text-sm font-bold transition-all bg-primary text-primary-foreground shadow-md hover:opacity-90 cursor-pointer"
            >
              Log this exercise →
            </button>
          </div>
        </div>
      )}

      {/* ── Log Workout Modal ─────────────────────────────────────────── */}
      {logTarget && (
        <LogWorkoutModal
          exercises={exercises}
          defaultExercise={logTarget}
          onClose={() => setLogTarget(null)}
          onLogged={handleLogged}
        />
      )}
    </div>
  );
}
