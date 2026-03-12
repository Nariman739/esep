import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/lib/pdf/invoice";
import { AvrPDF } from "@/lib/pdf/avr";
import { createElement } from "react";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const doc = await prisma.document.findFirst({
      where: { id, userId: user.id },
      include: { client: true },
    });
    if (!doc) return NextResponse.json({ error: "Документ не найден" }, { status: 404 });

    const seller = {
      name: user.fullName || "",
      iin: user.iin || "",
      bankName: user.bankName || "",
      iban: user.iban || "",
      bik: user.bik || "",
      kbe: user.kbe || "",
      address: user.address || "",
      directorName: user.directorName || "",
      phone: user.phone || "",
    };
    const buyer = {
      name: doc.client.name,
      bin: doc.client.bin,
      bankName: doc.client.bankName || "",
      iban: doc.client.iban || "",
      bik: doc.client.bik || "",
      kbe: doc.client.kbe || "",
      address: doc.client.address || "",
      directorName: doc.client.directorName || "",
    };
    const pdfData = {
      number: doc.number,
      date: doc.date,
      seller,
      buyer,
      serviceName: doc.serviceName,
      unit: doc.unit,
      quantity: Number(doc.quantity),
      price: Number(doc.price),
      total: Number(doc.total),
      contractNumber: doc.contractNumber,
      contractDate: doc.contractDate,
    };

    let buffer: Buffer;
    let filename: string;

    if (doc.type === "INVOICE") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buffer = await renderToBuffer(createElement(InvoicePDF, { data: pdfData }) as any);
      filename = `schet-${doc.number}.pdf`;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buffer = await renderToBuffer(createElement(AvrPDF, { data: pdfData }) as any);
      filename = `avr-${doc.number}.pdf`;
    }

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка генерации PDF" }, { status: 500 });
  }
}
