import type { Metadata } from "next";
import { ReportsClient } from "@/components/admin/reports-client";

export const metadata: Metadata = { title: "Reports & Analytics" };

export default function AdminReportsPage() {
  return <ReportsClient />;
}
