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
  page: { fontFamily: "Roboto", fontSize: 8, padding: 24, color: "#000" },
  mainTitle: { fontSize: 12, fontWeight: 700, textAlign: "center", marginBottom: 10 },

  sectionHeader: {
    fontSize: 10, fontWeight: 700, backgroundColor: "#eee", padding: "4 8",
    marginTop: 8, marginBottom: 4, borderLeftWidth: 2, borderLeftColor: "#333",
  },
  subSectionHeader: {
    fontSize: 9, fontWeight: 700, backgroundColor: "#f5f5f5", padding: "3 8",
    marginTop: 4, marginBottom: 2,
  },

  fieldRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#ccc", paddingTop: 2, paddingBottom: 2 },
  fieldNum: { width: 28, fontSize: 7, color: "#666" },
  fieldLabel: { width: 160, fontSize: 8, color: "#333" },
  fieldValue: { flex: 1, fontSize: 8, fontWeight: 700, paddingLeft: 4, backgroundColor: "#f9f9f9", padding: "2 4" },
  fieldValueEmpty: { flex: 1, fontSize: 7, color: "#999", paddingLeft: 4, backgroundColor: "#f9f9f9", padding: "2 4" },

  checkRow: { flexDirection: "row", alignItems: "center", paddingTop: 1, paddingBottom: 1, paddingLeft: 28 },
  checkbox: { width: 10, height: 10, borderWidth: 1, borderColor: "#999", marginRight: 6, textAlign: "center", fontSize: 7 },
  checkboxChecked: { width: 10, height: 10, borderWidth: 1, borderColor: "#333", marginRight: 6, textAlign: "center", fontSize: 7, backgroundColor: "#ddd" },
  checkLabel: { fontSize: 8 },

  table: { marginTop: 4, borderWidth: 0.5, borderColor: "#999" },
  tHeaderRow: { flexDirection: "row", backgroundColor: "#eee", borderBottomWidth: 0.5, borderColor: "#999" },
  tRow: { flexDirection: "row", borderBottomWidth: 0.5, borderColor: "#ccc" },
  tRowLast: { flexDirection: "row" },
  th: { fontSize: 6, fontWeight: 700, textAlign: "center", padding: "3 2", borderRightWidth: 0.5, borderColor: "#999" },
  thLast: { fontSize: 6, fontWeight: 700, textAlign: "center", padding: "3 2" },
  td: { fontSize: 7, textAlign: "center", padding: "3 2", borderRightWidth: 0.5, borderColor: "#ccc" },
  tdL: { fontSize: 7, textAlign: "left", padding: "3 2", borderRightWidth: 0.5, borderColor: "#ccc" },
  tdR: { fontSize: 7, textAlign: "right", padding: "3 2", borderRightWidth: 0.5, borderColor: "#ccc" },
  tdRLast: { fontSize: 7, textAlign: "right", padding: "3 2" },
  totalRow: { flexDirection: "row", borderTopWidth: 1, borderColor: "#333", backgroundColor: "#f5f5f5" },

  cNum: { width: 20 },
  cOrig: { width: 20 },
  cName: { width: 120 },
  cUnit: { width: 35 },
  cQty: { width: 35 },
  cPrice: { width: 50 },
  cSum: { width: 50 },
  cNdsR: { width: 40 },
  cNdsS: { width: 45 },
  cTotal: { width: 55 },

  footer: { marginTop: 10, fontSize: 7, color: "#666", textAlign: "center", borderTopWidth: 0.5, borderColor: "#ccc", paddingTop: 4 },
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
      <Text style={value ? s.fieldValue : s.fieldValueEmpty}>{value || "-"}</Text>
    </View>
  );
}

export function EsfPDF({ data }: { data: EsfPdfData }) {
  const { seller, buyer, items, totalSum } = data;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.mainTitle}>Электронный счет-фактура (ЭСФ)</Text>

        {/* A */}
        <Text style={s.sectionHeader}>A. Общий раздел</Text>
        <Field num="1." label="Рег. номер" value="(присвоится автоматически)" />
        <Field num="1.1." label="Номер учетной системы" value={data.number} />
        <Field num="2." label="Дата выписки" value={formatDate(data.date)} />
        <Field num="3." label="Дата совершения оборота" value={formatDate(data.turnoverDate)} />
        <View style={{ paddingLeft: 28, paddingTop: 2 }}>
          <Text style={{ fontSize: 7, color: "#666", marginBottom: 2 }}>Тип ЭСФ:</Text>
          <View style={s.checkRow}>
            <View style={s.checkbox}><Text> </Text></View>
            <Text style={s.checkLabel}>4. Исправленный</Text>
          </View>
          <View style={s.checkRow}>
            <View style={s.checkbox}><Text> </Text></View>
            <Text style={s.checkLabel}>5. Дополнительный</Text>
          </View>
        </View>

        {/* B */}
        <Text style={s.sectionHeader}>B. Реквизиты поставщика</Text>
        <Field num="6." label="ИИН/БИН" value={seller.iin} />
        <Field num="6.0." label="БИН структурного подразделения" />
        <Field num="6.1." label="БИН реорганизованного лица" />
        <Field num="7." label="Поставщик" value={seller.name} />
        <Field num="8." label="Адрес места нахождения" value={seller.address} />
        <Field num="8.1." label="Код страны" value="KZ - КАЗАХСТАН" />
        <Field num="9." label="Свидетельство плательщика НДС" value="Данные об НДС отсутствуют" />

        <Text style={s.subSectionHeader}>B1. Банковские реквизиты поставщика</Text>
        <Field num="12." label="КБе" value={seller.kbe} />
        <Field num="13." label="ИИК" value={seller.iban} />
        <Field num="14." label="БИК" value={seller.bik} />
        <Field num="15." label="Наименование банка" value={seller.bankName} />

        {/* C */}
        <Text style={s.sectionHeader}>C. Реквизиты получателя</Text>
        <Field num="16." label="ИИН/БИН" value={buyer.iin} />
        <Field num="16.0." label="БИН структурного подразделения" />
        <Field num="16.1." label="БИН реорганизованного лица" />
        <Field num="17." label="Получатель" value={buyer.name} />
        <Field num="18." label="Адрес места нахождения" value={buyer.address} />
        <Field num="18.1." label="Код страны" value="KZ - КАЗАХСТАН" />

        {/* D */}
        <Text style={s.sectionHeader}>D. Грузоотправитель и грузополучатель</Text>
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

      <Page size="A4" style={s.page}>
        <Text style={{ fontSize: 9, fontWeight: 700, color: "#666", textAlign: "right", marginBottom: 6 }}>
          ЭСФ (продолжение)
        </Text>

        {/* E */}
        <Text style={s.sectionHeader}>E. Условия поставки</Text>
        <Text style={{ fontSize: 8, fontWeight: 700, marginTop: 4, marginBottom: 2, paddingLeft: 28 }}>
          27. ДОГОВОР (КОНТРАКТ) НА ПОСТАВКУ ТОВАРОВ, РАБОТ, УСЛУГ
        </Text>
        <View style={s.checkRow}>
          <View style={data.hasContract ? s.checkboxChecked : s.checkbox}>
            <Text>{data.hasContract ? "v" : " "}</Text>
          </View>
          <Text style={s.checkLabel}>27.1. Договор на поставку товаров, работ, услуг</Text>
        </View>
        <View style={s.checkRow}>
          <View style={!data.hasContract ? s.checkboxChecked : s.checkbox}>
            <Text>{!data.hasContract ? "v" : " "}</Text>
          </View>
          <Text style={s.checkLabel}>27.2. Без договора на поставку товаров, работ, услуг</Text>
        </View>
        {data.hasContract && data.contractNumber && (
          <View style={{ paddingLeft: 28, marginTop: 4 }}>
            <Field num="" label="Номер договора" value={data.contractNumber} />
            {data.contractDate && <Field num="" label="Дата договора" value={data.contractDate} />}
          </View>
        )}

        {/* F */}
        <Text style={s.sectionHeader}>F. Документы, подтверждающие поставку</Text>
        <Field num="33.1." label="Номер документа" value={data.avrNumber ? `АКТ-${seller.iin}-${data.avrNumber}` : undefined} />
        <Field num="33.2." label="Дата документа" value={data.avrDate} />

        {/* G */}
        <Text style={s.sectionHeader}>G. Данные по товарам, работам, услугам</Text>
        <View style={{ marginTop: 4, marginBottom: 4 }}>
          <Field num="" label="Код валюты" value="KZT - Тенге (Казахстан)" />
          <View style={{ flexDirection: "row", paddingLeft: 28, marginTop: 4 }}>
            <Text style={{ fontSize: 8, marginRight: 8 }}>Направление: Прямой расчет</Text>
            <Text style={{ fontSize: 8 }}>Способ: Автоматический</Text>
          </View>
        </View>

        <View style={s.table}>
          <View style={s.tHeaderRow}>
            <Text style={[s.th, s.cNum]}>№</Text>
            <Text style={[s.th, s.cOrig]}>Призн.</Text>
            <Text style={[s.th, s.cName]}>Наименование товаров, работ, услуг</Text>
            <Text style={[s.th, s.cUnit]}>Ед.изм.</Text>
            <Text style={[s.th, s.cQty]}>Кол-во</Text>
            <Text style={[s.th, s.cPrice]}>Цена</Text>
            <Text style={[s.th, s.cSum]}>Стоимость</Text>
            <Text style={[s.th, s.cNdsR]}>НДС ст.</Text>
            <Text style={[s.th, s.cNdsS]}>НДС сум.</Text>
            <Text style={[s.thLast, s.cTotal]}>С учетом НДС</Text>
          </View>

          {items.map((item, i) => (
            <View key={i} style={i === items.length - 1 ? s.tRowLast : s.tRow}>
              <Text style={[s.td, s.cNum]}>{i + 1}</Text>
              <Text style={[s.td, s.cOrig]}>6</Text>
              <Text style={[s.tdL, s.cName]}>{item.name}</Text>
              <Text style={[s.td, s.cUnit]}>{item.unit}</Text>
              <Text style={[s.td, s.cQty]}>{item.qty}</Text>
              <Text style={[s.tdR, s.cPrice]}>{formatMoney(item.price)}</Text>
              <Text style={[s.tdR, s.cSum]}>{formatMoney(item.total)}</Text>
              <Text style={[s.td, s.cNdsR]}>Без НДС</Text>
              <Text style={[s.tdR, s.cNdsS]}>0</Text>
              <Text style={[s.tdRLast, s.cTotal]}>{formatMoney(item.total)}</Text>
            </View>
          ))}

          <View style={s.totalRow}>
            <Text style={[s.td, s.cNum]}></Text>
            <Text style={[s.td, s.cOrig]}></Text>
            <Text style={[s.tdL, s.cName, { fontWeight: 700 }]}>ИТОГО</Text>
            <Text style={[s.td, s.cUnit]}></Text>
            <Text style={[s.td, s.cQty]}></Text>
            <Text style={[s.td, s.cPrice]}></Text>
            <Text style={[s.tdR, s.cSum, { fontWeight: 700 }]}>{formatMoney(totalSum)}</Text>
            <Text style={[s.td, s.cNdsR]}>Без НДС</Text>
            <Text style={[s.tdR, s.cNdsS, { fontWeight: 700 }]}>0</Text>
            <Text style={[s.tdRLast, s.cTotal, { fontWeight: 700 }]}>{formatMoney(totalSum)}</Text>
          </View>
        </View>

        <View style={s.footer}>
          <Text>Сформировано в системе esep для заполнения на портале esf.gov.kz</Text>
          <Text>Номера полей соответствуют порталу ИС ЭСФ</Text>
        </View>
      </Page>
    </Document>
  );
}
