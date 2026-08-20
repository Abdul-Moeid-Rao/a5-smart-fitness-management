import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Dumbbell,
  BookOpenText,
  CreditCard,
  ArrowRight,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { requirePageAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { formatDate, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { user } = await requirePageAuth();

  const [exerciseCount, articleCount, sessionCount, recentExercises, recentArticles] =
    await Promise.all([
      prisma.exercise.count({ where: { isPublished: true } }),
      prisma.article.count({ where: { status: "published" } }),
      prisma.session.count({ where: { userId: user.id, expiresAt: { gt: new Date() } } }),
      prisma.exercise.findMany({
        where: { isPublished: true },
        orderBy: { updatedAt: "desc" },
        take: 4,
      }),
      prisma.article.findMany({
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 4,
        include: { author: { select: { name: true, image: true } } },
      }),
    ]);

  const stats = [
    { label: "Exercises available", value: exerciseCount, icon: Dumbbell },
    { label: "Articles published", value: articleCount, icon: BookOpenText },
    { label: "Active sessions", value: sessionCount, icon: Play },
    { label: "Membership", value: user.plan, icon: CreditCard },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Welcome back, {user.name?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" />
              Member since {formatDate(user.createdAt)} ·{" "}
              <span className="capitalize">{user.role}</span>
            </p>
          </div>
        </div>
        <Badge variant="blue" className="w-fit capitalize">
          {user.plan} plan
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <stat.icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-xl font-semibold text-slate-900">
                  {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Latest exercises</CardTitle>
            <Link
              href="/api-docs#/Exercises"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              View API <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentExercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100">
                  <Dumbbell className="h-4 w-4 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{exercise.name}</p>
                  <p className="text-xs text-slate-500">
                    {exercise.muscleGroup} · {exercise.difficulty}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {exercise.category}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent articles</CardTitle>
            <Badge variant="outline" className="text-xs">
              {articleCount} total
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentArticles.map((article) => (
              <div key={article.id} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50">
                  <BookOpenText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{article.title}</p>
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    by {article.author?.name ?? "Staff"}
                    {article.publishedAt && ` · ${formatDate(article.publishedAt)}`}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
