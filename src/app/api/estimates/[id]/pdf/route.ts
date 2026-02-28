import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CalculationResult, RoomResult } from "@/lib/types";
import PDFDocument from "pdfkit";
import { NOTO_SANS_REGULAR, NOTO_SANS_BOLD } from "@/lib/fonts";

function fmtPrice(n: number | undefined | null): string {
  const val = Number(n) || 0;
  return new Intl.NumberFormat("ru-RU").format(Math.round(val)) + " ₸";
}

function sanitizeFilename(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function collectPdf(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const master = await requireAuth();
    const { id } = await params;

    const estimate = await prisma.estimate.findFirst({
      where: { id, masterId: master.id },
      include: { master: { select: { companyName: true, firstName: true, phone: true, whatsappPhone: true } } },
    });

    if (!estimate) {
      return NextResponse.json({ error: "Расчёт не найден" }, { status: 404 });
    }

    const calc = (estimate.calculationData ?? {}) as unknown as CalculationResult;
    const company = estimate.master.companyName || estimate.master.firstName || "";
    const total = estimate.total || estimate.standardTotal || 0;
    const contactPhone = estimate.master.whatsappPhone || estimate.master.phone || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roomResults: RoomResult[] = calc?.roomResults
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?? (calc as any)?.variants?.find((v: any) => v.type === "standard")?.rooms
      ?? [];

    // Create PDF
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const promise = collectPdf(doc);
    const pageW = 595.28; // A4 width in points
    const marginL = 40;
    const marginR = 40;
    const rightEdge = pageW - marginR;

    // Register embedded fonts
    doc.registerFont("Sans", NOTO_SANS_REGULAR);
    doc.registerFont("Sans-Bold", NOTO_SANS_BOLD);

    // === HEADER ===
    doc.font("Sans-Bold").fontSize(18).fillColor("#1e3a5f")
      .text(company, marginL, 40, { width: 300 });

    if (contactPhone) {
      doc.font("Sans").fontSize(9).fillColor("#6b7280")
        .text(contactPhone, marginL, doc.y + 2);
    }

    doc.font("Sans").fontSize(9).fillColor("#6b7280")
      .text("Коммерческое предложение", marginR, 40, { align: "right" });
    const dateStr = new Date(estimate.createdAt).toLocaleDateString("ru-RU");
    doc.text(dateStr, marginR, doc.y, { align: "right" });

    // === CLIENT INFO ===
    let y = Math.max(doc.y, 80) + 8;

    doc.fontSize(11).fillColor("#1f2937");
    if (estimate.clientName) {
      doc.font("Sans-Bold").text("Клиент: ", marginL, y, { continued: true });
      doc.font("Sans").text(estimate.clientName);
      y = doc.y + 2;
    }
    if (estimate.clientPhone) {
      doc.font("Sans-Bold").text("Телефон: ", marginL, y, { continued: true });
      doc.font("Sans").text(estimate.clientPhone);
      y = doc.y + 2;
    }
    if (estimate.clientAddress) {
      doc.font("Sans-Bold").text("Адрес: ", marginL, y, { continued: true });
      doc.font("Sans").text(estimate.clientAddress);
      y = doc.y + 2;
    }

    // Separator
    y = doc.y + 6;
    doc.moveTo(marginL, y).lineTo(rightEdge, y).strokeColor("#1e3a5f").lineWidth(1).stroke();
    y += 10;

    // === ROOMS ===
    const colX = [marginL, 310, 390, 470];
    const colW = [260, 70, 70, rightEdge - 470];

    for (const rr of roomResults) {
      // Page break check
      if (y > 720) {
        doc.addPage();
        y = 40;
      }

      // Room header
      doc.font("Sans-Bold").fontSize(12).fillColor("#1e3a5f")
        .text(`${rr.roomName ?? "Комната"} — ${(rr.area ?? 0).toFixed(1)} м²`, marginL, y);
      y = doc.y + 4;

      // Table header
      doc.rect(marginL, y, rightEdge - marginL, 16).fill("#f3f4f6");
      doc.font("Sans-Bold").fontSize(8).fillColor("#6b7280");
      doc.text("Наименование", colX[0] + 4, y + 4, { width: colW[0] });
      doc.text("Кол-во", colX[1], y + 4, { width: colW[1], align: "center" });
      doc.text("Цена", colX[2], y + 4, { width: colW[2], align: "right" });
      doc.text("Сумма", colX[3], y + 4, { width: colW[3], align: "right" });
      y += 18;

      // Table rows
      const items = rr.items ?? [];
      for (const item of items) {
        if (y > 750) {
          doc.addPage();
          y = 40;
        }

        doc.font("Sans").fontSize(9).fillColor("#1f2937");
        doc.text(String(item.itemName ?? ""), colX[0] + 4, y, { width: colW[0] });
        const textH = doc.y - y;
        doc.text(`${item.quantity ?? 0} ${item.unit ?? ""}`, colX[1], y, { width: colW[1], align: "center" });
        doc.text(fmtPrice(item.unitPrice), colX[2], y, { width: colW[2], align: "right" });
        doc.font("Sans-Bold").text(fmtPrice(item.total), colX[3], y, { width: colW[3], align: "right" });

        // Divider line
        const rowH = Math.max(textH, 12);
        y += rowH + 2;
        doc.moveTo(marginL, y).lineTo(rightEdge, y).strokeColor("#eeeeee").lineWidth(0.5).stroke();
        y += 3;
      }

      // Height multiplier note
      if (rr.heightMultiplied) {
        doc.font("Sans").fontSize(8).fillColor("#d97706")
          .text("× 1.3 (высота > 3м)", marginL, y);
        y = doc.y + 2;
      }

      // Room subtotal
      doc.font("Sans-Bold").fontSize(10).fillColor("#1f2937")
        .text(`Итого ${rr.roomName ?? "Комната"}: ${fmtPrice(rr.subtotalAfterHeight ?? 0)}`, marginL, y, { align: "right" });
      y = doc.y + 12;
    }

    // === BOTTOM SEPARATOR ===
    if (y > 720) { doc.addPage(); y = 40; }
    doc.moveTo(marginL, y).lineTo(rightEdge, y).strokeColor("#1e3a5f").lineWidth(1).stroke();
    y += 10;

    // Min order note
    if (calc.minOrderApplied) {
      doc.font("Sans").fontSize(8).fillColor("#6b7280")
        .text("* Применён минимальный заказ", marginL, y, { align: "right" });
      y = doc.y + 4;
    }

    // Grand total
    doc.font("Sans-Bold").fontSize(16).fillColor("#1e3a5f")
      .text(`ИТОГО: ${fmtPrice(total)}`, marginL, y, { align: "right" });
    y = doc.y + 4;

    // Price per m²
    if ((calc.totalArea ?? 0) > 0) {
      doc.font("Sans").fontSize(9).fillColor("#6b7280")
        .text(
          `${fmtPrice(Math.round(total / calc.totalArea))}/м²  |  ${calc.totalArea.toFixed(1)} м²`,
          marginL, y, { align: "right" }
        );
    }

    // Footer
    doc.font("Sans").fontSize(7).fillColor("#9ca3af")
      .text("* Расчёт предварительный. Точная стоимость определяется после замера.", marginL, 790, { align: "center", width: rightEdge - marginL })
      .text("Создано в PotolokAI", marginL, doc.y, { align: "center", width: rightEdge - marginL });

    doc.end();
    const pdfBuffer = await promise;

    const filename = sanitizeFilename(`KP-${estimate.clientName || "estimate"}-${estimate.publicId.slice(0, 8)}`);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }
    const msg = error instanceof Error ? error.message : String(error);
    console.error("PDF generation error:", msg, error);
    return NextResponse.json({ error: "Ошибка генерации", details: msg }, { status: 500 });
  }
}
