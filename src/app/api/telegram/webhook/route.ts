import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

// Telegram sends POST requests to this endpoint
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = String(message.chat?.id ?? "");
    const text: string = message.text ?? "";

    // /start CODE — link master account
    if (text.startsWith("/start")) {
      const parts = text.split(" ");
      const code = parts[1]?.trim();

      if (!code) {
        await sendTelegramMessage(
          chatId,
          "👋 Привет! Это бот PotolokAI.\n\nЧтобы получать уведомления, перейдите в <b>Профиль → Telegram</b> и нажмите «Привязать»."
        );
        return NextResponse.json({ ok: true });
      }

      // Find master by link code
      const master = await prisma.master.findUnique({
        where: { telegramLinkCode: code },
        select: { id: true, firstName: true, telegramChatId: true },
      });

      if (!master) {
        await sendTelegramMessage(
          chatId,
          "❌ Код не найден или уже использован.\n\nСгенерируйте новый код в профиле PotolokAI."
        );
        return NextResponse.json({ ok: true });
      }

      // Save chat_id, clear link code
      await prisma.master.update({
        where: { id: master.id },
        data: {
          telegramChatId: chatId,
          telegramLinkCode: null,
        },
      });

      await sendTelegramMessage(
        chatId,
        `✅ <b>${master.firstName}, аккаунт PotolokAI привязан!</b>\n\nТеперь вы будете получать уведомления, когда клиент принимает КП. 🎉`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true }); // always 200 to Telegram
  }
}
