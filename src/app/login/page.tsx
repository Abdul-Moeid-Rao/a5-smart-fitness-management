import type { Metadata } from "next";
import { redirectIfAuthed } from "@/lib/guards";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  await redirectIfAuthed();
  return <LoginForm />;
}
