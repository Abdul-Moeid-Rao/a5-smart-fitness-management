import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { notes, sets } = body;

  const existing = await prisma.workoutLog.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Delete existing sets and recreate
    await tx.workoutSet.deleteMany({ where: { workoutLogId: id } });
    const log = await tx.workoutLog.update({
      where: { id },
      data: {
        notes: notes ?? existing.notes,
        sets: {
          create: (sets ?? []).map((s: { setNumber: number; weightKg?: number; reps?: number; rpe?: number }) => ({
            setNumber: s.setNumber,
            weightKg: s.weightKg ?? null,
            reps: s.reps ?? null,
            rpe: s.rpe ?? null,
          })),
        },
      },
      include: { sets: true, exercise: { select: { name: true } } },
    });
    return log;
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.workoutLog.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  await prisma.workoutLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
