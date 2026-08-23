"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  BarChart3,
  ShieldCheck,
  User,
  X,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: string;
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "trainer", "user"],
    exact: true,
  },
  {
    href: "/workouts",
    label: "Workouts",
    icon: Dumbbell,
    roles: ["admin", "trainer", "user"],
  },
  { href: "/admin", label: "Overview", icon: BarChart3, roles: ["admin"], exact: true },
  { href: "/admin/users", label: "User Management", icon: Users, roles: ["admin"] },
  { href: "/admin/content", label: "Content Management", icon: Flame, roles: ["admin", "trainer"] },
  { href: "/admin/reports", label: "Reports & Analytics", icon: BarChart3, roles: ["admin", "trainer"] },
  { href: "/settings", label: "Roles & Permissions", icon: ShieldCheck, roles: ["admin"] },
  { href: "/profile", label: "Profile", icon: User, roles: ["admin", "trainer", "user"] },
];

export function Sidebar({ role, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Logo Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/30">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div className="leading-tight">
              <p
                className="text-sm font-bold text-foreground tracking-wide"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                SmartFitness
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Platform
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground lg:hidden transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Navigation
          </p>
          {items.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/15 text-primary shadow-sm font-semibold border border-primary/25"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    active ? "text-primary" : "group-hover:text-foreground"
                  )}
                />
                {item.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Role Indicator */}
        <div className="border-t border-border p-4">
          <div className="rounded-2xl bg-card border border-border p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-foreground capitalize">{role} Account</p>
              <p className="text-[10px] text-muted-foreground">SmartFitness System</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500" title="Connected" />
          </div>
        </div>
      </aside>
    </>
  );
}
