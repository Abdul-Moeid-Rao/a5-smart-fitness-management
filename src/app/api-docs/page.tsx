import type { Metadata } from "next";
import { SwaggerDocs } from "@/components/swagger-docs";

export const metadata: Metadata = { title: "API Documentation" };

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">
              A
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Smart Fitness Management API</h1>
              <p className="text-xs text-slate-400">Interactive OpenAPI 3.0 documentation · Swagger UI</p>
            </div>
          </div>
          <a
            href="/"
            className="text-sm font-medium text-slate-300 hover:text-white"
          >
            ← Back to app
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <SwaggerDocs />
      </main>
    </div>
  );
}
