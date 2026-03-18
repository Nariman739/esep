import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const filterType = req.nextUrl.searchParams.get("type") as "INVOICE" | "AVR" | "ESF" | null;

    const docs = await prisma.document.findMany({
      where: {
        userId: user.id,
        ...(filterType && ["INVOICE", "AVR", "ESF"].includes(filterType) ? { type: filterType } : {}),
      },
      include: { client: true },
      orderBy: { date: "desc" },
    });

    const TYPE_LABEL: Record<string, string> = {
      INVOICE: "Счет",
      AVR: "АВР",
      ESF: "ЭСФ",
    };

    // Build rows
    const rows = docs.map((doc) => ({
      "Тип": TYPE_LABEL[doc.type] || doc.type,
      "Номер": doc.number,
      "Дата": new Date(doc.date).toLocaleDateString("ru-KZ"),
      "Клиент": doc.client.name,
      "БИН клиента": doc.client.bin,
      "Услуга / Работа": doc.serviceName,
      "Кол-во": Number(doc.quantity),
      "Цена": Number(doc.price),
      "Сумма": Number(doc.total),
      "Договор": doc.contractNumber || "",
      "Дата договора": doc.contractDate ? new Date(doc.contractDate).toLocaleDateString("ru-KZ") : "",
      "Создано": new Date(doc.createdAt).toLocaleDateString("ru-KZ"),
    }));

    // Add total row
    const totalSum = docs.reduce((sum, d) => sum + Number(d.total), 0);
    rows.push({
      "Тип": "",
      "Номер": 0,
      "Дата": "",
      "Клиент": "",
      "БИН клиента": "",
      "Услуга / Работа": "ИТОГО",
      "Кол-во": 0,
      "Цена": 0,
      "Сумма": totalSum,
      "Договор": "",
      "Дата договора": "",
      "Создано": "",
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Column widths
    ws["!cols"] = [
      { wch: 8 },   // Тип
      { wch: 8 },   // Номер
      { wch: 12 },  // Дата
      { wch: 30 },  // Клиент
      { wch: 14 },  // БИН
      { wch: 35 },  // Услуга
      { wch: 8 },   // Кол-во
      { wch: 12 },  // Цена
      { wch: 14 },  // Сумма
      { wch: 15 },  // Договор
      { wch: 14 },  // Дата договора
      { wch: 12 },  // Создано
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Документы");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const now = new Date().toISOString().split("T")[0];
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="esep-documents-${now}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Ошибка экспорта" }, { status: 500 });
  }
}
