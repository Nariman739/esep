// ESF Upload API — submit signed invoice to esf.gov.kz
// POST /api/esf/upload  { signedXml, sessionToken }

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const ESF_BASE = process.env.ESF_API_URL || "http://esf.gov.kz:8080/esf-web/ws/api1";

async function soapCall(service: string, body: string, sessionToken: string): Promise<string> {
  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:esf="esf">
  <soap:Header/>
  <soap:Body>${body}</soap:Body>
</soap:Envelope>`;

  const res = await fetch(`${ESF_BASE}/${service}`, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml;charset=UTF-8",
      "SOAPAction": "",
      "Cookie": `auth_token=${sessionToken}`,
    },
    body: envelope,
  });

  if (!res.ok) throw new Error(`ESF SOAP error: ${res.status} ${res.statusText}`);
  return res.text();
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const { signedXml, sessionToken } = await req.json();

    if (!signedXml || !sessionToken) {
      return NextResponse.json({ error: "signedXml и sessionToken обязательны" }, { status: 400 });
    }

    const body = `
      <esf:syncInvoice>
        <invoiceInput><![CDATA[${signedXml}]]></invoiceInput>
      </esf:syncInvoice>`;

    const responseXml = await soapCall("UploadInvoiceService", body, sessionToken);

    const invoiceId = responseXml.match(/<invoiceId[^>]*>([^<]+)<\/invoiceId>/)?.[1];
    const regNum = responseXml.match(/<regNum[^>]*>([^<]+)<\/regNum>/)?.[1];
    const status = responseXml.match(/<status[^>]*>([^<]+)<\/status>/)?.[1];
    const errorMsg = responseXml.match(/<errorMessage[^>]*>([^<]+)<\/errorMessage>/)?.[1];

    if (errorMsg) {
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    return NextResponse.json({ invoiceId, regNum, status });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
