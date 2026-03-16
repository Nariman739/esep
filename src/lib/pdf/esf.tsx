import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { formatMoney, formatDate } from "@/lib/utils";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf", fontWeight: 400 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
  ],
});

const s = StyleSheet.create({
  page: { fontFamily: "Roboto", fontSize: 8, padding: 24, color: "#1a1a1a" },

  // Title
  mainTitle: { fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 12, color: "#1a365d" },

  // Section header
  sectionHeader: {
    fontSize: 10, fontWeight: 700, backgroundColor: "#e8edf3", padding: "5 8",
    marginTop: 10, marginBottom: 4, borderLeftWidth: 3, borderLeftColor: "#3b82f6",
  },
  subSectionHeader: {
    fontSize: 9, fontWeight: 700, backgroundColor: "#f1f5f9", padding: "3 8",
    marginTop: 6, marginBottom: 3,
  },

  // Field row
  fieldRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#d1d5db", paddingVertical: 3 },
  fieldNum: { width: 28, fontSize: 7, color: "#6b7280", paddingTop: 1 },
  fieldLabel: { width: 160, fontSize: 8, color: "#374151", paddingTop: 1 },
  fieldValue: { flex: 1, fontSize: 8, fontWeight: 700, paddingLeft: 6, minHeight: 12, backgroundColor: "#f9fafb", padding: "2 6", borderRadius: 2 },
  fieldValueEmpty: { flex: 1, fontSize: 7, color: "#9ca3af", fontStyle: "italic", paddingLeft: 6, minHeight: 12, backgroundColor: "#f9fafb", padding: "2 6", borderRadius: 2 },

  // Checkbox
  checkRow: { flexDirection: "row", alignItems: "center", paddingVertical: 2, paddingLeft: 28 },
  checkbox: { width: 10, height: 10, borderWidth: 1, borderColor: "#9ca3af", borderRadius: 2, marginRight: 6, textAlign: "center", fontSize: 8 },
  checkboxChecked: { width: 10, height: 10, borderWidth: 1, borderColor: "#3b82f6", borderRadius: 2, marginRight: 6, textAlign: "center", fontSize: 8, backgroundColor: "#dbeafe" },
  checkLabel: { fontSize: 8, color: "#374151" },

  // Table for goods/services
  table: { marginTop: 4, borderWidth: 0.5, borderColor: "#9ca3af" },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#e8edf3", borderBottomWidth: 0.5, borderColor: "#9ca3af" },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderColor: "#d1d5db" },
  tableRowLast: { flexDirection: "row" },
  th: { fontSize: 6, fontWeight: 700, textAlign: "center", padding: "3 2", borderRightWidth: 0.5, borderColor: "#9ca3af" },
  thLast: { fontSize: 6, fontWeight: 700, textAlign: "center", padding: "3 2" },
  td: { fontSize: 7, textAlign: "center", padding: "3 2", borderRightWidth: 0.5, borderColor: "#d1d5db" },
  tdLeft: { fontSize: 7, textAlign: "left", padding: "3 2", borderRightWidth: 0.5, borderColor: "#d1d5db" },
  tdRight: { fontSize: 7, textAlign: "right", padding: "3 2", borderRightWidth: 0.5, borderColor: "#d1d5db" },
  tdLast: { fontSize: 7, textAlign: "right", padding: "3 2" },
  totalRow: { flexDirection: "row", borderTopWidth: 1, borderColor: "#374151", backgroundColor: "#f1f5f9" },

  // Column widths for G table
  colNum: { width: 20 },
  colOrigin: { width: 20 },
  colName: { width: 120 },
  colUnit: { width: 35 },
  colQty: { width: 35 },
  colPrice: { width: 50 },
  colSum: { width: 50 },
  colNdsRate: { width: 40 },
  colNdsSum: { width: 45 },
  colTotal: { width: 55 },

  // Footer
  footer: { marginTop: 12, fontSize: 7, color: "#6b7280", textAlign: "center", borderTopWidth: 0.5, borderColor: "#d1d5db", paddingTop: 6 },
  footerBold: { fontWeight: 700, color: "#374151" },
});

interface EsfParty {
  iin: string;
  name: string;
  address: string;
  kbe?: string;
  iban?: string;
  bik?: string;
  bankName?: string;
}

interface EsfItem {
  name: string;
  unit: string;
  qty: number;
  price: number;
  total: number;
}

export interface EsfPdfData {
  number: string;
  date: Date;
  turnoverDate: Date;
  seller: EsfParty;
  buyer: EsfParty;
  items: EsfItem[];
  totalSum: number;
  hasContract: boolean;
  contractNumber?: string;
  contractDate?: string;
  avrNumber?: string;
  avrDate?: string;
}

function Field({ num, label, value }: { num: string; label: string; value?: string | null }) {
  return (
    <View style={s.fieldRow}>
      <Text style={s.fieldNum}>{num}</Text>
      <Text style={s.fieldLabel}>{label}</Text>
      {value ? (
        <Text style={s.fieldValue}>{value}</Text>
      ) : (
        <Text style={s.fieldValueEmpty}>-</Text>
      )}
    </View>
  );
}

export function EsfPDF({ data }: { data: EsfPdfData }) {
  const { seller, buyer, items, totalSum } = data;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Title */}
        <Text style={s.mainTitle}>Электронный счёт-фактура (ЭСФ)</Text>

        {/* ===== A. Общий раздел ===== */}
        <Text style={s.sectionHeader}>A. Общий раздел</Text>
        <Field num="1." label="Рег. номер" value="(присвоится автоматически)" />
        <Field num="1.1." label="Номер учетной системы" value={data.number} />
        <Field num="2." label="Дата выписки" value={formatDate(data.date)} />
        <Field num="3." label="Дата совершения оборота" value={formatDate(data.turnoverDate)} />
        <View style={{ paddingLeft: 28, paddingTop: 2 }}>
          <Text style={{ fontSize: 7, color: "#6b7280", marginBottom: 2 }}>Тип ЭСФ:</Text>
          <View style={s.checkRow}>
            <View style={s.checkbox}><Text> </Text></View>
            <Text style={s.checkLabel}>4. Исправленный</Text>
          </View>
          <View style={s.checkRow}>
            <View style={s.checkbox}><Text> </Text></View>
            <Text style={s.checkLabel}>5. Дополнительный</Text>
          </View>
        </View>

        {/* ===== B. Реквизиты поставщика ===== */}
        <Text style={s.sectionHeader}>B. Реквизиты поставщика</Text>
        <Field num="6." label="ИИН/БИН" value={seller.iin} />
        <Field num="6.0." label="БИН структурного подразделения" />
        <Field num="6.1." label="БИН реорганизованного лица" />
        <Field num="7." label="Поставщик" value={seller.name} />
        <Field num="8." label="Адрес места нахождения" value={seller.address} />
        <Field num="8.1." label="Код страны" value="KZ - КАЗАХСТАН" />
        <View style={s.fieldRow}>
          <Text style={s.fieldNum}>9.</Text>
          <Text style={s.fieldLabel}>Свидетельство плательщика НДС</Text>
          <Text style={s.fieldValueEmpty}>Данные об НДС отсутствуют</Text>
        </View>

        <Text style={s.subSectionHeader}>B1. Банковские реквизиты поставщика</Text>
        <Field num="12." label="КБе" value={seller.kbe} />
        <Field num="13." label="ИИК" value={seller.iban} />
        <Field num="14." label="БИК" value={seller.bik} />
        <Field num="15." label="Наименование банка" value={seller.bankName} />

        {/* ===== C. Реквизиты получателя ===== */}
        <Text style={s.sectionHeader}>C. Реквизиты получателя</Text>
        <Field num="16." label="ИИН/БИН" value={buyer.iin} />
        <Field num="16.0." label="БИН структурного подразделения" />
        <Field num="16.1." label="БИН реорганизованного лица" />
        <Field num="17." label="Получатель" value={buyer.name} />
        <Field num="18." label="Адрес места нахождения" value={buyer.address} />
        <Field num="18.1." label="Код страны" value="KZ - КАЗАХСТАН" />

        {/* ===== D. Грузоотправитель / грузополучатель ===== */}
        <Text style={s.sectionHeader}>D. Реквизиты грузоотправителя и грузополучателя</Text>
        <Text style={s.subSectionHeader}>ГРУЗООТПРАВИТЕЛЬ</Text>
        <Field num="25.1." label="ИИН/БИН" value={seller.iin} />
        <Field num="25.2." label="Грузоотправитель" value={seller.name} />
        <Field num="25.3." label="Адрес отправки" value={seller.address} />
        <Text style={s.subSectionHeader}>ГРУЗОПОЛУЧАТЕЛЬ</Text>
        <Field num="26.1." label="ИИН/БИН" value={buyer.iin} />
        <Field num="26.2." label="Грузополучатель" value={buyer.name} />
        <Field num="26.3." label="Адрес доставки" value={buyer.address} />
        <Field num="26.4." label="Код страны" value="KZ - КАЗАХСТАН" />
      </Page>

      {/* === Page 2 === */}
      <Page size="A4" style={s.page}>
        <Text style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textAlign: "right", marginBottom: 8 }}>
          Электронный счёт-фактура (продолжение)
        </Text>

        {/* ===== E. Условия поставки ===== */}
        <Text style={s.sectionHeader}>E. Условия поставки</Text>
        <Text style={{ fontSize: 8, fontWeight: 700, marginTop: 4, marginBottom: 2, paddingLeft: 28 }}>
          27. ДОГОВОР (КОНТРАКТ) НА ПОСТАВКУ ТОВАРОВ, РАБОТ, УСЛУГ
        </Text>
        <View style={s.checkRow}>
          <View style={data.hasContract ? s.checkboxChecked : s.checkbox}>
            <Text>{data.hasContract ? "v" : " "}</Text>
          </View>
          <Text style={s.checkLabel}>27.1. Договор (контракт) на поставку товаров, работ, услуг</Text>
        </View>
        <View style={s.checkRow}>
          <View style={!data.hasContract ? s.checkboxChecked : s.checkbox}>
            <Text>{!data.hasContract ? "v" : " "}</Text>
          </View>
          <Text style={s.checkLabel}>27.2. Без договора (контракта) на поставку товаров, работ, услуг</Text>
        </View>
        {data.hasContract && data.contractNumber && (
          <View style={{ paddingLeft: 28, marginTop: 4 }}>
            <Field num="" label="Номер договора" value={data.contractNumber} />
            {data.contractDate && <Field num="" label="Дата договора" value={data.contractDate} />}
          </View>
        )}

        {/* ===== F. Документ-основание ===== */}
        <Text style={s.sectionHeader}>F. Реквизиты документов, подтверждающих поставку товаров, работ, услуг</Text>
        <Field num="33.1." label="Номер документа" value={data.avrNumber ? `АКТ-${seller.iin}-${data.avrNumber}` : undefined} />
        <Field num="33.2." label="Дата документа" value={data.avrDate} />

        {/* ===== G. Данные по товарам ===== */}
        <Text style={s.sectionHeader}>G. Данные по товарам, работам, услугам</Text>
        <View style={{ marginTop: 4, marginBottom: 4 }}>
          <Field num="33.1." label="Код валюты" value="KZT - Тенге (Казахстан)" />
          <View style={{ flexDirection: "row", paddingLeft: 28, marginTop: 4, gap: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 8, marginRight: 4 }}>Направление расчета:</Text>
              <Text style={{ fontSize: 8, fontWeight: 700, backgroundColor: "#dbeafe", padding: "1 6", borderRadius: 2 }}>Прямой расчет</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 8, marginRight: 4 }}>Способ расчета:</Text>
              <Text style={{ fontSize: 8, fontWeight: 700, backgroundColor: "#dbeafe", padding: "1 6", borderRadius: 2 }}>Автоматический</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", paddingLeft: 28, marginTop: 3, alignItems: "center" }}>
            <Text style={{ fontSize: 8 }}>Без НДС — не РК:</Text>
            <View style={s.checkbox}><Text> </Text></View>
          </View>
        </View>

        {/* Table */}
        <View style={s.table}>
          {/* Header */}
          <View style={s.tableHeaderRow}>
            <Text style={[s.th, s.colNum]}>№{"\n"}п/п</Text>
            <Text style={[s.th, s.colOrigin]}>Признак{"\n"}происх.</Text>
            <Text style={[s.th, s.colName]}>Наименование товаров,{"\n"}работ, услуг</Text>
            <Text style={[s.th, s.colUnit]}>Ед.{"\n"}изм.</Text>
            <Text style={[s.th, s.colQty]}>Кол-{"\n"}во</Text>
            <Text style={[s.th, s.colPrice]}>Цена за{"\n"}единицу</Text>
            <Text style={[s.th, s.colSum]}>Стоимость{"\n"}товаров</Text>
            <Text style={[s.th, s.colNdsRate]}>НДС{"\n"}ставка</Text>
            <Text style={[s.th, s.colNdsSum]}>НДС{"\n"}сумма</Text>
            <Text style={[s.thLast, s.colTotal]}>Стоимость с{"\n"}учетом НДС</Text>
          </View>

          {/* Column numbers */}
          <View style={[s.tableRow, { backgroundColor: "#f8fafc" }]}>
            <Text style={[s.td, s.colNum]}>1</Text>
            <Text style={[s.td, s.colOrigin]}>2</Text>
            <Text style={[s.td, s.colName]}>3</Text>
            <Text style={[s.td, s.colUnit]}>4</Text>
            <Text style={[s.td, s.colQty]}>5</Text>
            <Text style={[s.td, s.colPrice]}>6</Text>
            <Text style={[s.td, s.colSum]}>7</Text>
            <Text style={[s.td, s.colNdsRate]}>8</Text>
            <Text style={[s.td, s.colNdsSum]}>9</Text>
            <Text style={[s.tdLast, s.colTotal]}>10</Text>
          </View>

          {/* Data rows */}
          {items.map((item, i) => (
            <View key={i} style={i === items.length - 1 ? s.tableRowLast : s.tableRow}>
              <Text style={[s.td, s.colNum]}>{i + 1}</Text>
              <Text style={[s.td, s.colOrigin]}>6</Text>
              <Text style={[s.tdLeft, s.colName]}>{item.name}</Text>
              <Text style={[s.td, s.colUnit]}>{item.unit}</Text>
              <Text style={[s.td, s.colQty]}>{item.qty}</Text>
              <Text style={[s.tdRight, s.colPrice]}>{formatMoney(item.price)}</Text>
              <Text style={[s.tdRight, s.colSum]}>{formatMoney(item.total)}</Text>
              <Text style={[s.td, s.colNdsRate]}>Без НДС</Text>
              <Text style={[s.tdRight, s.colNdsSum]}>0</Text>
              <Text style={[s.tdLast, s.colTotal]}>{formatMoney(item.total)}</Text>
            </View>
          ))}

          {/* Total row */}
          <View style={s.totalRow}>
            <Text style={[s.td, s.colNum]}></Text>
            <Text style={[s.td, s.colOrigin]}></Text>
            <Text style={[s.tdLeft, s.colName, { fontWeight: 700, fontSize: 8 }]}>ИТОГО</Text>
            <Text style={[s.td, s.colUnit]}></Text>
            <Text style={[s.td, s.colQty]}></Text>
            <Text style={[s.td, s.colPrice]}></Text>
            <Text style={[s.tdRight, s.colSum, { fontWeight: 700, fontSize: 8 }]}>{formatMoney(totalSum)}</Text>
            <Text style={[s.td, s.colNdsRate]}>Без НДС</Text>
            <Text style={[s.tdRight, s.colNdsSum, { fontWeight: 700 }]}>0</Text>
            <Text style={[s.tdLast, s.colTotal, { fontWeight: 700, fontSize: 8 }]}>{formatMoney(totalSum)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text>Документ сформирован в системе <Text style={s.footerBold}>esep</Text> для заполнения на портале esf.gov.kz</Text>
          <Text style={{ marginTop: 2 }}>Все номера полей соответствуют порталу ИС ЭСФ. Перенесите данные в соответствующие поля.</Text>
        </View>
      </Page>
    </Document>
  );
}
