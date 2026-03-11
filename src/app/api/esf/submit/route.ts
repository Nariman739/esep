// ESF Submit — full flow: parse .p12, create session, sign, upload
// POST /api/esf/submit { p12Base64, password, invoiceData }

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { loadP12 } from "@/lib/esf/signer";
import { createEsfSession, closeEsfSession } from "@/lib/esf/session";
import { uploadInvoice } from "@/lib/esf/upload";
import { buildInvoiceXml } from "@/lib/esf/invoice-xml";
import type { EsfInvoiceData } from "@/lib/esf/invoice-xml";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const { p12Base64, password, invoiceData } = await req.json() as {
      p12Base64: string;
      password: string;
      invoiceData: EsfInvoiceData;
    };

    if (!p12Base64 || !password || !invoiceData) {
      return NextResponse.json({ error: "p12Base64, password и invoiceData обязательны" }, { status: 400 });
    }

    // Parse .p12 certificate
    const p12Buffer = Buffer.from(p12Base64, "base64");
    const certInfo = loadP12(p12Buffer, password);

    // Build invoice XML
    const invoiceXml = buildInvoiceXml(invoiceData);

    // Create ESF session
    const sessionToken = await createEsfSession(certInfo);

    try {
      // Upload signed invoice
      const result = await uploadInvoice(invoiceXml, certInfo, sessionToken);

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ invoiceId: result.invoiceId, regNum: result.regNum, status: result.status });
    } finally {
      await closeEsfSession(sessionToken).catch(() => {});
    }
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("Invalid password") || msg.includes("PKCS#12")) {
      return NextResponse.json({ error: "Неверный пароль от ЭЦП или повреждённый файл" }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
