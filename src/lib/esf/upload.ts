// ESF Invoice upload — syncInvoice via UploadInvoiceService

import { soapCall } from "./session";
import { signXmlForEsf } from "./signer";
import type { CertInfo } from "./signer";

export interface UploadResult {
  invoiceId?: string;
  regNum?: string;
  status?: string;
  error?: string;
}

/**
 * Upload (submit) signed ESF invoice to esf.gov.kz
 */
export async function uploadInvoice(
  invoiceXml: string,
  certInfo: CertInfo,
  sessionToken: string
): Promise<UploadResult> {
  // Sign the XML
  const { signatureValue, x509Certificate } = signXmlForEsf(invoiceXml, certInfo);

  // Wrap in signed container
  const signedXml = `
    <invoiceContainer>
      <xml><![CDATA[${invoiceXml}]]></xml>
      <signatureContainer>
        <signature>${signatureValue}</signature>
        <certificate>${x509Certificate}</certificate>
      </signatureContainer>
    </invoiceContainer>`;

  const body = `
    <esf:syncInvoice>
      <invoiceInput>${signedXml}
      </invoiceInput>
    </esf:syncInvoice>`;

  const responseXml = await soapCall("UploadInvoiceService", body, sessionToken);

  // Parse response
  const invoiceId = responseXml.match(/<invoiceId[^>]*>([^<]+)<\/invoiceId>/)?.[1];
  const regNum = responseXml.match(/<regNum[^>]*>([^<]+)<\/regNum>/)?.[1];
  const status = responseXml.match(/<status[^>]*>([^<]+)<\/status>/)?.[1];
  const errorMsg = responseXml.match(/<errorMessage[^>]*>([^<]+)<\/errorMessage>/)?.[1];

  if (errorMsg) {
    return { error: errorMsg };
  }

  return { invoiceId, regNum, status };
}
