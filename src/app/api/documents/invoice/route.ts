import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkDocumentLimit } from "@/lib/subscription";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/lib/pdf/invoice";
import { createElement } from "react";

interface ItemInput {
  name: string;
  unit?: string;
  quantity: number;
  price: number;
  total: number;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Проверка лимита по тарифу
    const { allowed, used, limit, plan } = await checkDocumentLimit(user.id);
    if (!allowed) {
      return NextResponse.json(
        { error: `Лимит документов исчерпан (${used}/${limit}). Перейдите на тариф Про.`, upgrade: true },
        { status: 403 }
      );
    }

    const body = await req.json();

    const { clientId, serviceName, quantity, price, contractNumber, contractDate, date, items } = body;

    if (!clientId || (!serviceName && (!items || items.length === 0))) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, userId: user.id },
    });
    if (!client) return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });

    const lastDoc = await prisma.document.findFirst({
      where: { userId: user.id, type: "INVOICE" },
      orderBy: { number: "desc" },
    });
    const number = (lastDoc?.number ?? 0) + 1;

    const itemsList: ItemInput[] = items && items.length > 0
      ? items
      : [{ name: serviceName, unit: "услуга", quantity: Number(quantity || 1), price: Number(price), total: Number(quantity || 1) * Number(price) }];

    const total = itemsList.reduce((sum: number, it: ItemInput) => sum + it.total, 0);

    const document = await prisma.document.create({
      data: {
        userId: user.id,
        clientId,
        type: "INVOICE",
        number,
        serviceName: itemsList.map((it: ItemInput) => it.name).join(", "),
        unit: "услуга",
        quantity: itemsList.length === 1 ? itemsList[0].quantity : 1,
        price: itemsList.length === 1 ? itemsList[0].price : total,
        total,
        contractNumber: contractNumber || null,
        contractDate: contractDate ? new Date(contractDate) : null,
        date: date ? new Date(date) : new Date(),
        items: {
          create: itemsList.map((it: ItemInput) => ({
            name: it.name,
            unit: it.unit || "услуга",
            quantity: it.quantity,
            price: it.price,
            total: it.total,
          })),
        },
      },
    });

    const pdfData = {
      number,
      date: document.date,
      seller: {
        name: user.fullName || "",
        iin: user.iin || "",
        bankName: user.bankName || "",
        iban: user.iban || "",
        bik: user.bik || "",
        kbe: user.kbe || "",
        address: user.address || "",
        directorName: user.directorName || "",
        phone: user.phone || "",
      },
      buyer: {
        name: client.name,
        bin: client.bin,
        bankName: client.bankName || "",
        iban: client.iban || "",
        bik: client.bik || "",
        kbe: client.kbe || "",
        address: client.address || "",
        directorName: client.directorName || "",
      },
      serviceName: itemsList[0].name,
      unit: "услуга",
      quantity: itemsList[0].quantity,
      price: itemsList[0].price,
      total,
      multiItems: itemsList.length > 1 ? itemsList : undefined,
      contractNumber: contractNumber || null,
      contractDate: contractDate ? new Date(contractDate) : null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(createElement(InvoicePDF, { data: pdfData }) as any);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="schet-${number}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Invoice PDF error:", err);
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("Stack:", stack);
    return NextResponse.json({ error: `Ошибка генерации счёта: ${message}` }, { status: 500 });
  }
}
