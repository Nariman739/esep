import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "Нет текста" }, { status: 400 });

    const response = await client.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: `Ты помощник который извлекает реквизиты из текста на русском языке.
Верни JSON с полями:
- name: полное название компании или ФИО ИП
- bin: БИН или ИИН (только цифры, 12 символов)
- bankName: название банка
- iban: номер счета (IIK/IBAN, начинается с KZ)
- bik: БИК банка
- kbe: КБе (2 цифры)
- address: юридический адрес
- directorName: ФИО директора/руководителя
- phone: телефон

Если поле не найдено — верни null. Верни ТОЛЬКО JSON без markdown.`,
        },
        { role: "user", content: text },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Ошибка парсинга" }, { status: 500 });
  }
}
