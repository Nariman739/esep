import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_PRICES } from "@/lib/subscription";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const planParam = req.nextUrl.searchParams.get("plan");

    if (planParam !== "PRO" && planParam !== "PRO_ACCOUNTANT") {
      return NextResponse.json({ error: "Неверный тариф" }, { status: 400 });
    }

    const plan = planParam;
    const amount = PLAN_PRICES[plan];

    // Создаём или получаем подписку
    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, plan: "FREE", status: "ACTIVE" },
    });

    // Если уже платная подписка — не даём создать платёж
    if (subscription.plan !== "FREE" && subscription.status === "ACTIVE" && subscription.expiresAt && subscription.expiresAt > new Date()) {
      return NextResponse.redirect(
        new URL("/dashboard/pricing?already=1", req.url)
      );
    }

    // Отменяем все старые PENDING платежи этого пользователя (защита от дублей)
    await prisma.payment.updateMany({
      where: { userId: user.id, status: "PENDING" },
      data: { status: "FAILED" },
    });

    // Защита от спама: максимум 10 платежей за последний час
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.payment.count({
      where: { userId: user.id, createdAt: { gte: oneHourAgo } },
    });
    if (recentCount >= 10) {
      return NextResponse.json(
        { error: "Слишком много попыток. Попробуйте через час." },
        { status: 429 }
      );
    }

    // Создаём запись оплаты
    const orderId = `ESEP-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const payment = await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        userId: user.id,
        amount,
        method: "kaspi",
        status: "PENDING",
        kaspiOrderId: orderId,
      },
    });

    // Редирект на страницу оплаты
    return NextResponse.redirect(
      new URL(`/dashboard/payment?paymentId=${payment.id}&plan=${plan}`, req.url)
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка создания платежа" }, { status: 500 });
  }
}
