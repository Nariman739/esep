import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase(); // e.g. "A3BX7F"
}

// GET — get current telegram status
export async function GET() {
  try {
    const master = await requireAuth();
    return NextResponse.json({
      linked: !!master.telegramChatId,
      chatId: master.telegramChatId ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST — generate a fresh link code
export async function POST() {
  try {
    const master = await requireAuth();

    const code = generateCode();

    await prisma.master.update({
      where: { id: master.id },
      data: { telegramLinkCode: code },
    });

    return NextResponse.json({ code });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// DELETE — unlink telegram
export async function DELETE() {
  try {
    const master = await requireAuth();

    await prisma.master.update({
      where: { id: master.id },
      data: { telegramChatId: null, telegramLinkCode: null },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
