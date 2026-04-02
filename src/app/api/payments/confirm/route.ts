import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLAN_PRICES, type PlanType } from "@/lib/subscription";
import crypto from "crypto";

// Timing-safe сравнение
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// GET /api/payments/confirm?orderId=ESEP-xxx&secret=xxx
// Для ручного подтверждения с телефона админом (Нариман)
// Пример: esep-murex.vercel.app/api/payments/confirm?orderId=ESEP-xxx&secret=xxx
export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get("orderId");
    const secret = req.nextUrl.searchParams.get("secret");

    const adminSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!adminSecret || !secret || !safeCompare(secret, adminSecret)) {
      return new NextResponse(
        html("Нет доступа", "Неверный секретный ключ", "red"),
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    if (!orderId) {
      // Показать список PENDING платежей
      const pending = await prisma.payment.findMany({
        where: { status: "PENDING" },
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      if (pending.length === 0) {
        return new NextResponse(
          html("Нет ожидающих платежей", "Все платежи обработаны", "green"),
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }

      const rows = pending.map((p) => {
        const age = Math.round((Date.now() - p.createdAt.getTime()) / 60000);
        const confirmUrl = `/api/payments/confirm?orderId=${p.kaspiOrderId}&secret=${secret}`;
        return `<div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <div>
              <p style="font-weight:700;color:#111">${p.user.fullName || p.user.email}</p>
              <p style="font-size:13px;color:#6b7280">${p.kaspiOrderId} · ${age} мин назад</p>
              <p style="font-size:18px;font-weight:800;color:#111;margin-top:4px">${Number(p.amount).toLocaleString()} ₸</p>
            </div>
            <a href="${confirmUrl}" style="background:#16a34a;color:#fff;padding:10px 20px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
              Подтвердить
            </a>
          </div>
        </div>`;
      }).join("");

      return new NextResponse(
        htmlPage("Ожидающие платежи", rows),
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // Подтверждаем конкретный платёж
    const payment = await prisma.payment.findFirst({
      where: { kaspiOrderId: orderId, status: "PENDING" },
    });

    if (!payment) {
      return new NextResponse(
        html("Платёж не найден", "Уже подтверждён или не существует", "amber"),
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // Проверяем что платёж не старше 24 часов
    const ageMs = Date.now() - payment.createdAt.getTime();
    if (ageMs > 24 * 60 * 60 * 1000) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      return new NextResponse(
        html("Платёж просрочен", "Старше 24 часов — отменён", "red"),
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // Определяем план
    const amount = Number(payment.amount);
    let plan: PlanType = "PRO";
    if (amount === PLAN_PRICES.PRO_ACCOUNTANT) plan = "PRO_ACCOUNTANT";

    // Активируем в транзакции
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

    return new NextResponse(
      html(
        "Оплата подтверждена!",
        `${orderId} — ${amount.toLocaleString()} ₸ — тариф ${plan}`,
        "green"
      ),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (err) {
    console.error("Confirm error:", err);
    return new NextResponse(
      html("Ошибка", String(err), "red"),
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 500 }
    );
  }
}

function html(title: string, subtitle: string, color: string) {
  const colors: Record<string, string> = {
    green: "#16a34a", red: "#dc2626", amber: "#d97706",
  };
  const c = colors[color] || "#6366f1";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Esep — ${title}</title></head>
  <body style="font-family:-apple-system,system-ui,sans-serif;background:#f9fafb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px">
    <div style="text-align:center;max-width:400px">
      <div style="width:64px;height:64px;border-radius:50%;background:${c}20;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
        <div style="width:24px;height:24px;border-radius:50%;background:${c}"></div>
      </div>
      <h1 style="font-size:24px;font-weight:800;color:#111;margin:0 0 8px">${title}</h1>
      <p style="color:#6b7280;font-size:14px;margin:0">${subtitle}</p>
    </div>
  </body></html>`;
}

function htmlPage(title: string, content: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Esep — ${title}</title></head>
  <body style="font-family:-apple-system,system-ui,sans-serif;background:#f9fafb;margin:0;padding:20px">
    <div style="max-width:500px;margin:0 auto">
      <h1 style="font-size:22px;font-weight:800;color:#111;margin:0 0 16px">${title}</h1>
      ${content}
    </div>
  </body></html>`;
}
