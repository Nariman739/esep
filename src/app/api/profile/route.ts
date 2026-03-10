import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAuth();
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await req.json();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: data.fullName,
        iin: data.iin,
        bankName: data.bankName,
        iban: data.iban,
        bik: data.bik,
        kbe: data.kbe,
        address: data.address,
        directorName: data.directorName,
        phone: data.phone,
        isProfileComplete: true,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
