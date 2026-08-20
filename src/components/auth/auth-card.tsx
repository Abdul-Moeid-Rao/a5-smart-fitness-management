"use client";

import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            SmartFitness
          </span>
        </div>
        <Card className="shadow-md">
          <CardHeader className="items-center pb-4 text-center">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </CardHeader>
          <CardContent>{children}</CardContent>
          <CardFooter className="justify-center pb-6">{footer}</CardFooter>
        </Card>
        <p className="mt-6 text-center text-xs text-slate-400">
          <Link href="/" className="font-medium text-slate-500 hover:text-slate-700">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
