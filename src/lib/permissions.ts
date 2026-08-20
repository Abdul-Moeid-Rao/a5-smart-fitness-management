export type PermissionKey =
  | "users.read"
  | "users.write"
  | "users.manage"
  | "roles.manage"
  | "content.manage"
  | "exercises.read"
  | "exercises.write"
  | "articles.read"
  | "articles.write"
  | "reports.read"
  | "audit.read"
  | "apikeys.manage"
  | "settings.manage";

export interface PermissionDef {
  key: PermissionKey;
  name: string;
  group: string;
  description: string;
}

export const PERMISSIONS: PermissionDef[] = [
  { key: "users.read", name: "View users", group: "Users", description: "View the user directory and activity" },
  { key: "users.write", name: "Edit users", group: "Users", description: "Edit user profiles and reset status" },
  { key: "users.manage", name: "Manage users", group: "Users", description: "Suspend, activate or delete users" },
  { key: "roles.manage", name: "Manage roles", group: "Access", description: "Assign roles and edit permissions" },
  { key: "content.manage", name: "Manage content", group: "Content", description: "Create, edit and delete exercises & articles" },
  { key: "exercises.read", name: "View exercises", group: "Content", description: "Browse the exercise library" },
  { key: "exercises.write", name: "Write exercises", group: "Content", description: "Create and update exercises" },
  { key: "articles.read", name: "View articles", group: "Content", description: "Browse published articles" },
  { key: "articles.write", name: "Write articles", group: "Content", description: "Create and update articles" },
  { key: "reports.read", name: "View reports", group: "Analytics", description: "View analytics and reports" },
  { key: "audit.read", name: "View audit log", group: "Analytics", description: "Review the audit trail" },
  { key: "apikeys.manage", name: "Manage API keys", group: "Access", description: "Create and revoke API keys" },
  { key: "settings.manage", name: "Manage settings", group: "Access", description: "Change platform settings" },
];

export interface RoleDef {
  name: string;
  description: string;
  permissions: PermissionKey[];
}

export const DEFAULT_ROLES: RoleDef[] = [
  {
    name: "admin",
    description: "Full access to every part of the platform",
    permissions: PERMISSIONS.map((p) => p.key),
  },
  {
    name: "trainer",
    description: "Manages exercises and articles, views users and reports",
    permissions: [
      "users.read",
      "exercises.read",
      "exercises.write",
      "articles.read",
      "articles.write",
      "content.manage",
      "reports.read",
    ],
  },
  {
    name: "user",
    description: "Standard member with read access to the exercise library and articles",
    permissions: ["exercises.read", "articles.read"],
  },
];

export function permissionGroups(): string[] {
  return Array.from(new Set(PERMISSIONS.map((p) => p.group)));
}
