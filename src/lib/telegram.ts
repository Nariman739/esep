// Telegram notification utility for PotolokAI
// Requires: TELEGRAM_BOT_TOKEN env var
// Requires: master.telegramChatId to be set (master links their account)

export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch {
    // Don't fail the main request if Telegram is unreachable
    console.error("Telegram notification failed (non-critical)");
  }
}