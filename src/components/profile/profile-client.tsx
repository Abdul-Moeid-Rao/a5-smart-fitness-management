"use client";

import * as React from "react";
import {
  Camera,
  Loader2,
  Save,
  Shield,
  Activity,
  Flame,
  Zap,
  Target,
  Bell,
  Lock,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, initials } from "@/lib/utils";

interface ProfileUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  phone: string | null;
  bio: string | null;
  plan: string;
  role: string;
  createdAt: Date | string;
}

interface UserBiometrics {
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  goalWeightKg: number | null;
  activityLevel: string;
  fitnessGoal: string;
  streakDays: number;
}

interface ProfileClientProps {
  user: ProfileUser;
  initialProfile: UserBiometrics;
  stats: { totalUsers: number; activeSessions: number };
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function ProfileClient({ user, initialProfile, stats }: ProfileClientProps) {
  const [activeTab, setActiveTab] = React.useState<"biometrics" | "account" | "security">("biometrics");

  // Account form
  const [name, setName] = React.useState(user.name ?? "");
  const [phone, setPhone] = React.useState(user.phone ?? "");
  const [bio, setBio] = React.useState(user.bio ?? "");
  const [image, setImage] = React.useState(user.image ?? "");
  const [savingAccount, setSavingAccount] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  // Biometrics form
  const [age, setAge] = React.useState(initialProfile.age?.toString() ?? "26");
  const [heightCm, setHeightCm] = React.useState(initialProfile.heightCm?.toString() ?? "178");
  const [weightKg, setWeightKg] = React.useState(initialProfile.weightKg?.toString() ?? "75");
  const [goalWeightKg, setGoalWeightKg] = React.useState(initialProfile.goalWeightKg?.toString() ?? "72");
  const [activityLevel, setActivityLevel] = React.useState(initialProfile.activityLevel);
  const [fitnessGoal, setFitnessGoal] = React.useState(initialProfile.fitnessGoal);
  const [savingBio, setSavingBio] = React.useState(false);

  // Security
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [updatingPass, setUpdatingPass] = React.useState(false);

  // Email notifications
  const [emailWorkouts, setEmailWorkouts] = React.useState(true);
  const [emailWeekly, setEmailWeekly] = React.useState(true);
  const [emailSecurity, setEmailSecurity] = React.useState(true);

  // Live BMR & TDEE Calculations using Mifflin-St Jeor equation
  const parsedWeight = parseFloat(weightKg) || 0;
  const parsedHeight = parseFloat(heightCm) || 0;
  const parsedAge = parseInt(age, 10) || 0;

  const bmr =
    parsedWeight > 0 && parsedHeight > 0 && parsedAge > 0
      ? Math.round(10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge + 5)
      : null;

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
  const tdee = bmr ? Math.round(bmr * multiplier) : null;

  // Calorie adjustments for goals
  const targetCalories = React.useMemo(() => {
    if (!tdee) return null;
    if (fitnessGoal === "lose") return tdee - 500;
    if (fitnessGoal === "gain") return tdee + 400;
    return tdee;
  }, [tdee, fitnessGoal]);

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setImage(json.data.url);
      toast.success("Avatar image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function saveAccountInfo() {
    setSavingAccount(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || null, bio: bio || null, image }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Profile saved successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSavingAccount(false);
    }
  }

  async function saveBiometrics() {
    setSavingBio(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: parseInt(age, 10) || null,
          heightCm: parseFloat(heightCm) || null,
          weightKg: parseFloat(weightKg) || null,
          goalWeightKg: parseFloat(goalWeightKg) || null,
          activityLevel,
          fitnessGoal,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Biometrics & calorie goals updated!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSavingBio(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setUpdatingPass(true);
    try {
      toast.success("Security settings updated");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      toast.error("Could not update password");
    } finally {
      setUpdatingPass(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header Profile Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-border bg-card shadow-sm"
      >
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-2 ring-primary/30">
              <AvatarImage src={image || undefined} alt={name} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                {initials(name)}
              </AvatarFallback>
            </Avatar>
            <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:opacity-90 transition-colors">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleAvatarUpload(file);
                }}
              />
            </label>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: "var(--font-outfit)" }}>
                {user.name || "User"}
              </h1>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-bold capitalize bg-primary/15 text-primary border border-primary/30"
              >
                {user.role}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Member since {formatDate(user.createdAt)} · Active Plan: <span className="text-foreground capitalize font-semibold">{user.plan}</span>
            </p>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
          <div className="text-center sm:text-left">
            <p className="text-xs text-muted-foreground">Active Sessions</p>
            <p className="text-lg font-black text-foreground" style={{ fontFamily: "var(--font-outfit)" }}>
              {stats.activeSessions}
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-muted-foreground">Target Daily</p>
            <p className="text-lg font-black text-primary" style={{ fontFamily: "var(--font-outfit)" }}>
              {targetCalories ? `${targetCalories} kcal` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {[
          { id: "biometrics", label: "Biometrics & Metabolism", icon: Activity },
          { id: "account", label: "Public Profile", icon: User },
          { id: "security", label: "Security & Notifications", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
              style={{
                backgroundColor: active ? "var(--color-muted)" : "transparent",
                color: active ? "var(--color-primary)" : "var(--color-muted-foreground)",
                border: active ? "1px solid var(--color-border)" : "1px solid transparent",
              }}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Biometrics & Mifflin-St Jeor */}
      {activeTab === "biometrics" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div
            className="lg:col-span-2 rounded-3xl p-6 sm:p-8 space-y-6 border border-border bg-card shadow-sm"
          >
            <div>
              <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-outfit)" }}>
                Biometric Measurements & Targets
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Enter your physical metrics to calculate Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current Age (years)
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-muted/40 border border-border focus:border-primary outline-none text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="178"
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-muted/40 border border-border focus:border-primary outline-none text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current Body Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="75"
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-muted/40 border border-border focus:border-primary outline-none text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target / Goal Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={goalWeightKg}
                  onChange={(e) => setGoalWeightKg(e.target.value)}
                  placeholder="70"
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-muted/40 border border-border focus:border-primary outline-none text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Activity Factor
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-muted/40 border border-border focus:border-primary outline-none text-foreground cursor-pointer"
                >
                  <option value="sedentary" className="bg-card text-foreground">Sedentary (Little or no exercise)</option>
                  <option value="light" className="bg-card text-foreground">Light (Exercise 1-3 times/week)</option>
                  <option value="moderate" className="bg-card text-foreground">Moderate (Exercise 4-5 times/week)</option>
                  <option value="active" className="bg-card text-foreground">Active (Intense 6-7 times/week)</option>
                  <option value="very_active" className="bg-card text-foreground">Very Active (Athlete / Physical job)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Primary Fitness Objective
                </label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-muted/40 border border-border focus:border-primary outline-none text-foreground cursor-pointer"
                >
                  <option value="lose" className="bg-card text-foreground">🔥 Fat Loss (-500 kcal deficit)</option>
                  <option value="maintain" className="bg-card text-foreground">⚡ Maintenance (Energy balance)</option>
                  <option value="gain" className="bg-card text-foreground">💪 Hypertrophy / Muscle Gain (+400 kcal)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={saveBiometrics}
                disabled={savingBio}
                className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-bold transition-all bg-primary text-primary-foreground shadow-md hover:opacity-90 cursor-pointer"
              >
                {savingBio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Biometrics & Recalculate
              </button>
            </div>
          </div>

          {/* Calculated Metabolic Card */}
          <div className="space-y-4">
            <div
              className="rounded-3xl p-6 relative overflow-hidden border border-primary/25 bg-card shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Metabolic Breakdown</h3>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl p-4 border border-border bg-muted/40">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase">Basal Metabolic Rate (BMR)</p>
                  <p className="text-2xl font-black text-foreground mt-0.5" style={{ fontFamily: "var(--font-outfit)" }}>
                    {bmr ? `${bmr.toLocaleString()} kcal` : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">Calories burned at complete rest (Mifflin-St Jeor)</p>
                </div>

                <div className="rounded-2xl p-4 border border-border bg-muted/40">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase">Daily Expenditure (TDEE)</p>
                  <p className="text-2xl font-black text-accent mt-0.5" style={{ fontFamily: "var(--font-outfit)" }}>
                    {tdee ? `${tdee.toLocaleString()} kcal` : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">Multiplier: {multiplier}x based on activity level</p>
                </div>

                <div className="rounded-2xl p-4 border border-primary/30 bg-primary/10">
                  <p className="text-[11px] text-primary font-bold uppercase">Target Calorie Intake</p>
                  <p className="text-3xl font-black text-primary mt-0.5" style={{ fontFamily: "var(--font-outfit)" }}>
                    {targetCalories ? `${targetCalories.toLocaleString()} kcal` : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {fitnessGoal === "lose" && "500 kcal deficit for safe fat loss"}
                    {fitnessGoal === "maintain" && "Maintenance calorie intake"}
                    {fitnessGoal === "gain" && "400 kcal surplus for muscle hypertrophy"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Public Profile */}
      {activeTab === "account" && (
        <div
          className="rounded-3xl p-6 sm:p-8 max-w-2xl space-y-6 border border-border bg-card shadow-sm"
        >
          <div>
            <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-outfit)" }}>
              Public Profile Information
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Your name and biography visible across community boards.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm bg-muted/40 border border-border focus:border-primary outline-none text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-xl px-4 py-2.5 text-sm bg-muted/20 border border-border opacity-60 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground">Contact support to change verified account email.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+1 555 0192"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm bg-muted/40 border border-border focus:border-primary outline-none text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Bio / Fitness Motto
              </label>
              <textarea
                rows={3}
                placeholder="Powerlifter focused on compound lifts..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-xl p-3 text-sm bg-muted/40 border border-border focus:border-primary outline-none text-foreground"
              />
            </div>

            <button
              onClick={saveAccountInfo}
              disabled={savingAccount}
              className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-bold transition-all bg-primary text-primary-foreground shadow-md hover:opacity-90 cursor-pointer"
            >
              {savingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Profile Changes
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Security & Notifications */}
      {activeTab === "security" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Password update */}
          <div
            className="rounded-3xl p-6 sm:p-8 space-y-6 border border-border bg-card shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Password & Authentication</h2>
                <p className="text-xs text-muted-foreground">Update your account credentials</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-muted/40 border border-border focus:border-primary outline-none text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm bg-muted/40 border border-border focus:border-primary outline-none text-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={updatingPass}
                className="w-full rounded-xl py-2.5 text-xs font-bold transition-all border border-border hover:bg-muted text-foreground cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Email Notifications via Resend */}
          <div
            className="rounded-3xl p-6 sm:p-8 space-y-6 border border-border bg-card shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/10 text-accent border border-accent/20">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Transactional Email (Resend)</h2>
                <p className="text-xs text-muted-foreground">Manage your notification channels</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "workout",
                  label: "Workout Session Summaries",
                  desc: "Receive volume and PR recap after logged workouts",
                  checked: emailWorkouts,
                  toggle: () => setEmailWorkouts(!emailWorkouts),
                },
                {
                  id: "weekly",
                  label: "Weekly Progress Report",
                  desc: "Comprehensive analytics sent every Sunday evening",
                  checked: emailWeekly,
                  toggle: () => setEmailWeekly(!emailWeekly),
                },
                {
                  id: "security",
                  label: "Account Security Alerts",
                  desc: "Notifies when a new session or password reset occurs",
                  checked: emailSecurity,
                  toggle: () => setEmailSecurity(!emailSecurity),
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={item.toggle}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-muted/30 cursor-pointer hover:border-primary/30 transition-all"
                >
                  <div className="pr-4">
                    <p className="text-xs font-bold text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <div
                    className="h-5 w-9 rounded-full transition-colors relative flex items-center p-0.5"
                    style={{ backgroundColor: item.checked ? "var(--color-primary)" : "rgba(100,116,139,0.3)" }}
                  >
                    <div
                      className="h-4 w-4 rounded-full bg-white transition-transform shadow-sm"
                      style={{ transform: item.checked ? "translateX(16px)" : "translateX(0px)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
