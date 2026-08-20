import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
      phone: { type: "string" },
      bio: { type: "string" },
      status: { type: "string", defaultValue: "active" },
      plan: { type: "string", defaultValue: "free" },
    },
  },
  accessControl: {
    defaultRole: "user",
    roles: {
      user: ["exercise:read", "article:read"],
      trainer: [
        "exercise:read",
        "exercise:create",
        "exercise:update",
        "article:read",
        "article:create",
        "article:update",
        "user:read",
        "report:read",
      ],
      admin: ["*"],
    },
  },
  rateLimit: {
    window: 60,
    max: 120,
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
});

export type SessionUser = typeof auth.$Infer.Session.user;
