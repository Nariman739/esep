import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLAN_PRICES, type PlanType } from "@/lib/subscription";
import crypto from "crypto";

// Timing-safe сравнение строк (защита от timing атак)
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// POST /api/payments/webhook
// Kaspi Pay webhook или ручное подтверждение
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, secret } = body;

    // Проверка секрета
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!webhookSecret || !secret || typeof secret !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!safeCompare(secret, webhookSecret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId обязателен" }, { status: 400 });
    }

    // Ищем платёж — только PENDING
    const payment = await prisma.payment.findFirst({
      where: { kaspiOrderId: orderId, status: "PENDING" },
    });

    if (!payment) {
      return NextResponse.json({ error: "Платёж не найден или уже обработан" }, { status: 404 });
    }

    // Проверка: платёж не старше 1 часа (защита от replay с просроченными заказами)
    const ageMs = Date.now() - payment.createdAt.getTime();
    if (ageMs > 60 * 60 * 1000) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "Платёж просрочен" }, { status: 410 });
    }

    // Определяем план по сумме и верифицируем
    const amount = Number(payment.amount);
    let plan: PlanType = "PRO";
    if (amount === PLAN_PRICES.PRO_ACCOUNTANT) {
      plan = "PRO_ACCOUNTANT";
    } else if (amount === PLAN_PRICES.PRO) {
      plan = "PRO";
    } else {
      return NextResponse.json({ error: "Неизвестная сумма платежа" }, { status: 400 });
    }

    // Активируем подписку + помечаем платёж как оплаченный — в транзакции
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "PAID" },
      }),
      prisma.subscription.upsert({
        where: { userId: payment.userId },
        update: {
          plan,
          status: "ACTIVE",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        create: {
          userId: payment.userId,
          plan,
          status: "ACTIVE",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return NextResponse.json({ ok: true, plan });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Ошибка обработки" }, { status: 500 });
  }
}
