"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings, User, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { signOut } from "@/lib/auth-client";
import { initials } from "@/lib/utils";

interface UserMenuProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export function UserMenu({ name, email, image, role }: UserMenuProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ fetchOptions: { onSuccess: () => router.push("/login") } });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-8 w-8">
            <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{name ?? "User"}</span>
            <span className="text-xs font-normal text-muted-foreground">{email}</span>
            <Badge variant="blue" className="mt-1 w-fit capitalize">{role ?? "user"}</Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="mr-2" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2" /> Settings
        </DropdownMenuItem>
        {role === "admin" && (
          <DropdownMenuItem onClick={() => router.push("/admin")}>
            <ShieldCheck className="mr-2" /> Admin dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
