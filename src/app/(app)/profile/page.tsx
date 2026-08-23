import type { Metadata } from "next";
import { ProfileClient } from "@/components/profile/profile-client";
import { requirePageAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Profile & Settings" };

export default async function ProfilePage() {
  const { user } = await requirePageAuth();

  const [userCount, sessions, profile, userDoc] = await Promise.all([
    prisma.user.count(),
    prisma.session.count({ where: { userId: user.id, expiresAt: { gt: new Date() } } }),
    prisma.userProfile.findUnique({ where: { userId: user.id } }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, image: true, phone: true, bio: true, plan: true, role: true, createdAt: true },
    }),
  ]);

  return (
    <ProfileClient
      user={{
        id: userDoc?.id ?? user.id,
        name: userDoc?.name ?? user.name ?? null,
        email: userDoc?.email ?? user.email,
        image: userDoc?.image ?? user.image ?? null,
        phone: userDoc?.phone ?? null,
        bio: userDoc?.bio ?? null,
        plan: userDoc?.plan ?? user.plan,
        role: userDoc?.role ?? user.role,
        createdAt: userDoc?.createdAt ?? user.createdAt,
      }}
      initialProfile={{
        age: profile?.age ?? null,
        heightCm: profile?.heightCm ?? null,
        weightKg: profile?.weightKg ?? null,
        goalWeightKg: profile?.goalWeightKg ?? null,
        activityLevel: profile?.activityLevel ?? "moderate",
        fitnessGoal: profile?.fitnessGoal ?? "maintain",
        streakDays: profile?.streakDays ?? 0,
      }}
      stats={{ totalUsers: userCount, activeSessions: sessions }}
    />
  );
}
