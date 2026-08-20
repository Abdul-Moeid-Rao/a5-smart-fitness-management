import type { Metadata } from "next";
import { redirectIfAuthed } from "@/lib/guards";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  await redirectIfAuthed();
  return <RegisterForm />;
}
