import { redirect } from "next/navigation";
import { getSession } from "@/lib/rbac";

export async function requirePageAuth(roles?: string[]) {
  const session = await getSession();
  if (!session) redirect("/login");

  if (roles && !roles.includes(session.user.role)) {
    if (session.user.role === "admin") redirect("/admin");
    redirect("/dashboard");
  }

  return { user: session.user, session: session.session };
}

export async function redirectIfAuthed() {
  const session = await getSession();
  if (session) {
    if (session.user.role === "admin") redirect("/admin");
    redirect("/dashboard");
  }
  return null;
}
