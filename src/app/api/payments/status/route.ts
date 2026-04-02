import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const paymentId = req.nextUrl.searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId обязателен" }, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId: user.id },
    });

    if (!payment) {
      return NextResponse.json({ error: "Платёж не найден" }, { status: 404 });
    }

    return NextResponse.json({ status: payment.status });
  } catch {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}
