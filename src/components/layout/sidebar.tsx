"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  BarChart3,
  Settings,
  BookOpenText,
  ShieldCheck,
  User,
  X,
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
  { href: "/admin", label: "Overview", icon: BarChart3, roles: ["admin"], exact: true },
  { href: "/admin/users", label: "User Management", icon: Users, roles: ["admin"] },
  { href: "/admin/content", label: "Content Management", icon: Dumbbell, roles: ["admin", "trainer"] },
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
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Dumbbell className="h-4.5 w-4.5 h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">SmartFitness</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Admin Suite</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Main menu
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
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-400 hover:bg-sidebar-accent hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-lg bg-sidebar-accent p-3">
            <p className="text-xs font-medium text-white">Need the API?</p>
            <p className="mt-1 text-xs text-slate-400">
              Full REST documentation with Swagger.
            </p>
            <Link
              href="/api-docs"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              <BookOpenText className="h-3.5 w-3.5" />
              Open API docs
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
