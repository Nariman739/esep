// ЭЦП (digital signature) utilities for ESF integration
// Uses node-forge to work with .p12 certificates from НУЦ РК

import * as forge from "node-forge";

export interface CertInfo {
  privateKey: forge.pki.rsa.PrivateKey;
  certificate: forge.pki.Certificate;
  subjectCN: string;
  iin: string;
}

/**
 * Load and parse a .p12 certificate file
 * @param p12Buffer - Buffer with .p12 file contents
 * @param password - Certificate password
 */
export function loadP12(p12Buffer: Buffer, password: string): CertInfo {
  const p12Der = p12Buffer.toString("binary");
  const p12Asn1 = forge.asn1.fromDer(p12Der);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

  // Extract private key and certificate
  let privateKey: forge.pki.rsa.PrivateKey | null = null;
  let certificate: forge.pki.Certificate | null = null;

  for (const safeContent of p12.safeContents) {
    for (const safeBag of safeContent.safeBags) {
      if (safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag && safeBag.key) {
        privateKey = safeBag.key as forge.pki.rsa.PrivateKey;
      }
      if (safeBag.type === forge.pki.oids.certBag && safeBag.cert) {
        certificate = safeBag.cert;
      }
    }
  }

  if (!privateKey || !certificate) {
    throw new Error("Не удалось извлечь ключ или сертификат из .p12 файла");
  }

  // Extract IIN/BIN from certificate subject
  const subjectCN = certificate.subject.getField("CN")?.value || "";
  // IIN is usually in subjectAltName or CN like "SERIALNUMBER=IIN123456789012"
  const serialField = certificate.subject.getField("serialNumber")?.value ||
                      certificate.subject.getField("2.5.4.5")?.value || "";
  const iin = serialField.replace(/^IIN/, "").replace(/^BIN/, "") || subjectCN;

  return { privateKey, certificate, subjectCN, iin };
}

/**
 * Sign a string with the private key (RSA-SHA256)
 * Returns base64-encoded signature
 */
export function signData(data: string, privateKey: forge.pki.rsa.PrivateKey): string {
  const md = forge.md.sha256.create();
  md.update(data, "utf8");
  const signature = privateKey.sign(md);
  return forge.util.encode64(signature);
}

/**
 * Get certificate in PEM format (for embedding in XML)
 */
export function getCertPem(certInfo: CertInfo): string {
  const der = forge.asn1.toDer(forge.pki.certificateToAsn1(certInfo.certificate));
  return forge.util.encode64(der.getBytes());
}

/**
 * Sign XML for ESF (simplified XMLDSig)
 * Returns the signature value and certificate for embedding in SOAP
 */
export function signXmlForEsf(xmlContent: string, certInfo: CertInfo): {
  signatureValue: string;
  x509Certificate: string;
} {
  const signatureValue = signData(xmlContent, certInfo.privateKey);
  const x509Certificate = getCertPem(certInfo);
  return { signatureValue, x509Certificate };
}
