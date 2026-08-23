# Smart Fitness Management System — Full Redesign & Feature Expansion

## Overview

The existing project is a functional Next.js 16 app with Better Auth, Prisma (SQLite), and TailwindCSS v4 — it has working auth, admin dashboard, user management, exercise/article content management, and a basic profile page. However, the visual design is plain (white/light-blue, generic), and it lacks the fitness-specific features requested: a **Workout Planner/Logger** (with sets/reps tracking), **biometric profile** (BMR/TDEE calculations), and a **dark/light mode switcher**.

This plan transforms the existing solid backend into the complete production-ready system described in the roadmap — adding the Cyber Dark aesthetic, new workout tracking feature, and polishing all 6 pages.

---

## User Review Required

> [!IMPORTANT]
> The existing app uses **SQLite (better-sqlite3)** via Prisma. The roadmap mentions **Neon Postgres**, but switching databases would require schema migration + new env config. I recommend **keeping SQLite** for local dev since the schema already works perfectly. If you want Neon Postgres, let me know and I'll include that migration.

> [!IMPORTANT]
> The roadmap mentions **Resend API** for transactional email (welcome email, password reset). The existing codebase has no Resend integration yet. Adding it requires a `RESEND_API_KEY` environment variable. I'll add the integration but it will silently skip if the key is missing, so the app still works without it.

> [!IMPORTANT]
> The roadmap mentions **Framer Motion** for animations. This package is not currently installed. I'll add it via `npm install framer-motion`.

> [!WARNING]
> The existing sidebar navigation uses `role === "admin"` to show Admin links. The new Workout Planner/Logger page (`/workouts`) will be added as a user-accessible route. This requires adding a new nav item and route group under `(app)`.

---

## Open Questions

> [!NOTE]
> The roadmap says the **dashboard workout stat bar** should show "Total Workouts Completed, Current Weight vs. Goal, Daily Calorie Goal, Active Streak Days." These require a `WorkoutLog` and `Profile` (with biometrics) model in Prisma. I'll add these models to the schema and seed them. **This requires running `npm run db:push` and `npm run db:seed` after deployment.**

---

## Proposed Changes

### 1. Design System & Global CSS

#### [MODIFY] [globals.css](file:///c:/Users/Abdul%20Moeid%20Rao/Desktop/Portfolio%20Projects/Lift-Club/a5-Smart-Fitness-Management/src/app/globals.css)
- Replace the light-mode-only color tokens with a full **Cyber Dark theme** (background `#090D16`, cards `#111827`, glassmorphism borders)
- Add CSS variables for both dark and light mode using `[data-theme="dark"]` / `[data-theme="light"]`
- Import **Plus Jakarta Sans** and **Outfit** fonts alongside Inter (already loaded in root layout)
- Add CSS animations: `@keyframes fade-up`, `@keyframes count-up`, shimmer skeletons, glow effects for neon accent colors

#### [MODIFY] [layout.tsx](file:///c:/Users/Abdul%20Moeid%20Rao/Desktop/Portfolio%20Projects/Lift-Club/a5-Smart-Fitness-Management/src/app/layout.tsx)
- Add Outfit + Plus Jakarta Sans font variables alongside Inter
- Add `ThemeProvider` context wrapper for dark/light mode switching

#### [NEW] `src/components/theme-provider.tsx`
- Client component managing `data-theme` attribute on `<html>`
- Persists choice in `localStorage`
- Exports `useTheme()` hook

---

### 2. Database Schema — New Fitness Models

#### [MODIFY] [schema.prisma](file:///c:/Users/Abdul%20Moeid%20Rao/Desktop/Portfolio%20Projects/Lift-Club/a5-Smart-Fitness-Management/prisma/schema.prisma)
Add two new models:

```prisma
model UserProfile {
  id               String   @id @default(cuid())
  userId           String   @unique
  age              Int?
  heightCm         Float?
  weightKg         Float?
  goalWeightKg     Float?
  activityLevel    String   @default("moderate") // sedentary|light|moderate|active|very_active
  fitnessGoal      String   @default("maintain") // lose|maintain|gain
  streakDays       Int      @default(0)
  lastWorkoutAt    DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model WorkoutLog {
  id         String       @id @default(cuid())
  userId     String
  exerciseId String
  loggedAt   DateTime     @default(now())
  notes      String?
  sets       WorkoutSet[]
  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  exercise   Exercise     @relation(fields: [exerciseId], references: [id])
  @@index([userId])
  @@index([loggedAt])
}

model WorkoutSet {
  id           String     @id @default(cuid())
  workoutLogId String
  setNumber    Int
  weightKg     Float?
  reps         Int?
  rpe          Int?       // Rate of Perceived Exertion 1-10
  workoutLog   WorkoutLog @relation(fields: [workoutLogId], references: [id], onDelete: Cascade)
}
```

Also add relations on `User`: `profile UserProfile?`, `workoutLogs WorkoutLog[]`
Also add relation on `Exercise`: `workoutLogs WorkoutLog[]`

---

### 3. API Routes — New Workout & Profile Endpoints

#### [NEW] `src/app/api/workouts/route.ts`
- `GET` — Returns current user's workout history (paginated, sorted by date desc)
- `POST` — Creates a new `WorkoutLog` with nested `WorkoutSet` records

#### [NEW] `src/app/api/workouts/[id]/route.ts`
- `PUT` — Update workout log notes/sets
- `DELETE` — Remove workout log

#### [NEW] `src/app/api/users/profile/route.ts`
- `GET` — Returns `UserProfile` for current user (creates default if missing), plus calculated BMR/TDEE
- `PUT` — Updates biometric fields

#### [MODIFY] [auth/register route](file:///c:/Users/Abdul%20Moeid%20Rao/Desktop/Portfolio%20Projects/Lift-Club/a5-Smart-Fitness-Management/src/app/api/auth)
- After user creation, also create a default `UserProfile` record
- Send welcome email via Resend if `RESEND_API_KEY` is set

---

### 4. Landing Page Redesign

#### [MODIFY] [page.tsx](file:///c:/Users/Abdul%20Moeid%20Rao/Desktop/Portfolio%20Projects/Lift-Club/a5-Smart-Fitness-Management/src/app/page.tsx)
Complete rewrite with:
- **Hero section**: Cyber dark background, neon lime accent, animated tagline, CTA buttons with hover glow, a mock dashboard UI preview card
- **KPI bar**: Animated number counters with CountUp effect (CSS animation)
- **Feature grid**: Glassmorphism cards with neon border hover effects, using real system features
- **Exercise highlights carousel**: Fetches 6 real exercises from DB server-side, displays as swipeable cards
- **Dark mode toggle button** in the navbar
- **Footer**: Links, system status badge ("Live"), legal

---

### 5. Auth Pages Redesign

#### [MODIFY] [auth-card.tsx](file:///c:/Users/Abdul%20Moeid%20Rao/Desktop/Portfolio%20Projects/Lift-Club/a5-Smart-Fitness-Management/src/components/auth/auth-card.tsx)
Transform into **split-screen layout**:
- Left panel: High-resolution fitness hero image (Unsplash URL), gradient overlay, brand quote
- Right panel: Form content
- Dark glassmorphism card style

#### [MODIFY] [login-form.tsx](file:///c:/Users/Abdul%20Moeid%20Rao/Desktop/Portfolio%20Projects/Lift-Club/a5-Smart-Fitness-Management/src/components/auth/login-form.tsx)
- Add "Forgot Password?" link (modal trigger → `/api/auth/reset-password`)
- Style upgrade: dark input fields, neon focus rings

#### [MODIFY] [register-form.tsx](file:///c:/Users/Abdul%20Moeid%20Rao/Desktop/Portfolio%20Projects/Lift-Club/a5-Smart-Fitness-Management/src/components/auth/register-form.tsx)
- Add **Fitness Goal** select field (Lose Weight / Build Muscle / Maintain)
- Add **Height (cm)** and **Weight (kg)** inputs
- After registration, POST to create `UserProfile`

---

### 6. Shell Layout Redesign

#### [MODIFY] [shell.tsx](file:///c:/Users/Abdul%20Moeid%20Rao/Desktop/Portfolio%20Projects/Lift-Club/a5-Smart-Fitness-Management/src/components/layout/shell.tsx)
- Accept `theme` prop, pass down to children
- Add `ThemeToggle` button in the topbar

#### [MODIFY] [sidebar.tsx](file:///c:/Users/Abdul%20Moeid%20Rao/Desktop/Portfolio%20Projects/Lift-Club/a5-Smart-Fitness-Management/src/components/layout/sidebar.tsx)
- Add **Workouts** nav item (Dumbbell icon, all roles)
- Restyle: neon lime active state instead of blue, glassmorphism background, glow on active item
- Subtle hover micro-animations

#### [MODIFY] [topbar.tsx](file:///c:/Users/Abdul%20Moeid%20Rao/Desktop/Portfolio%20Projects/Lift-Club/a5-Smart-Fitness-Management/src/components/layout/topbar.tsx)
- Add **Dark/Light mode toggle** button
- Upgrade search bar styling

---

### 7. User Dashboard Redesign

#### [MODIFY] [dashboard/page.tsx](file:///c:/Users/Abdul%20Moeid%20Rao/Desktop/Portfolio%20Projects/Lift-Club/a5-Smart-Fitness-Management/src/app/(app)/dashboard/page.tsx)
- Fetch `UserProfile`, recent `WorkoutLog` entries, and streak data server-side
- New stat bar: **Total Workouts**, **Current vs Goal Weight**, **Daily Calorie Goal (TDEE)**, **Streak Days**
- Recent Activity Feed: list of recent workout logs with exercise name, muscle group, total volume (sum of weight × reps)
- Progress chart: body weight trend over time (Recharts `LineChart`)
- CountUp animation on stat numbers (client-side progressive enhancement)

#### [NEW] `src/components/dashboard/workout-feed.tsx`
- Client component displaying paginated workout log entries
- Edit/Delete quick action buttons with confirmation

#### [NEW] `src/components/dashboard/weight-chart.tsx`
- Recharts `LineChart` for body weight trend (sourced from `UserProfile` history — simplified: current weight displayed)
- Recharts `AreaChart` for workout volume over time

---

### 8. Workout Planner & Logger (NEW PAGE)

#### [NEW] `src/app/(app)/workouts/page.tsx`
- Server component: fetches exercise list and user's recent logs

#### [NEW] `src/components/workouts/workout-planner.tsx`
Client component with:
- **Search & filter bar**: Real-time filter by muscle group (Chest/Back/Legs/Core/Arms/Shoulders/Hips/Full Body) or difficulty
- **Exercise grid**: Cards with exercise name, muscle group badge, difficulty tag, equipment; click to open detail drawer
- **"Log Workout" button**: Opens workout logger modal
- **Exercise Detail Drawer**: Shows full instructions, equipment required, muscle group

#### [NEW] `src/components/workouts/log-workout-modal.tsx`
- Exercise selector (searchable dropdown)
- Dynamic set rows: add/remove rows, each with Weight (kg), Reps, RPE (1-10)
- Notes textarea
- Submit to `POST /api/workouts`

---

### 9. Profile Page Redesign

#### [MODIFY] profile page and `profile-client.tsx`
- Load `UserProfile` biometric data from new API endpoint
- **Biometrics panel**: Form with Age, Height (cm), Weight (kg), Goal Weight, Activity Level, Fitness Goal
- Display calculated **BMR** (Mifflin-St Jeor) and **TDEE**
- **Account Security**: Update password form (using Better Auth's `changePassword`)
- **Stats**: Member since, role badge, active sessions count
- Delete account trigger with confirmation dialog

---

### 10. Admin Dashboard Enhancement

#### [MODIFY] [admin-dashboard-client.tsx](file:///c:/Users/Abdul%20Moeid%20Rao/Desktop/Portfolio%20Projects/Lift-Club/a5-Smart-Fitness-Management/src/components/admin/admin-dashboard-client.tsx)
- Add **Global Volume Lifted** KPI (sum of all `WorkoutSet.weightKg × reps`)
- Add **Active Logs Today** KPI (today's `WorkoutLog` count)
- Restyle all cards with Cyber Dark theme
- Exercise Catalog Manager: panel to add new exercises (already exists in content-client but will surface on admin page)

#### [MODIFY] User Management table
- Ensure role badge shows `ADMIN` / `USER` / `TRAINER` with distinct colors
- Dark theme styling throughout

---

### 11. Seed File Updates

#### [MODIFY] [seed.ts](file:///c:/Users/Abdul%20Moeid%20Rao/Desktop/Portfolio%20Projects/Lift-Club/a5-Smart-Fitness-Management/prisma/seed.ts)
- Create `UserProfile` records for all 3 seeded users with realistic biometric data
- Seed 10–15 sample `WorkoutLog` + `WorkoutSet` records for the demo user (Alex Johnson) spread across the last 30 days
- This powers the dashboard analytics chart out-of-the-box

---

### 12. New Dependencies to Install

```
framer-motion       # Page transitions + micro-animations
resend              # Transactional email (welcome + password reset)
```

---

## Verification Plan

### Automated
- `npm run build` — TypeScript compile + Next.js build check (no errors)
- `npm run db:push` — Apply new Prisma schema
- `npm run db:seed` — Seed all data including workout logs

### Manual Verification
1. Navigate to `/` — verify Cyber Dark landing page, counter animations, exercise carousel
2. Click "Start Free" → verify split-screen auth page
3. Register new user with biometrics → verify `UserProfile` created in DB
4. Login as `user@smartfitness.app` → verify dark dashboard, workout stats, chart
5. Navigate to `/workouts` → filter exercises, log a workout with 3 sets
6. Navigate to `/profile` → update biometrics, see BMR/TDEE calculation update
7. Login as `admin@smartfitness.app` → verify admin dashboard with new KPIs
8. Test dark/light mode toggle persists on page reload
