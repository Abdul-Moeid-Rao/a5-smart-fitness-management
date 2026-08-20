"use client";

import * as React from "react";
import { BarChart3, FileText, Dumbbell, ShieldCheck, Activity } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, timeAgo } from "@/lib/utils";

interface ReportData {
  userSeries: { label: string; signups: number }[];
  roleDistribution: { key: string; value: number }[];
  statusDistribution: { key: string; value: number }[];
  planDistribution: { key: string; value: number }[];
  content: { publishedExercises: number; publishedArticles: number };
  topActions: { action: string; count: number }[];
  recentAudit: {
    id: string;
    action: string;
    entityType: string | null;
    entityId: string | null;
    ipAddress: string | null;
    createdAt: string;
    actor: { id: string; name: string | null; image: string | null } | null;
  }[];
  totalAuditLogs: number;
}

export function ReportsClient() {
  const [data, setData] = React.useState<ReportData | null>(null);

  React.useEffect(() => {
    fetch("/api/admin/reports")
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error);
        setData(json.data);
      })
      .catch((e) => toast.error(e.message));
  }, []);

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500">Growth, engagement and audit insights.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[280px]" />
          <Skeleton className="h-[280px]" />
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  const distributionCards = [
    { title: "Role distribution", data: data.roleDistribution, color: "bg-blue-500" },
    { title: "Account status", data: data.statusDistribution, color: "bg-emerald-500" },
    { title: "Plan distribution", data: data.planDistribution, color: "bg-violet-500" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500">Growth, engagement and audit insights.</p>
        </div>
        <Badge variant="outline">{data.totalAuditLogs.toLocaleString()} audit events</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Dumbbell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-900">{data.content.publishedExercises}</p>
              <p className="text-sm text-slate-500">Published exercises</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-900">{data.content.publishedArticles}</p>
              <p className="text-sm text-slate-500">Published articles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-900">{data.topActions[0]?.count ?? 0}</p>
              <p className="text-sm text-slate-500">Most common action</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signups — last 6 months</CardTitle>
          <CardDescription>New user registrations per month</CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleBarChart
            data={data.userSeries.map((p) => ({ ...p, label: p.label }))}
            xKey="label"
            barKey="signups"
            barLabel="Signups"
            height={280}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {distributionCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle className="text-sm">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {card.data.map((item) => {
                const total = card.data.reduce((a, b) => a + b.value, 0);
                const pct = total ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="capitalize text-slate-600">{item.key}</span>
                      <span className="font-medium text-slate-900">{item.value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full ${card.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Top actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topActions.map((action, index) => (
              <div key={action.action} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-500">
                    {index + 1}
                  </span>
                  <code className="text-xs">{action.action}</code>
                </span>
                <span className="font-semibold text-slate-900">{action.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              Recent audit events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentAudit.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={log.actor?.image ?? undefined} />
                          <AvatarFallback>{initials(log.actor?.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{log.actor?.name ?? "System"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{log.action}</code>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{timeAgo(log.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
