"use client";

import * as React from "react";
import {
  Users,
  Activity,
  UserPlus,
  Radio,
  Dumbbell,
  BookOpenText,
  KeyRound,
  FileClock,
  AlertTriangle,
  Flame,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GrowthChart, type GrowthPoint } from "@/components/charts/growth-chart";
import { RoleDistribution } from "@/components/charts/role-distribution";
import { SimpleAreaChart } from "@/components/charts/bar-chart";

interface StatsResponse {
  kpis: {
    totalUsers: number;
    activeToday: number;
    newSignups: number;
    sessions: number;
    suspendedUsers: number;
    adminUsers: number;
    exercises: number;
    articles: number;
    apiKeys: number;
    auditLogs: number;
    activeLogsToday: number;
    globalVolumeLifted: number;
  };
  roleDistribution: { role: string; count: number }[];
  growth: GrowthPoint[];
  sessionsSeries: { date: string; sessions: number }[];
  activitySeries: { date: string; actions: number }[];
  period: { from: string; to: string };
}

export function AdminDashboardClient() {
  const [data, setData] = React.useState<StatsResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error);
        setData(json.data);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1
          className="text-3xl font-black tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Admin Console & Metrics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-wide surveillance of active users, workouts logged, volume metrics and system security.
        </p>
      </div>

      {/* Primary Global Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Registered Users", key: "totalUsers", icon: Users, color: "#84cc16" },
          { label: "Active Logs Today", key: "activeLogsToday", icon: Flame, color: "#06b6d4" },
          { label: "Global Volume Lifted (kg)", key: "globalVolumeLifted", icon: Dumbbell, color: "#a855f7" },
          { label: "System Admins", key: "adminUsers", icon: ShieldAlert, color: "#f59e0b" },
        ].map((kpi) => (
          <div
            key={kpi.key}
            className="rounded-2xl p-5 transition-all duration-200 border border-border bg-card shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground">{kpi.label}</span>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: `${kpi.color}15`, border: `1px solid ${kpi.color}30` }}
              >
                <kpi.icon className="h-4.5 w-4.5" style={{ color: kpi.color }} />
              </div>
            </div>
            {data ? (
              <p
                className="text-2xl font-black text-foreground"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {data.kpis[kpi.key as keyof StatsResponse["kpis"]].toLocaleString()}
              </p>
            ) : (
              <Skeleton className="mt-2 h-8 w-20" />
            )}
          </div>
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Today", key: "activeToday", icon: Activity },
          { label: "Signups (7d)", key: "newSignups", icon: UserPlus },
          { label: "Live Sessions", key: "sessions", icon: Radio },
          { label: "Master Exercises", key: "exercises", icon: Dumbbell },
        ].map((kpi) => (
          <div
            key={kpi.key}
            className="rounded-2xl p-4 flex items-center justify-between border border-border bg-muted/40 shadow-sm"
          >
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase">{kpi.label}</p>
              {data ? (
                <p className="text-lg font-bold text-foreground mt-0.5">
                  {data.kpis[kpi.key as keyof StatsResponse["kpis"]].toLocaleString()}
                </p>
              ) : (
                <Skeleton className="mt-1 h-5 w-12" />
              )}
            </div>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-3xl border border-border bg-card shadow-sm">
          <CardHeader className="flex-row items-start justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-base font-bold text-foreground">User Growth Trajectory</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Cumulative registered accounts across 30 days</CardDescription>
            </div>
            {data && (
              <Badge variant="success" className="bg-lime-500/10 text-lime-600 dark:text-lime-400 border border-lime-500/20">
                +{data.kpis.newSignups} this week
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {data ? (
              <GrowthChart data={data.growth} />
            ) : (
              <Skeleton className="h-[280px] w-full" />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-foreground">Role Distribution</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">System partition by privileges</CardDescription>
          </CardHeader>
          <CardContent>
            {data ? (
              <RoleDistribution data={data.roleDistribution} />
            ) : (
              <Skeleton className="h-[260px] w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border border-border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-foreground">Active Session Load</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Session token issuances over 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {data ? (
              <SimpleAreaChart data={data.sessionsSeries} xKey="date" areaKey="sessions" areaLabel="Sessions" />
            ) : (
              <Skeleton className="h-[240px] w-full" />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-foreground">System Audit Events</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Mutation and RBAC change activity</CardDescription>
          </CardHeader>
          <CardContent>
            {data ? (
              <SimpleAreaChart data={data.activitySeries} xKey="date" areaKey="actions" areaLabel="Events" />
            ) : (
              <Skeleton className="h-[240px] w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Badges */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data &&
          [
            { label: "Master Exercises", value: data.kpis.exercises, icon: Dumbbell, href: "/admin/content" },
            { label: "Published Articles", value: data.kpis.articles, icon: BookOpenText, href: "/admin/content" },
            { label: "API Keys Generated", value: data.kpis.apiKeys, icon: KeyRound, href: "/settings" },
            { label: "Audit Log Records", value: data.kpis.auditLogs, icon: FileClock, href: "/admin/reports" },
          ].map((stat) => (
            <a
              key={stat.label}
              href={stat.href}
              className="rounded-2xl p-4 flex items-center gap-3 border border-border bg-card hover:border-primary/40 transition-all shadow-sm group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/15 group-hover:text-primary transition-colors text-muted-foreground">
                <stat.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-base font-black text-foreground" style={{ fontFamily: "var(--font-outfit)" }}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </a>
          ))}
      </div>

      {data && data.kpis.suspendedUsers > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>
            <span className="font-bold">{data.kpis.suspendedUsers}</span> user(s) are currently suspended. Review or reinstate them in{" "}
            <a href="/admin/users" className="font-semibold underline hover:opacity-80">
              User Management
            </a>
            .
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">
          Could not load admin metrics: {error}
        </div>
      )}
    </div>
  );
}
