import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { AvrPDF } from "@/lib/pdf/avr";
import { createElement } from "react";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { clientId, serviceName, quantity, price, contractNumber, contractDate, date } = body;

    if (!clientId || !serviceName || !price) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, userId: user.id },
    });
    if (!client) return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });

    // Get next AVR number
    const lastDoc = await prisma.document.findFirst({
      where: { userId: user.id, type: "AVR" },
      orderBy: { number: "desc" },
    });
    const number = (lastDoc?.number ?? 0) + 1;

    const total = Number(quantity || 1) * Number(price);

    await prisma.document.create({
      data: {
        userId: user.id,
        clientId,
        type: "AVR",
        number,
        serviceName,
        unit: "услуга",
        quantity: Number(quantity || 1),
        price: Number(price),
        total,
        contractNumber: contractNumber || null,
        contractDate: contractDate ? new Date(contractDate) : null,
        date: date ? new Date(date) : new Date(),
      },
    });

    const pdfData = {
      number,
      date: date ? new Date(date) : new Date(),
      seller: {
        name: user.fullName || "",
        iin: user.iin || "",
        bankName: user.bankName || "",
        iban: user.iban || "",
        bik: user.bik || "",
        kbe: user.kbe || "",
        address: user.address || "",
        directorName: user.directorName || "",
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
      serviceName,
      unit: "услуга",
      quantity: Number(quantity || 1),
      price: Number(price),
      total,
      contractNumber: contractNumber || null,
      contractDate: contractDate ? new Date(contractDate) : null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(createElement(AvrPDF, { data: pdfData }) as any);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="avr-${number}.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка генерации PDF" }, { status: 500 });
  }
}
