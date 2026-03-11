// ESF Invoice XML builder
// Generates XML for ЭСФ (электронный счёт-фактура) per Kazakhstan tax code

export interface EsfInvoiceData {
  // Номер и дата
  num: string;         // Номер ЭСФ
  date: string;        // Дата выписки YYYY-MM-DD

  // Продавец (Исполнитель / ИП)
  seller: {
    tin: string;       // ИИН/БИН
    name: string;      // Наименование
    address: string;
    iban?: string;
    bik?: string;
  };

  // Покупатель (Заказчик / ТОО)
  buyer: {
    tin: string;       // ИИН/БИН
    name: string;      // Наименование
    address: string;
  };

  // Позиции
  items: {
    num: number;
    name: string;      // Наименование товара/услуги
    unit: string;      // Единица измерения (услуга, шт, м2...)
    qty: number;       // Количество
    price: number;     // Цена за единицу
    total: number;     // Стоимость
    ndsRate: number;   // Ставка НДС (0 для упрощёнки)
    ndsSum: number;    // Сумма НДС (0)
  }[];

  // Договор
  contractNum?: string;
  contractDate?: string;

  // Тип ЭСФ: ORDINARY (обычный), FIXED (исправленный), ADDITIONAL (дополнительный)
  invoiceType?: "ORDINARY" | "FIXED" | "ADDITIONAL";
}

/**
 * Build ESF invoice XML
 * Format based on ИС ЭСФ XML schema
 */
export function buildInvoiceXml(data: EsfInvoiceData): string {
  const { seller, buyer, items } = data;
  const invoiceType = data.invoiceType || "ORDINARY";

  const totalTurnover = items.reduce((s, i) => s + i.total, 0);
  const totalNds = items.reduce((s, i) => s + i.ndsSum, 0);

  const itemsXml = items.map(item => `
        <row rowNum="${item.num}">
          <good>
            <descriptionRu>${escapeXml(item.name)}</descriptionRu>
            <unitCode>${escapeXml(item.unit)}</unitCode>
            <quantity>${item.qty}</quantity>
            <unitPrice>${item.price.toFixed(2)}</unitPrice>
            <turnover>${item.total.toFixed(2)}</turnover>
            <ndsRate>${item.ndsRate}</ndsRate>
            <nds>${item.ndsSum.toFixed(2)}</nds>
            <turnoverWithNds>${(item.total + item.ndsSum).toFixed(2)}</turnoverWithNds>
          </good>
        </row>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<esf:invoices xmlns:esf="esf">
  <esf:invoice>
    <invoiceInfo>
      <invoiceType>${invoiceType}</invoiceType>
      <invoiceNum>${escapeXml(data.num)}</invoiceNum>
      <invoiceDate>${data.date}</invoiceDate>
    </invoiceInfo>
    <sellerInfo>
      <tin>${seller.tin}</tin>
      <legalAddressRu>${escapeXml(seller.address)}</legalAddressRu>
      <name>${escapeXml(seller.name)}</name>
      ${seller.iban ? `<iban>${seller.iban}</iban>` : ""}
      ${seller.bik ? `<bik>${seller.bik}</bik>` : ""}
    </sellerInfo>
    <recipientInfo>
      <tin>${buyer.tin}</tin>
      <name>${escapeXml(buyer.name)}</name>
      <legalAddressRu>${escapeXml(buyer.address)}</legalAddressRu>
    </recipientInfo>
    ${data.contractNum ? `
    <contractInfo>
      <contractNum>${escapeXml(data.contractNum)}</contractNum>
      ${data.contractDate ? `<contractDate>${data.contractDate}</contractDate>` : ""}
    </contractInfo>` : ""}
    <productSet>
      <products>${itemsXml}
      </products>
      <totalTurnover>${totalTurnover.toFixed(2)}</totalTurnover>
      <totalNds>${totalNds.toFixed(2)}</totalNds>
      <totalTurnoverWithNds>${(totalTurnover + totalNds).toFixed(2)}</totalTurnoverWithNds>
    </productSet>
  </esf:invoice>
</esf:invoices>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
