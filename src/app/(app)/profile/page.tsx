import type { Metadata } from "next";
import { ProfileClient } from "@/components/profile/profile-client";
import { requirePageAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { user } = await requirePageAuth();

  const [userCount, sessions] = await Promise.all([
    prisma.user.count(),
    prisma.session.count({ where: { userId: user.id, expiresAt: { gt: new Date() } } }),
  ]);

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, image: true, phone: true, bio: true, plan: true },
  });

  return (
    <ProfileClient
      user={{
        id: profile?.id ?? user.id,
        name: profile?.name ?? user.name ?? null,
        email: profile?.email ?? user.email,
        image: profile?.image ?? user.image ?? null,
        phone: profile?.phone ?? null,
        bio: profile?.bio ?? null,
        plan: profile?.plan ?? user.plan,
        role: user.role,
        createdAt: user.createdAt,
      }}
      stats={{ totalUsers: userCount, activeSessions: sessions }}
    />
  );
}
