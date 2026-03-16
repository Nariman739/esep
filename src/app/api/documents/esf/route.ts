import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { EsfPDF } from "@/lib/pdf/esf";
import { createElement } from "react";
import { formatDate } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { avrId, turnoverDate } = body;

    if (!avrId) {
      return NextResponse.json({ error: "Выберите АВР" }, { status: 400 });
    }

    // Fetch AVR document with client
    const avr = await prisma.document.findFirst({
      where: { id: avrId, userId: user.id, type: "AVR" },
      include: { client: true },
    });
    if (!avr) {
      return NextResponse.json({ error: "АВР не найден" }, { status: 404 });
    }

    // Get next ESF number
    const lastEsf = await prisma.document.findFirst({
      where: { userId: user.id, type: "ESF" },
      orderBy: { number: "desc" },
    });
    const esfNumber = (lastEsf?.number ?? 0) + 1;

    // Save ESF document record
    await prisma.document.create({
      data: {
        userId: user.id,
        clientId: avr.clientId,
        type: "ESF",
        number: esfNumber,
        serviceName: avr.serviceName,
        unit: avr.unit,
        quantity: avr.quantity,
        price: avr.price,
        total: avr.total,
        contractNumber: avr.contractNumber,
        contractDate: avr.contractDate,
        date: new Date(),
      },
    });

    const pdfData = {
      number: String(esfNumber),
      date: new Date(),
      turnoverDate: turnoverDate ? new Date(turnoverDate) : new Date(avr.date),
      seller: {
        iin: user.iin || "",
        name: user.fullName || "",
        address: user.address || "",
        kbe: user.kbe || "",
        iban: user.iban || "",
        bik: user.bik || "",
        bankName: user.bankName || "",
      },
      buyer: {
        iin: avr.client.bin,
        name: avr.client.name,
        address: avr.client.address || "",
        kbe: avr.client.kbe || "",
        iban: avr.client.iban || "",
        bik: avr.client.bik || "",
        bankName: avr.client.bankName || "",
      },
      items: [
        {
          name: avr.serviceName,
          unit: avr.unit,
          qty: Number(avr.quantity),
          price: Number(avr.price),
          total: Number(avr.total),
        },
      ],
      totalSum: Number(avr.total),
      hasContract: !!avr.contractNumber,
      contractNumber: avr.contractNumber || undefined,
      contractDate: avr.contractDate ? formatDate(new Date(avr.contractDate)) : undefined,
      avrNumber: String(avr.number),
      avrDate: formatDate(new Date(avr.date)),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(createElement(EsfPDF, { data: pdfData }) as any);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="esf-${esfNumber}.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка генерации ЭСФ" }, { status: 500 });
  }
}
