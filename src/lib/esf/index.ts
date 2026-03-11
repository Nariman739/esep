// ESF (ИС ЭСФ) integration — main entry point
// Usage: call submitEsf() with invoice data + .p12 certificate

export { loadP12, signData, getCertPem } from "./signer";
export type { CertInfo } from "./signer";
export { createEsfSession, closeEsfSession } from "./session";
export { buildInvoiceXml } from "./invoice-xml";
export type { EsfInvoiceData } from "./invoice-xml";
export { uploadInvoice } from "./upload";
export type { UploadResult } from "./upload";

import { loadP12 } from "./signer";
import { createEsfSession, closeEsfSession } from "./session";
import { buildInvoiceXml } from "./invoice-xml";
import { uploadInvoice } from "./upload";
import type { EsfInvoiceData } from "./invoice-xml";
import type { UploadResult } from "./upload";

/**
 * Full ESF submission flow:
 * 1. Load .p12 certificate
 * 2. Create session (auth via ЭЦП)
 * 3. Build invoice XML
 * 4. Sign and upload
 * 5. Close session
 */
export async function submitEsf(params: {
  p12Buffer: Buffer;
  p12Password: string;
  invoice: EsfInvoiceData;
}): Promise<UploadResult> {
  const { p12Buffer, p12Password, invoice } = params;

  // Load certificate
  const certInfo = loadP12(p12Buffer, p12Password);

  // Create session
  const sessionToken = await createEsfSession(certInfo);

  try {
    // Build and submit invoice
    const invoiceXml = buildInvoiceXml(invoice);
    const result = await uploadInvoice(invoiceXml, certInfo, sessionToken);
    return result;
  } finally {
    // Always close session
    await closeEsfSession(sessionToken).catch(() => {});
  }
}
