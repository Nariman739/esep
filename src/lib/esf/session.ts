// ESF Session management — createSession / closeSession
// Base URL: https://esf.gov.kz:8443/esf-web/ws/api1 (prod)
//           http://test.esf.gov.kz:7080/esf-web/ws/api1 (test)

import type { CertInfo } from "./signer";
import { signData, getCertPem } from "./signer";

const ESF_BASE = process.env.ESF_API_URL || "http://esf.gov.kz:8080/esf-web/ws/api1";

/**
 * Make a raw SOAP call to ESF
 */
async function soapCall(service: string, body: string, sessionToken?: string): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "text/xml;charset=UTF-8",
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

/**
 * Parse session token from SessionService response
 */
function parseSessionToken(xml: string): string {
  const match = xml.match(/<sessionId[^>]*>([^<]+)<\/sessionId>/);
  if (!match) throw new Error("Не удалось получить sessionId из ответа ESF");
  return match[1];
}

/**
 * Create ESF session using ЭЦП (signed session)
 * This is the main auth method for server-side integration
 */
export async function createEsfSession(certInfo: CertInfo): Promise<string> {
  // Step 1: Get auth ticket (nonce to sign)
  const authTicketXml = await soapCall("SessionService", `
    <esf:createSession>
      <sessionRequest>
        <tin>${certInfo.iin}</tin>
      </sessionRequest>
    </esf:createSession>
  `);

  // Extract nonce/ticket from response
  const nonceMatch = authTicketXml.match(/<nonce[^>]*>([^<]+)<\/nonce>/);
  const nonce = nonceMatch ? nonceMatch[1] : "";

  // Step 2: Sign the nonce with ЭЦП
  const signature = signData(nonce, certInfo.privateKey);
  const x509 = getCertPem(certInfo);

  // Step 3: Create signed session
  const sessionXml = await soapCall("SessionService", `
    <esf:createSessionSigned>
      <sessionRequest>
        <tin>${certInfo.iin}</tin>
        <signature>${signature}</signature>
        <certificate>${x509}</certificate>
      </sessionRequest>
    </esf:createSessionSigned>
  `);

  return parseSessionToken(sessionXml);
}

/**
 * Close ESF session
 */
export async function closeEsfSession(sessionToken: string): Promise<void> {
  await soapCall("SessionService", `<esf:closeSession/>`, sessionToken);
}

export { soapCall };
