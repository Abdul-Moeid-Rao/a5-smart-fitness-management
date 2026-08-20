import { z } from "zod";

const slug = z
  .string()
  .min(1, "Slug is required")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphenated");

const imageUrl = z
  .string()
  .max(500)
  .url("Must be a valid URL")
  .or(z.literal(""))
  .optional()
  .nullable();

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("Invalid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  phone: z.string().max(30).optional().nullable(),
  bio: z.string().max(600).optional().nullable(),
  image: imageUrl,
});

export const exerciseSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  slug,
  category: z.string().min(1, "Category is required").max(80),
  muscleGroup: z.string().min(1, "Muscle group is required").max(80),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  equipment: z.string().max(120).optional().nullable(),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  instructions: z.string().min(10, "Instructions must be at least 10 characters").max(10000),
  imageUrl: imageUrl,
  isPublished: z.boolean().optional().default(true),
});

export const articleSchema = z.object({
  title: z.string().min(3, "Title is required").max(200),
  slug,
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(20, "Content must be at least 20 characters").max(100000),
  coverImage: imageUrl,
  status: z.enum(["draft", "published", "archived"]).optional().default("draft"),
  tags: z.array(z.string().max(40)).max(10).optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().max(30).optional().nullable(),
  bio: z.string().max(600).optional().nullable(),
  role: z.string().optional(),
  status: z.enum(["active", "suspended"]).optional(),
  plan: z.enum(["free", "pro", "elite"]).optional(),
});

export const roleUpdateSchema = z.object({
  description: z.string().max(300).optional().nullable(),
  permissions: z.array(z.string()).optional(),
});

export const apiKeySchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  permissions: z.array(z.string()).max(20).optional(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().max(120).optional(),
  sortBy: z.string().max(60).optional(),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
  status: z.string().max(30).optional(),
  role: z.string().max(30).optional(),
});
