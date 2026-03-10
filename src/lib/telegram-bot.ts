// Telegram Bot — AI assistant logic for PotolokAI
// Handles: text messages, photos (vision), voice messages (STT)

import { prisma } from "@/lib/prisma";
import { getOpenRouter, AI_MODEL, VISION_MODEL } from "@/lib/openrouter";
import {
  buildSystemPrompt,
  computeRoomSummary,
} from "@/lib/assistant-prompt";
import { calculate } from "@/lib/calculate";
import { DEFAULT_PRICES, KP_LIMITS } from "@/lib/constants";
import {
  sendTelegramMessage,
  sendTypingAction,
  downloadTelegramFile,
  getTelegramFileUrl,
} from "@/lib/telegram";
import type { ChatMessage, RoomInput, CalculationResult } from "@/lib/types";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// ─────────────────────────────────────────────────────
// Main entry: process any Telegram message
// ─────────────────────────────────────────────────────
export async function handleTelegramBotMessage(
  chatId: string,
  text: string | null,
  photoFileId: string | null,
  voiceFileId: string | null
): Promise<void> {
  // Find master by chatId
  const master = await prisma.master.findUnique({
    where: { telegramChatId: chatId },
    select: {
      id: true,
      firstName: true,
      companyName: true,
    },
  });

  if (!master) {
    await sendTelegramMessage(
      chatId,
      "❌ Аккаунт не привязан.\n\nПерейдите в <b>Профиль → Telegram</b> на potolok.ai и нажмите «Привязать»."
    );
    return;
  }

  // Show typing indicator
  await sendTypingAction(chatId);

  // Handle voice → convert to text
  let messageText = text;
  if (voiceFileId && !messageText) {
    messageText = await transcribeVoice(voiceFileId);
    if (!messageText) {
      await sendTelegramMessage(chatId, "⚠️ Не удалось распознать голосовое сообщение. Попробуйте текстом.");
      return;
    }
  }

  // Handle photo → get URL for vision
  let imageUrl: string | null = null;
  if (photoFileId) {
    imageUrl = await getTelegramFileUrl(photoFileId);
    if (!imageUrl) {
      await sendTelegramMessage(chatId, "⚠️ Не удалось загрузить фото. Попробуйте ещё раз.");
      return;
    }
  }

  if (!messageText && !imageUrl) {
    await sendTelegramMessage(chatId, "Отправьте фото замеров, текст или голосовое сообщение 📸");
    return;
  }

  // Process through AI
  try {
    const result = await processAIChat(master.id, master.companyName || master.firstName, messageText, imageUrl);
    await sendTelegramMessage(chatId, result.response);

    // If client_data was extracted and we have a calculation → auto-create КП
    if (result.clientData && result.calculationResult && result.extractedRooms) {
      await createEstimateFromBot(
        chatId,
        master.id,
        result.extractedRooms,
        result.calculationResult,
        result.clientData,
        result.sessionId
      );
    }
  } catch (error) {
    console.error("Telegram bot AI error:", error);
    await sendTelegramMessage(chatId, "⚠️ Ошибка AI. Попробуйте ещё раз через минуту.");
  }
}

// ─────────────────────────────────────────────────────
// AI Chat — same logic as web assistant but non-streaming
// ─────────────────────────────────────────────────────
interface AIResult {
  response: string;
  extractedRooms: RoomInput[] | null;
  calculationResult: CalculationResult | null;
  clientData: { name?: string; phone?: string; address?: string } | null;
  sessionId: string;
}

async function processAIChat(
  masterId: string,
  masterName: string,
  message: string | null,
  imageUrl: string | null
): Promise<AIResult> {
  // Load master prices
  const masterPrices = await prisma.masterPrice.findMany({
    where: { masterId },
  });
  const prices: Record<string, number> = { ...DEFAULT_PRICES };
  for (const mp of masterPrices) {
    prices[mp.itemCode] = mp.price;
  }

  // Get or create active Telegram chat session
  let chatSession = await prisma.chatSession.findFirst({
    where: { masterId, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
  });

  if (!chatSession) {
    chatSession = await prisma.chatSession.create({
      data: { masterId },
    });
  }

  const existingMessages = (chatSession.messages ?? []) as unknown as ChatMessage[];

  const userMsg: ChatMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: message || "Отправлено фото",
    imageUrl: imageUrl ?? undefined,
    timestamp: new Date().toISOString(),
  };

  const allMessages = [...existingMessages, userMsg];

  const photoUrls = [...(chatSession.photoUrls || [])];
  if (imageUrl) photoUrls.push(imageUrl);

  // Vision extraction if photo
  let visionData: string | null = null;
  if (imageUrl) {
    visionData = await extractRoomsFromPhoto(imageUrl);
  }

  // Build enriched user content
  let userContent: string;
  if (visionData) {
    const summary = computeRoomSummary(visionData);
    const summaryBlock = summary ? `\n[СВОДКА: ${summary}]` : "";
    userContent = `[ФОТО-АНАЛИЗ: ${visionData}]${summaryBlock}\n\n${message || "Посчитай"}`;
  } else {
    userContent = message || "Отправлено фото";
  }

  const systemPrompt = buildSystemPrompt(masterName, prices);

  // Build OpenAI messages
  const openaiMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
  ];

  for (let i = 0; i < allMessages.length; i++) {
    const msg = allMessages[i];
    const isCurrentMsg = i === allMessages.length - 1;

    if (msg.role === "user") {
      if (isCurrentMsg && visionData) {
        openaiMessages.push({ role: "user", content: userContent });
      } else if (isCurrentMsg && imageUrl) {
        // Vision failed — pass image directly
        openaiMessages.push({
          role: "user",
          content: [
            { type: "text", text: message || "Посчитай" },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        });
      } else {
        openaiMessages.push({ role: "user", content: msg.content });
      }
    } else {
      openaiMessages.push({ role: "assistant", content: msg.content });
    }
  }

  // Non-streaming AI call
  const result = await getOpenRouter().chat.completions.create({
    model: AI_MODEL,
    messages: openaiMessages,
    stream: false,
    max_tokens: 2000,
  });

  const fullContent = result.choices[0]?.message?.content?.trim() || "Нет ответа от AI";

  // Parse room_data and calculate
  const roomDataMatch = fullContent.match(/```room_data\s*\n([\s\S]*?)\n```/);
  let extractedRooms: RoomInput[] | null = null;
  let calculationResult = null;

  if (roomDataMatch) {
    try {
      const rawRooms = JSON.parse(roomDataMatch[1]);
      extractedRooms = rawRooms.map((r: Record<string, unknown>) => {
        const area = Number(r.area) || 0;
        let length = Number(r.length) || 0;
        let width = Number(r.width) || 0;

        if (area > 0 && (length === 0 || width === 0)) {
          length = Math.round(Math.sqrt(area * 1.3) * 10) / 10;
          width = Math.round(Math.sqrt(area / 1.3) * 10) / 10;
        }

        return {
          id: crypto.randomUUID(),
          name: r.name || "Комната",
          length,
          width,
          ceilingHeight: Number(r.ceilingHeight) || 3,
          canvasType: (r.canvasType as string) || "mat",
          spotsCount: Number(r.spotsCount) || 0,
          chandelierCount: Number(r.chandelierCount) || 0,
          trackMagneticLength: 0,
          lightLineLength: 0,
          curtainRodLength: Number(r.curtainRodLength) || 0,
          pipeBypasses: Number(r.pipeBypasses) || 0,
          cornersCount: Number(r.cornersCount) || 4,
          eurobrusCount: 0,
          shape: (r.shape as string) || undefined,
          lShapeDims: r.lShapeDims || undefined,
          tShapeDims: r.tShapeDims || undefined,
        };
      });

      calculationResult = calculate(extractedRooms!, prices);
    } catch (e) {
      console.error("Failed to parse room_data in Telegram bot:", e);
    }
  }

  // Save to DB
  const assistantMsg: ChatMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: fullContent,
    timestamp: new Date().toISOString(),
    calculationResult: calculationResult ?? undefined,
  };

  const updatedMessages = [...allMessages, assistantMsg];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {
    messages: JSON.parse(JSON.stringify(updatedMessages)),
    photoUrls,
  };
  if (extractedRooms) {
    updateData.extractedRooms = JSON.parse(JSON.stringify(extractedRooms));
  }
  if (calculationResult) {
    updateData.calculationData = JSON.parse(JSON.stringify(calculationResult));
  }

  await prisma.chatSession.update({
    where: { id: chatSession.id },
    data: updateData,
  });

  // Parse client_data block if present
  const clientDataMatch = fullContent.match(/```client_data\s*\n([\s\S]*?)\n```/);
  let clientData: { name?: string; phone?: string; address?: string } | null = null;
  if (clientDataMatch) {
    try {
      clientData = JSON.parse(clientDataMatch[1]);
    } catch (e) {
      console.error("Failed to parse client_data:", e);
    }
  }

  // Format response for Telegram
  let telegramResponse = cleanMarkdownForTelegram(fullContent);

  // Append calculation summary if available
  if (calculationResult) {
    telegramResponse = appendCalculationSummary(telegramResponse, calculationResult);
  }

  return {
    response: telegramResponse,
    extractedRooms,
    calculationResult,
    clientData,
    sessionId: chatSession.id,
  };
}

// ─────────────────────────────────────────────────────
// Vision Extractor — два прохода через Opus
// Проход 1: читает ВСЕ числа и фигуры с фото
// Проход 2: строит JSON комнат из прочитанных данных
// ─────────────────────────────────────────────────────

const PASS1_READ_NUMBERS = `Ты — высокоточный считыватель рукописных чертежей замеров помещений.

Задача: прочитай АБСОЛЮТНО ВСЕ с фото. Ничего не пропусти.

## ШАГ 1 — ВСЕ ЧИСЛА
Выпиши КАЖДОЕ число видимое на фото, с позицией:
"Числа: 410 (верх-центр), 447 (верх-право), 234 (лево), ..."
Включая маленькие 1-2 значные числа (9, 22, 45, 66, 93 и т.д.)!

## ШАГ 2 — СПЕЦИАЛЬНЫЕ ОБОЗНАЧЕНИЯ
Найди P=... (периметр) и S=... (площадь) — они написаны мастером и ТОЧНЫ.
Текстовые надписи (названия комнат, "холл", "кухня", "сп." и т.д.)

## ШАГ 3 — ВСЕ ЗАМКНУТЫЕ ФИГУРЫ
Опиши КАЖДУЮ замкнутую фигуру на чертеже:
- Позиция (верх-лево, центр, низ-право...)
- Форма (прямоугольник / Г-образная / П-образная / сложная)
- Какие числа расположены вдоль КАЖДОЙ стороны этой фигуры
- Если есть P= или S= рядом — укажи

⚠️ ОБЯЗАТЕЛЬНО:
- Считай ВСЕ фигуры, даже маленькие (кладовки, санузлы)
- Число между двумя фигурами может относиться к обеим — укажи у обеих
- Не пропускай фигуры внизу, по краям, в углах
- Числа 3-4 цифры (139, 293, 410) = САНТИМЕТРЫ
- Числа с точкой/запятой (8.13, 10.64) рядом с P= = уже МЕТРЫ`;

const PASS2_BUILD_ROOMS = `Ты — калькулятор помещений. Из описания чертежа строишь точный JSON.

## ПРАВИЛА РАСЧЁТА

### Единицы
- Числа 3-4 цифры (293, 410, 447) → САНТИМЕТРЫ → делить на 100
- Числа 1-2 цифры (9, 22, 45, 66) рядом со стеной → тоже САНТИМЕТРЫ → делить на 100
- P=8.13 → периметр 8.13 метров (уже метры!)
- S=12.5 → площадь 12.5 м² (уже метры!)

### Площадь
- Прямоугольник: длина × ширина
- Г-образная: раздели на 2 прямоугольника и СЛОЖИ (никогда не вычитай!)
- Если мастер написал S= → используй это значение, оно точнее!

### Периметр
- Сложи длины ВСЕХ стен по контуру
- Если мастер написал P= → используй это значение, оно точнее!

### Проверка
- area ДОЛЖНА быть < max_длина × max_ширина (для непрямоугольных)
- Периметр всегда > 2×(длина + ширина) для Г/П-образных

## ВЫХОДНОЙ ФОРМАТ

Выведи ТОЛЬКО валидный JSON без пояснений:
{
  "documentType": "handwritten_sketch",
  "rooms": [
    {
      "name": "Помещение 1",
      "area": 12.12,
      "length": 3.69,
      "width": 2.94,
      "perimeter": 13.26,
      "spotsCount": 0,
      "curtainRodLength": 0,
      "notes": "Г-образная",
      "rectangles": [
        {"width": 2.94, "height": 3.69, "area": 10.85},
        {"width": 1.30, "height": 0.98, "area": 1.27}
      ]
    }
  ],
  "totalArea": null,
  "notes": null
}

## ПРАВИЛА
- КАЖДАЯ замкнутая фигура = ОТДЕЛЬНАЯ комната (не объединяй!)
- length = максимальная длина, width = максимальная ширина
- Названия: если на чертеже написано — используй, иначе "Помещение 1", "Помещение 2"...
- Кружочки внутри комнаты = споты → spotsCount
- "rectangles" обязательно для Г/П/Т-образных
- Порядок: от большей площади к меньшей
- Нечёткие цифры → null`;

async function extractRoomsFromPhoto(imageUrl: string): Promise<string | null> {
  try {
    // ПРОХОД 1: Opus читает ВСЕ числа и фигуры с фото
    const pass1 = await getOpenRouter().chat.completions.create({
      model: VISION_MODEL,
      messages: [
        { role: "system", content: PASS1_READ_NUMBERS },
        {
          role: "user",
          content: [
            { type: "text", text: "Прочитай все числа и опиши все фигуры на этом чертеже замеров" },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      stream: false,
      max_tokens: 3000,
    });

    const numbersDescription = pass1.choices[0]?.message?.content?.trim();
    if (!numbersDescription) return null;

    console.log("Vision pass 1 (numbers):", numbersDescription.slice(0, 500));

    // ПРОХОД 2: строим JSON из прочитанных данных
    const pass2 = await getOpenRouter().chat.completions.create({
      model: VISION_MODEL,
      messages: [
        { role: "system", content: PASS2_BUILD_ROOMS },
        {
          role: "user",
          content: `Вот описание чертежа замеров помещений:\n\n${numbersDescription}\n\nПострой JSON со всеми комнатами.`,
        },
      ],
      stream: false,
      max_tokens: 3000,
    });

    const raw = pass2.choices[0]?.message?.content?.trim() || null;
    if (!raw) return null;

    console.log("Vision pass 2 (JSON):", raw.slice(0, 500));

    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const cleaned =
      jsonStart !== -1 && jsonEnd > jsonStart
        ? raw.slice(jsonStart, jsonEnd + 1).trim()
        : raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

    JSON.parse(cleaned);
    return cleaned;
  } catch (e) {
    console.error("Vision extraction failed:", e);
    return null;
  }
}

// ─────────────────────────────────────────────────────
// Voice → Text (STT via Groq Whisper)
// ─────────────────────────────────────────────────────
async function transcribeVoice(fileId: string): Promise<string | null> {
  const audioBuffer = await downloadTelegramFile(fileId);
  if (!audioBuffer) return null;

  // Use Groq's Whisper API (free, fast, OpenAI-compatible)
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    console.error("GROQ_API_KEY not set — voice messages disabled");
    return null;
  }

  try {
    const formData = new FormData();
    formData.append("file", new Blob([new Uint8Array(audioBuffer)]), "voice.ogg");
    formData.append("model", "whisper-large-v3-turbo");
    formData.append("language", "ru");

    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${groqKey}` },
      body: formData,
    });

    if (!res.ok) {
      console.error("Groq STT error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data.text || null;
  } catch (e) {
    console.error("Voice transcription failed:", e);
    return null;
  }
}

// ─────────────────────────────────────────────────────
// Format helpers
// ─────────────────────────────────────────────────────

/** Clean AI markdown for Telegram HTML */
function cleanMarkdownForTelegram(text: string): string {
  // Remove ```room_data and ```client_data blocks (internal, not for user)
  let cleaned = text
    .replace(/```room_data\s*\n[\s\S]*?\n```/g, "")
    .replace(/```client_data\s*\n[\s\S]*?\n```/g, "")
    .trim();

  // Convert markdown bold **text** to HTML <b>text</b>
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

  // Convert markdown italic *text* to HTML <i>text</i>
  cleaned = cleaned.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<i>$1</i>");

  // Remove remaining markdown code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "");
  cleaned = cleaned.replace(/`([^`]+)`/g, "<code>$1</code>");

  return cleaned;
}

/** Append calculation summary in readable format */
function appendCalculationSummary(
  text: string,
  calc: { total: number; totalArea: number; pricePerM2: number; roomResults: Array<{ roomName: string; area: number; subtotalAfterHeight: number }> }
): string {
  const lines = ["\n\n📊 <b>Расчёт:</b>"];

  for (const room of calc.roomResults) {
    lines.push(`• ${room.roomName}: ${room.area} м² — ${room.subtotalAfterHeight.toLocaleString("ru")} ₸`);
  }

  lines.push("");
  lines.push(`<b>Итого: ${calc.total.toLocaleString("ru")} ₸</b>`);
  lines.push(`Площадь: ${calc.totalArea} м² | ${calc.pricePerM2.toLocaleString("ru")} ₸/м²`);

  return text + lines.join("\n");
}

// ─────────────────────────────────────────────────────
// Auto-create КП from bot conversation
// ─────────────────────────────────────────────────────
async function createEstimateFromBot(
  chatId: string,
  masterId: string,
  rooms: RoomInput[],
  calcResult: CalculationResult,
  clientData: { name?: string; phone?: string; address?: string },
  sessionId: string
): Promise<void> {
  try {
    // Check KP limit
    const master = await prisma.master.findUnique({
      where: { id: masterId },
      select: { subscriptionTier: true, kpGeneratedThisMonth: true },
    });

    if (!master) return;

    const limit = KP_LIMITS[master.subscriptionTier as keyof typeof KP_LIMITS];
    if (master.kpGeneratedThisMonth >= limit) {
      await sendTelegramMessage(
        chatId,
        `⚠️ Лимит КП исчерпан (${limit}/мес).\n\nПерейдите на PRO для безлимита на potolok.ai`
      );
      return;
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 14);

    const estimate = await prisma.estimate.create({
      data: {
        masterId,
        roomsData: JSON.parse(JSON.stringify(rooms)),
        calculationData: JSON.parse(JSON.stringify(calcResult)),
        totalArea: calcResult.totalArea,
        total: calcResult.total,
        clientName: clientData.name || null,
        clientPhone: clientData.phone || null,
        clientAddress: clientData.address || null,
        validUntil,
      },
    });

    // Link chat session to estimate
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { estimateId: estimate.id },
    });

    // Increment KP counter
    await prisma.master.update({
      where: { id: masterId },
      data: { kpGeneratedThisMonth: { increment: 1 } },
    });

    // Send КП link to master
    const kpUrl = `https://potolok.ai/kp/${estimate.publicId}`;
    await sendTelegramMessage(
      chatId,
      `✅ <b>КП создано!</b>\n\n` +
      `👤 ${clientData.name || "Клиент"}\n` +
      `💰 ${calcResult.total.toLocaleString("ru")} ₸\n` +
      `📐 ${calcResult.totalArea.toFixed(1)} м²\n\n` +
      `🔗 Ссылка для клиента:\n${kpUrl}\n\n` +
      `Отправьте эту ссылку клиенту в WhatsApp 👆\n` +
      `PDF можно скачать на сайте в разделе "Расчёты".`
    );
  } catch (error) {
    console.error("Failed to create estimate from bot:", error);
    await sendTelegramMessage(chatId, "⚠️ Расчёт готов, но КП не удалось сохранить. Попробуйте создать на сайте.");
  }
}

// ─────────────────────────────────────────────────────
// Bot commands
// ─────────────────────────────────────────────────────
export async function handleBotCommand(
  chatId: string,
  command: string,
  masterId: string
): Promise<void> {
  switch (command) {
    case "/new":
    case "/reset": {
      // Close current session, start fresh
      await prisma.chatSession.updateMany({
        where: { masterId, status: "ACTIVE" },
        data: { status: "COMPLETED" },
      });
      await sendTelegramMessage(chatId, "🔄 Новый расчёт начат.\n\nОтправьте фото замеров или напишите размеры комнат.");
      break;
    }

    case "/list":
    case "/kp": {
      // List recent estimates
      const estimates = await prisma.estimate.findMany({
        where: { masterId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          publicId: true,
          clientName: true,
          total: true,
          totalArea: true,
          status: true,
          createdAt: true,
        },
      });

      if (estimates.length === 0) {
        await sendTelegramMessage(chatId, "📋 У вас пока нет КП.\n\nОтправьте фото замеров чтобы начать расчёт.");
        return;
      }

      const statusEmoji: Record<string, string> = {
        DRAFT: "📝",
        SENT: "📤",
        VIEWED: "👀",
        CONFIRMED: "✅",
        REJECTED: "❌",
        REVISED: "🔄",
      };

      const lines = ["📋 <b>Последние КП:</b>\n"];
      for (const est of estimates) {
        const emoji = statusEmoji[est.status] || "📄";
        const date = est.createdAt.toLocaleDateString("ru");
        const client = est.clientName || "Без имени";
        const total = est.total.toLocaleString("ru");
        lines.push(`${emoji} ${client} — ${total} ₸ (${date})`);
        lines.push(`   🔗 potolok.ai/kp/${est.publicId}\n`);
      }

      await sendTelegramMessage(chatId, lines.join("\n"));
      break;
    }

    case "/help": {
      await sendTelegramMessage(
        chatId,
        `🤖 <b>PotolokAI Бот</b>\n\n` +
        `📸 <b>Фото</b> — отправьте фото замеров для расчёта\n` +
        `🎤 <b>Голос</b> — наговорите размеры голосом\n` +
        `✏️ <b>Текст</b> — напишите размеры или задайте вопрос\n\n` +
        `<b>Команды:</b>\n` +
        `/new — начать новый расчёт\n` +
        `/kp — последние КП\n` +
        `/help — эта справка`
      );
      break;
    }

    default:
      break;
  }
}
