import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { EavrPDF } from "@/lib/pdf/eavr";
import { createElement } from "react";
import { formatDate } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { avrId } = body;

    if (!avrId) {
      return NextResponse.json({ error: "Выберите АВР" }, { status: 400 });
    }

    const avr = await prisma.document.findFirst({
      where: { id: avrId, userId: user.id, type: "AVR" },
      include: { client: true },
    });
    if (!avr) {
      return NextResponse.json({ error: "АВР не найден" }, { status: 404 });
    }

    const pdfData = {
      number: String(avr.number),
      date: new Date(avr.date),
      workDate: new Date(avr.date),
      seller: {
        iin: user.iin || "",
        name: user.fullName || "",
        address: user.address || "",
        kbe: user.kbe || "",
        iban: user.iban || "",
        bik: user.bik || "",
        bankName: user.bankName || "",
        directorName: user.directorName || "",
      },
      buyer: {
        iin: avr.client.bin,
        name: avr.client.name,
        address: avr.client.address || "",
        kbe: avr.client.kbe || "",
        iban: avr.client.iban || "",
        bik: avr.client.bik || "",
        bankName: avr.client.bankName || "",
        directorName: avr.client.directorName || "",
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
      hasNds: false,
      hasContract: !!avr.contractNumber,
      contractNumber: avr.contractNumber || undefined,
      contractDate: avr.contractDate ? formatDate(new Date(avr.contractDate)) : undefined,
      avrNumber: String(avr.number),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(createElement(EavrPDF, { data: pdfData }) as any);

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="eavr-cheatsheet-${avr.number}.pdf"`,
      },
    });
  } catch (err) {
    console.error("EAVR generation error:", err);
    const message = err instanceof Error ? err.message : "Неизвестная ошибка";
    return NextResponse.json({ error: `Ошибка генерации электронного АВР: ${message}` }, { status: 500 });
  }
}
