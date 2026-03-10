import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/lib/pdf/invoice";
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

    // Get next document number
    const lastDoc = await prisma.document.findFirst({
      where: { userId: user.id, type: "INVOICE" },
      orderBy: { number: "desc" },
    });
    const number = (lastDoc?.number ?? 0) + 1;

    const total = Number(quantity || 1) * Number(price);

    const document = await prisma.document.create({
      data: {
        userId: user.id,
        clientId,
        type: "INVOICE",
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
      serviceName,
      unit: "услуга",
      quantity: Number(quantity || 1),
      price: Number(price),
      total,
      contractNumber: contractNumber || null,
      contractDate: contractDate ? new Date(contractDate) : null,
    };

    const buffer = await renderToBuffer(createElement(InvoicePDF, { data: pdfData }));

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="schet-${number}.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка генерации PDF" }, { status: 500 });
  }
}
