import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";
import { formatPrice } from "@/lib/format";

const VARIANT_LABELS: Record<string, string> = {
  economy: "Эконом",
  standard: "Стандарт",
  premium: "Премиум",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const variantType: string | undefined = body.variantType;

    const estimate = await prisma.estimate.findUnique({
      where: { id },
      select: {
        status: true,
        clientName: true,
        confirmedVariant: true,
        economyTotal: true,
        standardTotal: true,
        premiumTotal: true,
        master: {
          select: { telegramChatId: true },
        },
      },
    });

    if (!estimate) {
      return NextResponse.json({ error: "Расчёт не найден" }, { status: 404 });
    }

    if (estimate.status !== "SENT" && estimate.status !== "VIEWED") {
      return NextResponse.json(
        { error: "Невозможно подтвердить в текущем статусе" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status: "CONFIRMED" };
    if (variantType && ["economy", "standard", "premium"].includes(variantType)) {
      updateData.confirmedVariant = variantType;
    }

    await prisma.estimate.update({
      where: { id },
      data: updateData,
    });

    // Telegram notification to master (non-blocking)
    if (estimate.master?.telegramChatId) {
      const variantLabel = variantType ? VARIANT_LABELS[variantType] ?? variantType : "—";
      const priceMap: Record<string, number> = {
        economy: estimate.economyTotal,
        standard: estimate.standardTotal,
        premium: estimate.premiumTotal,
      };
      const price = variantType ? priceMap[variantType] : null;
      const clientStr = estimate.clientName || "Клиент";

      const text =
        `✅ <b>${clientStr} принял КП!</b>\n\n` +
        `💎 Вариант: <b>${variantLabel}</b>\n` +
        (price ? `💰 Сумма: <b>${formatPrice(price)}</b>\n` : "") +
        `\n<i>Откройте дашборд PotolokAI, чтобы посмотреть детали.</i>`;

      sendTelegramMessage(estimate.master.telegramChatId, text);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Confirm estimate error:", error);
    return NextResponse.json({ error: "Ошибка подтверждения" }, { status: 500 });
  }
}