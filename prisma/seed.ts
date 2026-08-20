import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { auth } from "../src/lib/auth";
import { DEFAULT_ROLES, PERMISSIONS } from "../src/lib/permissions";

const now = new Date();

async function main() {
  console.log("🌱 Seeding database...");

  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        name: permission.name,
        description: permission.description,
        group: permission.group,
      },
      create: {
        key: permission.key,
        name: permission.name,
        description: permission.description,
        group: permission.group,
      },
    });
  }
  console.log("  ✓ Permissions");

  for (const roleDef of DEFAULT_ROLES) {
    const permissions = await prisma.permission.findMany({
      where: { key: { in: roleDef.permissions } },
    });
    await prisma.role.upsert({
      where: { name: roleDef.name },
      update: {
        description: roleDef.description,
        permissions: {
          deleteMany: {},
          create: permissions.map((p) => ({ permissionId: p.id })),
        },
      },
      create: {
        name: roleDef.name,
        description: roleDef.description,
        system: true,
        permissions: {
          create: permissions.map((p) => ({ permissionId: p.id })),
        },
      },
    });
  }
  console.log("  ✓ Roles");

  const users = [
    {
      name: "Admin",
      email: "admin@smartfitness.app",
      password: "Admin@12345",
      role: "admin",
      plan: "elite",
      bio: "Platform administrator",
    },
    {
      name: "Coach Sarah",
      email: "trainer@smartfitness.app",
      password: "Trainer@12345",
      role: "trainer",
      plan: "pro",
      bio: "Strength & conditioning coach",
    },
    {
      name: "Alex Johnson",
      email: "user@smartfitness.app",
      password: "User@12345",
      role: "user",
      plan: "pro",
      bio: "Fitness enthusiast training for a half-marathon",
    },
  ];

  const createdUserIds: string[] = [];
  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      try {
        await auth.api.signUpEmail({
          body: { name: u.name, email: u.email, password: u.password, phone: "", bio: "" },
        });
      } catch (error) {
        console.warn(`  ⚠ Could not register ${u.email}: ${String(error).slice(0, 120)}`);
      }
      const user = await prisma.user.findUnique({ where: { email: u.email } });
      if (user) createdUserIds.push(user.id);
    } else {
      createdUserIds.push(existing.id);
    }
  }

  await prisma.user.updateMany({
    where: { email: { in: users.map((u) => u.email) } },
    data: { emailVerified: true },
  });

  for (const u of users) {
    await prisma.user.updateMany({
      where: { email: u.email },
      data: {
        role: u.role,
        plan: u.plan,
        bio: u.bio,
        status: "active",
        lastLoginAt: new Date(now.getTime() - Math.random() * 48 * 60 * 60 * 1000),
      },
    });
  }
  console.log("  ✓ Users (admin@smartfitness.app / Admin@12345)");

  const exercises = [
    {
      name: "Barbell Bench Press",
      slug: "barbell-bench-press",
      category: "Strength",
      muscleGroup: "Chest",
      difficulty: "intermediate",
      equipment: "Barbell, Bench",
      description: "The foundational upper-body pushing movement targeting the chest, shoulders and triceps.",
      instructions: "1. Lie flat on the bench with feet planted. 2. Grip the bar slightly wider than shoulder-width. 3. Lower the bar to mid-chest with control. 4. Press back up until arms are extended.",
      imageUrl: null,
      isPublished: true,
    },
    {
      name: "Back Squat",
      slug: "back-squat",
      category: "Strength",
      muscleGroup: "Legs",
      difficulty: "intermediate",
      equipment: "Barbell, Squat Rack",
      description: "The king of lower-body lifts, building the quads, glutes and core.",
      instructions: "1. Rest the bar on your upper back. 2. Brace your core and descend by pushing hips back. 3. Reach depth with knees tracking over toes. 4. Drive through the floor to stand.",
      imageUrl: null,
      isPublished: true,
    },
    {
      name: "Conventional Deadlift",
      slug: "conventional-deadlift",
      category: "Strength",
      muscleGroup: "Back",
      difficulty: "advanced",
      equipment: "Barbell, Plates",
      description: "A full-body hinge that develops the posterior chain and grip strength.",
      instructions: "1. Stand with feet hip-width, bar over mid-foot. 2. Hinge and grip the bar just outside the legs. 3. Brace, keep a flat back, and stand up with the bar. 4. Lower with control.",
      imageUrl: null,
      isPublished: true,
    },
    {
      name: "Pull-Up",
      slug: "pull-up",
      category: "Strength",
      muscleGroup: "Back",
      difficulty: "advanced",
      equipment: "Pull-up Bar",
      description: "A bodyweight vertical pull building lats, biceps and grip.",
      instructions: "1. Hang from the bar with an overhand grip. 2. Pull your chest toward the bar. 3. Pause at the top, then lower under control.",
      imageUrl: null,
      isPublished: true,
    },
    {
      name: "Overhead Press",
      slug: "overhead-press",
      category: "Strength",
      muscleGroup: "Shoulders",
      difficulty: "intermediate",
      equipment: "Barbell",
      description: "Builds strong, healthy shoulders and core stability.",
      instructions: "1. Rack the bar at shoulder height. 2. Brace glutes and core. 3. Press the bar overhead until arms lock out. 4. Lower back to shoulders.",
      imageUrl: null,
      isPublished: true,
    },
    {
      name: "Barbell Row",
      slug: "barbell-row",
      category: "Strength",
      muscleGroup: "Back",
      difficulty: "beginner",
      equipment: "Barbell",
      description: "A horizontal pull that thickens the upper and mid back.",
      instructions: "1. Hinge at the hips with a flat back. 2. Pull the bar to your lower ribs. 3. Squeeze the shoulder blades. 4. Lower under control.",
      imageUrl: null,
      isPublished: true,
    },
    {
      name: "Walking Lunge",
      slug: "walking-lunge",
      category: "Strength",
      muscleGroup: "Legs",
      difficulty: "beginner",
      equipment: "None",
      description: "Unilateral leg exercise for balance, quads and glutes.",
      instructions: "1. Step forward into a deep lunge. 2. Keep your torso tall. 3. Push through the front heel to step through. 4. Alternate legs.",
      imageUrl: null,
      isPublished: true,
    },
    {
      name: "Plank",
      slug: "plank",
      category: "Core",
      muscleGroup: "Core",
      difficulty: "beginner",
      equipment: "None",
      description: "An isometric core hold that builds endurance and stability.",
      instructions: "1. Support yourself on forearms and toes. 2. Keep a straight line from head to heels. 3. Brace and hold for time.",
      imageUrl: null,
      isPublished: true,
    },
    {
      name: "Dumbbell Bicep Curl",
      slug: "dumbbell-bicep-curl",
      category: "Strength",
      muscleGroup: "Arms",
      difficulty: "beginner",
      equipment: "Dumbbells",
      description: "Isolates the biceps for arm size and strength.",
      instructions: "1. Hold dumbbells at your sides. 2. Curl them toward your shoulders. 3. Squeeze at the top. 4. Lower slowly.",
      imageUrl: null,
      isPublished: true,
    },
    {
      name: "Treadmill Sprint Intervals",
      slug: "treadmill-sprint-intervals",
      category: "Cardio",
      muscleGroup: "Full Body",
      difficulty: "intermediate",
      equipment: "Treadmill",
      description: "High-intensity intervals to torch calories and build conditioning.",
      instructions: "1. Warm up for 5 minutes. 2. Sprint for 30 seconds. 3. Recover for 90 seconds. 4. Repeat 8 times.",
      imageUrl: null,
      isPublished: true,
    },
    {
      name: "Hip Mobility Flow",
      slug: "hip-mobility-flow",
      category: "Mobility",
      muscleGroup: "Hips",
      difficulty: "beginner",
      equipment: "Mat",
      description: "A gentle flow to open up tight hips and improve squat depth.",
      instructions: "1. World's greatest stretch x5 each side. 2. 90/90 switches x10. 3. Deep squat holds x30s. 4. Repeat for 3 rounds.",
      imageUrl: null,
      isPublished: true,
    },
    {
      name: "Kettlebell Swing",
      slug: "kettlebell-swing",
      category: "Strength",
      muscleGroup: "Hips",
      difficulty: "intermediate",
      equipment: "Kettlebell",
      description: "A hip-hinge power movement for explosive posterior chain strength.",
      instructions: "1. Hinge back with a soft knee. 2. Snap the hips forward to swing the bell to chest height. 3. Let the bell fall back into the hinge. 4. Repeat for reps.",
      imageUrl: null,
      isPublished: true,
    },
  ];

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { slug: exercise.slug },
      update: exercise,
      create: exercise,
    });
  }
  console.log("  ✓ Exercises");

  const articles = [
    {
      title: "Programming for Hypertrophy: The Complete Guide",
      slug: "programming-hypertrophy-guide",
      excerpt: "Sets, reps and frequency — how to structure training for muscle growth.",
      content: `## Volume drives growth\n\nFor most lifters, **10-20 hard sets per muscle group per week** produces reliable hypertrophy. The exact number depends on your training age and recovery capacity.\n\n## Rep ranges\n\n- Strength: 1-5 reps, heavy\n- Hypertrophy: 6-12 reps, moderate\n- Endurance: 12+ reps, light\n\n## Frequency\n\nHitting each muscle group 2x per week produces equal or better results than 1x, with less soreness per session.\n\n### Key takeaway\n\nProgressive overload + adequate protein + sleep = growth. Everything else is detail.`,
      coverImage: null,
      status: "published",
      tags: JSON.stringify(["training", "hypertrophy", "programming"]),
    },
    {
      title: "Nutrition Fundamentals for Fat Loss",
      slug: "nutrition-fat-loss-fundamentals",
      excerpt: "A calorie deficit done right — protein, fiber and sustainability.",
      content: `## The deficit is everything\n\nFat loss requires a **sustained calorie deficit**. Aim for 300-500 kcal below maintenance for a steady 0.5-1 lb per week.\n\n## Prioritize protein\n\n- 1.6-2.2g per kg of bodyweight\n- Spread across 3-5 meals\n- Leans muscle sparing\n\n## Don't forget fiber\n\nFiber improves satiety and gut health. Aim for 25-35g daily from vegetables, fruit and whole grains.`,
      coverImage: null,
      status: "published",
      tags: JSON.stringify(["nutrition", "fat-loss", "diet"]),
    },
    {
      title: "The Art of Recovery: Sleep, Stress and Performance",
      slug: "art-of-recovery",
      excerpt: "Recovery is where adaptation happens. Here's how to maximize it.",
      content: `## Sleep is non-negotiable\n\n7-9 hours of quality sleep is the single most powerful recovery tool. Prioritize a consistent schedule.\n\n## Manage stress\n\nChronic stress elevates cortisol, impairing recovery and fat loss. Build walks, breathing or meditation into your routine.\n\n## Active recovery\n\nLow-intensity activity on rest days — walking, mobility, light cycling — accelerates recovery without adding fatigue.`,
      coverImage: null,
      status: "published",
      tags: JSON.stringify(["recovery", "sleep", "health"]),
    },
    {
      title: "Beginner's Guide to Progressive Overload",
      slug: "progressive-overload-beginners",
      excerpt: "The one principle every beginner must understand to keep making progress.",
      content: `## What is progressive overload?\n\nGradually increasing the stress placed on your muscles over time so they continue to adapt.\n\n## Ways to progress\n\n1. Add weight\n2. Add reps\n3. Add sets\n4. Slow down the tempo\n5. Shorten rest intervals\n\n## Tracking matters\n\nLog every session. If you're not tracking, you're guessing — and guessing rarely leads to progress.`,
      coverImage: null,
      status: "draft",
      tags: JSON.stringify(["training", "beginner", "progress"]),
    },
  ];

  const adminUser = await prisma.user.findUnique({ where: { email: "admin@smartfitness.app" } });

  for (const article of articles) {
    const existing = await prisma.article.findUnique({ where: { slug: article.slug } });
    if (!existing) {
      await prisma.article.create({
        data: {
          ...article,
          authorId: adminUser?.id ?? null,
          publishedAt: article.status === "published" ? new Date(now.getTime() - 7 * 86400000) : null,
        },
      });
    }
  }
  console.log("  ✓ Articles");

  const auditSeed = [
    { action: "user.register", entityType: "user", details: "First 100 members joined the beta" },
    { action: "content.import", entityType: "exercise", details: "Initial exercise library import" },
    { action: "system.seed", entityType: "system", details: "Database seeded for the first time" },
  ];
  for (const log of auditSeed) {
    await prisma.auditLog.create({
      data: {
        action: log.action,
        entityType: log.entityType,
        actorId: adminUser?.id ?? null,
        details: JSON.stringify({ note: log.details }),
      },
    });
  }
  console.log("  ✓ Audit log");

  const counts = {
    users: await prisma.user.count(),
    exercises: await prisma.exercise.count(),
    articles: await prisma.article.count(),
    roles: await prisma.role.count(),
    permissions: await prisma.permission.count(),
  };
  console.log("\n✅ Seed complete:", counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
