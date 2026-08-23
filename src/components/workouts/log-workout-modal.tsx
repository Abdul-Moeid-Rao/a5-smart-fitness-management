"use client";

import * as React from "react";
import { Dumbbell, Plus, Trash2, X, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
  difficulty: string;
}

interface SetRow {
  setNumber: number;
  weightKg: string;
  reps: string;
  rpe: string;
}

interface RecentLog {
  id: string;
  loggedAt: string;
  exercise: { name: string; muscleGroup: string };
  setsCount: number;
  totalVolume: number;
}

interface LogWorkoutModalProps {
  exercises: Exercise[];
  defaultExercise: Exercise | null;
  onClose: () => void;
  onLogged: (newLog: RecentLog) => void;
}

export function LogWorkoutModal({
  exercises,
  defaultExercise,
  onClose,
  onLogged,
}: LogWorkoutModalProps) {
  const [exerciseId, setExerciseId] = React.useState(defaultExercise?.id ?? exercises[0]?.id ?? "");
  const [notes, setNotes] = React.useState("");
  const [sets, setSets] = React.useState<SetRow[]>([
    { setNumber: 1, weightKg: "60", reps: "10", rpe: "8" },
    { setNumber: 2, weightKg: "60", reps: "10", rpe: "8.5" },
    { setNumber: 3, weightKg: "65", reps: "8", rpe: "9" },
  ]);
  const [loading, setLoading] = React.useState(false);

  const selectedExercise = exercises.find((e) => e.id === exerciseId);

  function addSet() {
    const lastSet = sets[sets.length - 1];
    setSets((prev) => [
      ...prev,
      {
        setNumber: prev.length + 1,
        weightKg: lastSet ? lastSet.weightKg : "50",
        reps: lastSet ? lastSet.reps : "10",
        rpe: lastSet ? lastSet.rpe : "8",
      },
    ]);
  }

  function removeSet(index: number) {
    if (sets.length === 1) {
      toast.error("You need at least one set");
      return;
    }
    setSets((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, setNumber: i + 1 }))
    );
  }

  function updateSet(index: number, field: keyof SetRow, value: string) {
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!exerciseId) {
      toast.error("Please select an exercise");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        exerciseId,
        notes: notes.trim() || undefined,
        sets: sets.map((s) => ({
          setNumber: s.setNumber,
          weightKg: s.weightKg ? parseFloat(s.weightKg) : null,
          reps: s.reps ? parseInt(s.reps, 10) : null,
          rpe: s.rpe ? Math.min(10, Math.max(1, parseFloat(s.rpe))) : null,
        })),
      };

      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to log workout");

      toast.success(`Workout logged! Total sets: ${sets.length}`);
      
      const totalVolume = payload.sets.reduce((sum, s) => sum + (s.weightKg ?? 0) * (s.reps ?? 0), 0);
      onLogged({
        id: json.data.id,
        loggedAt: new Date().toISOString(),
        exercise: {
          name: selectedExercise?.name ?? "Exercise",
          muscleGroup: selectedExercise?.muscleGroup ?? "General",
        },
        setsCount: sets.length,
        totalVolume,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error logging workout";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 relative shadow-2xl border border-border bg-card text-foreground"
        style={{
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30"
            >
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2
                className="text-xl font-black tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Log Workout Session
              </h2>
              <p className="text-xs text-muted-foreground">
                Track dynamic set weights, completed reps & RPE rating
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exercise Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Exercise
            </label>
            <select
              value={exerciseId}
              onChange={(e) => setExerciseId(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all border border-border bg-muted/40 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {exercises.map((ex) => (
                <option
                  key={ex.id}
                  value={ex.id}
                  className="bg-card text-foreground"
                >
                  {ex.name} ({ex.muscleGroup} • {ex.category})
                </option>
              ))}
            </select>
          </div>

          {/* Sets Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sets & Reps Breakdown
              </label>
              <button
                type="button"
                onClick={addSet}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition-all bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Set
              </button>
            </div>

            <div
              className="rounded-2xl p-3 space-y-2.5 overflow-hidden border border-border bg-muted/30"
            >
              <div className="grid grid-cols-12 gap-2 px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span className="col-span-2">Set</span>
                <span className="col-span-4">Weight (kg)</span>
                <span className="col-span-3">Reps</span>
                <span className="col-span-2">RPE (1-10)</span>
                <span className="col-span-1 text-right"></span>
              </div>

              {sets.map((set, idx) => (
                <div
                  key={set.setNumber}
                  className="grid grid-cols-12 gap-2 items-center rounded-xl p-2 transition-colors border border-border bg-card"
                >
                  <div className="col-span-2 font-bold text-sm px-1 text-primary">
                    #{set.setNumber}
                  </div>

                  <div className="col-span-4">
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 60"
                      value={set.weightKg}
                      onChange={(e) => updateSet(idx, "weightKg", e.target.value)}
                      className="w-full rounded-lg px-3 py-1.5 text-xs text-foreground bg-muted/50 border border-border focus:border-primary outline-none"
                    />
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={set.reps}
                      onChange={(e) => updateSet(idx, "reps", e.target.value)}
                      className="w-full rounded-lg px-3 py-1.5 text-xs text-foreground bg-muted/50 border border-border focus:border-primary outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      placeholder="RPE"
                      value={set.rpe}
                      onChange={(e) => updateSet(idx, "rpe", e.target.value)}
                      className="w-full rounded-lg px-3 py-1.5 text-xs text-foreground bg-muted/50 border border-border focus:border-primary outline-none"
                    />
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeSet(idx)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Remove set"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Session Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Felt strong on the 3rd set, smooth lockout..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl p-3 text-xs text-foreground bg-muted/40 border border-border focus:border-primary outline-none"
            />
          </div>

          {/* Total volume indicator */}
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3 border border-primary/20 bg-primary/5"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Estimated Volume</span>
            </div>
            <span className="text-sm font-bold text-foreground">
              {sets
                .reduce((acc, s) => acc + (parseFloat(s.weightKg) || 0) * (parseInt(s.reps) || 0), 0)
                .toLocaleString()}{" "}
              kg
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl py-3 text-xs font-semibold transition-all border border-border hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all disabled:opacity-60 bg-primary text-primary-foreground shadow-md hover:opacity-90 cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Workout Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
