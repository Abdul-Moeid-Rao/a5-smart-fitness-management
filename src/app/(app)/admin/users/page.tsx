import type { Metadata } from "next";
import { UsersClient } from "@/components/admin/users-client";

export const metadata: Metadata = { title: "User Management" };

export default function AdminUsersPage() {
  return <UsersClient />;
}
