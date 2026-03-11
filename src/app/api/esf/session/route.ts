// ESF Session API — proxy to esf.gov.kz to avoid CORS
// POST /api/esf/session  { action: "getNonce", tin }
// POST /api/esf/session  { action: "create", tin, signature, certificate }
// POST /api/esf/session  { action: "close", sessionToken }

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const ESF_BASE = process.env.ESF_API_URL || "http://esf.gov.kz:8080/esf-web/ws/api1";

async function soapCall(service: string, body: string, sessionToken?: string): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "text/xml;charset=UTF-8",
    "SOAPAction": "",
  };
  if (sessionToken) {
    headers["Cookie"] = `auth_token=${sessionToken}`;
  }

  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:esf="esf">
  <soap:Header/>
  <soap:Body>${body}</soap:Body>
</soap:Envelope>`;

  const res = await fetch(`${ESF_BASE}/${service}`, {
    method: "POST",
    headers,
    body: envelope,
  });

  if (!res.ok) {
    throw new Error(`ESF SOAP error: ${res.status} ${res.statusText}`);
  }

  return res.text();
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const { action, tin, signature, certificate, sessionToken } = await req.json();

    if (action === "getNonce") {
      // Step 1: get nonce to sign
      const xml = await soapCall("SessionService", `
        <esf:createSession>
          <sessionRequest>
            <tin>${tin}</tin>
          </sessionRequest>
        </esf:createSession>
      `);
      const nonce = xml.match(/<nonce[^>]*>([^<]+)<\/nonce>/)?.[1] || "";
      return NextResponse.json({ nonce });
    }

    if (action === "create") {
      // Step 2: create signed session
      const xml = await soapCall("SessionService", `
        <esf:createSessionSigned>
          <sessionRequest>
            <tin>${tin}</tin>
            <signature>${signature}</signature>
            <certificate>${certificate}</certificate>
          </sessionRequest>
        </esf:createSessionSigned>
      `);
      const token = xml.match(/<sessionId[^>]*>([^<]+)<\/sessionId>/)?.[1];
      if (!token) throw new Error("Не удалось получить sessionId");
      return NextResponse.json({ sessionToken: token });
    }

    if (action === "close") {
      await soapCall("SessionService", `<esf:closeSession/>`, sessionToken);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
