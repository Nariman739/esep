import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { sendTelegramMessage } from "@/lib/telegram";

const DEVELOPER_CHAT_ID = "499592803";

export async function POST(request: Request) {
  try {
    const master = await requireAuth();
    const { message, type } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Напишите сообщение" }, { status: 400 });
    }

    const typeLabel = type === "bug" ? "Баг" : type === "idea" ? "Идея" : "Обратная связь";

    const text = [
      `<b>${typeLabel} от мастера</b>`,
      ``,
      `<b>Мастер:</b> ${master.firstName} ${master.lastName || ""}`.trim(),
      `<b>Email:</b> ${master.email}`,
      master.phone ? `<b>Телефон:</b> ${master.phone}` : null,
      master.companyName ? `<b>Компания:</b> ${master.companyName}` : null,
      ``,
      `<b>Сообщение:</b>`,
      message.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    await sendTelegramMessage(DEVELOPER_CHAT_ID, text);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Ошибка отправки" }, { status: 500 });
  }
}
