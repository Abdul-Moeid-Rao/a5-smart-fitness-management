import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Dumbbell,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  Users,
  BookOpenText,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Admin Dashboard",
    description: "Site-wide KPIs, live session counts, growth charts and role distribution at a glance.",
  },
  {
    icon: Users,
    title: "User Management",
    description: "Search, filter, sort, change roles and suspend members from a single data table.",
  },
  {
    icon: Dumbbell,
    title: "Content Management",
    description: "Add and edit exercises and articles from the admin panel — no hardcoding required.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description: "Admin, Trainer and User roles enforced with JWT sessions and fine-grained permissions.",
  },
  {
    icon: KeyRound,
    title: "Secure REST API",
    description: "Full CRUD endpoints with validation, rate limiting, audit logging and Swagger docs.",
  },
  {
    icon: BookOpenText,
    title: "Swagger Documentation",
    description: "Interactive OpenAPI docs embedded at /api-docs to explore every endpoint live.",
  },
];

const KPIS = [
  { label: "Total Users", value: "10k+", icon: Users },
  { label: "Active Sessions", value: "1.2k", icon: Zap },
  { label: "Exercises", value: "500+", icon: Dumbbell },
  { label: "API Requests / min", value: "8k", icon: BarChart3 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Dumbbell className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">SmartFitness</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#platform" className="hover:text-slate-900">Platform</a>
            <a href="/api-docs" className="hover:text-slate-900">API Docs</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get started <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="border-b bg-gradient-to-b from-blue-50/60 to-white">
          <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <Zap className="h-3.5 w-3.5" />
              Enterprise-grade fitness management
            </div>
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Manage your fitness platform like a{" "}
              <span className="text-blue-600">pro</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              One dashboard for users, exercises, articles and analytics — backed by a secure,
              documented REST API with role-based access control.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register">
                <Button size="lg">Start free trial <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link href="/api-docs">
                <Button size="lg" variant="outline">Explore the API</Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Try it: <span className="font-mono text-slate-500">admin@smartfitness.app</span> ·{" "}
              <span className="font-mono text-slate-500">Admin@12345</span>
            </p>
          </div>
        </section>

        <section className="border-b bg-slate-50">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-4">
            {KPIS.map((kpi) => (
              <div key={kpi.label} className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600">
                  <kpi.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                  <p className="text-sm text-slate-500">{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything your team needs
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Built with Next.js, Better Auth and Prisma — a complete frontend and backend in one codebase.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <feature.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="platform" className="border-t bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                  Platform
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  A SaaS admin shell, ready to ship
                </h2>
                <ul className="mt-8 space-y-4 text-slate-300">
                  {[
                    "Fixed sidebar navigation with icon set and role-aware menu",
                    "Sortable, paginated data tables with search and filters",
                    "KPI cards, growth line charts and role distribution charts",
                    "Audit trail of every administrative action",
                    "Deployment-ready .env handling and production guide",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                        <ArrowRight className="h-3 w-3 text-white" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                  <span className="h-3 w-3 rounded-full bg-red-500/70" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/70" />
                  <span className="h-3 w-3 rounded-full bg-green-500/70" />
                  <span className="ml-2 text-xs text-slate-400">admin / dashboard</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {["Total users 12,458", "Active today 1,204", "New signups 342", "Sessions 2,891"].map(
                    (stat) => (
                      <div key={stat} className="rounded-lg bg-white/10 p-4">
                        <p className="text-sm font-semibold text-white">{stat.split(" ")[0]}</p>
                        <p className="text-lg font-bold text-blue-400">{stat.split(" ")[2]}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Ready to take control?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Create an account and explore the user dashboard, or sign in with the seeded admin to
            see the full management suite.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Create account</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Sign in</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600">
              <Dumbbell className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">SmartFitness</span>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SmartFitness. Assignment 5 — Smart Fitness Management System.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link href="/api-docs" className="hover:text-slate-900">API Docs</Link>
            <Link href="/login" className="hover:text-slate-900">Login</Link>
            <Link href="/register" className="hover:text-slate-900">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
