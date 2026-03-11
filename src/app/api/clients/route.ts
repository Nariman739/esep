import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuth();
    const clients = await prisma.client.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(clients);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Нет ID" }, { status: 400 });

    await prisma.client.deleteMany({
      where: { id, userId: user.id },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await req.json();

    if (!data.name || !data.bin) {
      return NextResponse.json({ error: "Укажите название и БИН" }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        userId: user.id,
        name: data.name,
        bin: data.bin,
        bankName: data.bankName || null,
        iban: data.iban || null,
        bik: data.bik || null,
        kbe: data.kbe || null,
        address: data.address || null,
        directorName: data.directorName || null,
        phone: data.phone || null,
        email: data.email || null,
      },
    });

    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
