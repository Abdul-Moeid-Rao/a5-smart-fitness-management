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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GrowthChart, type GrowthPoint } from "@/components/charts/growth-chart";
import { RoleDistribution } from "@/components/charts/role-distribution";
import { SimpleAreaChart } from "@/components/charts/bar-chart";
import { cn } from "@/lib/utils";

interface StatsResponse {
  kpis: {
    totalUsers: number;
    activeToday: number;
    newSignups: number;
    sessions: number;
    suspendedUsers: number;
    exercises: number;
    articles: number;
    apiKeys: number;
    auditLogs: number;
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
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">
          Site-wide overview of users, sessions and platform health.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", key: "totalUsers", icon: Users },
          { label: "Active Today", key: "activeToday", icon: Activity },
          { label: "New Signups (7d)", key: "newSignups", icon: UserPlus },
          { label: "Active Sessions", key: "sessions", icon: Radio },
        ].map((kpi) => (
          <Card key={kpi.key}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">{kpi.label}</p>
                {data ? (
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {data.kpis[kpi.key as keyof StatsResponse["kpis"]].toLocaleString()}
                  </p>
                ) : (
                  <Skeleton className="mt-2 h-7 w-16" />
                )}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <kpi.icon className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>User growth</CardTitle>
              <CardDescription>Total user count over the last 30 days</CardDescription>
            </div>
            {data && (
              <Badge variant="success">
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

        <Card>
          <CardHeader>
            <CardTitle>Role distribution</CardTitle>
            <CardDescription>Users by role</CardDescription>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active sessions</CardTitle>
            <CardDescription>New sessions over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {data ? (
              <SimpleAreaChart data={data.sessionsSeries} xKey="date" areaKey="sessions" areaLabel="Sessions" />
            ) : (
              <Skeleton className="h-[260px] w-full" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin activity</CardTitle>
            <CardDescription>Audit-log actions over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {data ? (
              <SimpleAreaChart data={data.activitySeries} xKey="date" areaKey="actions" areaLabel="Actions" />
            ) : (
              <Skeleton className="h-[260px] w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data &&
          [
            { label: "Exercises", value: data.kpis.exercises, icon: Dumbbell },
            { label: "Published articles", value: data.kpis.articles, icon: BookOpenText },
            { label: "API keys", value: data.kpis.apiKeys, icon: KeyRound },
            { label: "Audit events", value: data.kpis.auditLogs, icon: FileClock },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100">
                  <stat.icon className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {data && data.kpis.suspendedUsers > 0 && (
        <div className={cn("flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800")}>
          <AlertTriangle className="h-4 w-4" />
          <span>
            <span className="font-semibold">{data.kpis.suspendedUsers}</span> user(s) are currently
            suspended. Review them in{" "}
            <a href="/admin/users" className="font-medium underline">
              User Management
            </a>
            .
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load stats: {error}
        </div>
      )}
    </div>
  );
}
