import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { amountInWords, formatMoney, formatDate } from "@/lib/utils";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf", fontWeight: 400 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
  ],
});

const s = StyleSheet.create({
  page: { fontFamily: "Roboto", fontSize: 9, padding: 30, color: "#111" },
  title: { fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 9, textAlign: "center", color: "#555", marginBottom: 16 },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 130, color: "#555" },
  value: { flex: 1, fontWeight: 700 },
  table: { marginTop: 16, borderWidth: 1, borderColor: "#ddd" },
  tableHeader: { flexDirection: "row", backgroundColor: "#f5f5f5", borderBottomWidth: 1, borderColor: "#ddd" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#eee" },
  cell: { padding: "5 4", borderRightWidth: 1, borderColor: "#eee" },
  th: { padding: "5 4", borderRightWidth: 1, borderColor: "#ddd", fontWeight: 700 },
  colN: { width: 24 },
  colService: { flex: 1 },
  colUnit: { width: 50 },
  colQty: { width: 40 },
  colPrice: { width: 70 },
  colTotal: { width: 80, borderRightWidth: 0 },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 6 },
  totalLabel: { width: 150, fontWeight: 700 },
  totalValue: { width: 80, fontWeight: 700, textAlign: "right" },
  words: { marginTop: 8, fontSize: 9, color: "#333" },
  section: { marginTop: 20 },
  sectionTitle: { fontWeight: 700, marginBottom: 6, fontSize: 10 },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 12 },
  signRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  signBlock: { width: "45%" },
  signLabel: { color: "#555", marginBottom: 20 },
  signLine: { borderBottomWidth: 1, borderColor: "#999", marginBottom: 3 },
  signName: { color: "#555", fontSize: 8 },
});

interface Party {
  name: string;
  iin?: string;
  bin?: string;
  bankName: string;
  iban: string;
  bik: string;
  kbe: string;
  address: string;
  directorName: string;
  phone?: string;
}

interface InvoiceData {
  number: number;
  date: Date;
  seller: Party & { iin: string };
  buyer: Party & { bin: string };
  serviceName: string;
  unit: string;
  quantity: number;
  price: number;
  total: number;
  contractNumber?: string | null;
  contractDate?: Date | null;
}

export function InvoicePDF({ data }: { data: InvoiceData }) {
  const { number, date, seller, buyer, serviceName, unit, quantity, price, total } = data;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>СЧЕТ НА ОПЛАТУ № {number}</Text>
        <Text style={s.subtitle}>от {formatDate(new Date(date))}</Text>

        {data.contractNumber && (
          <Text style={s.subtitle}>
            к договору № {data.contractNumber}
            {data.contractDate ? ` от ${formatDate(new Date(data.contractDate))}` : ""}
          </Text>
        )}

        <View style={s.divider} />

        {/* Продавец */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>ПОСТАВЩИК (ИСПОЛНИТЕЛЬ)</Text>
          <View style={s.row}><Text style={s.label}>Наименование:</Text><Text style={s.value}>{seller.name}</Text></View>
          <View style={s.row}><Text style={s.label}>ИИН:</Text><Text style={s.value}>{seller.iin}</Text></View>
          {seller.address ? <View style={s.row}><Text style={s.label}>Адрес:</Text><Text style={s.value}>{seller.address}</Text></View> : null}
          <View style={s.row}><Text style={s.label}>Банк:</Text><Text style={s.value}>{seller.bankName}</Text></View>
          <View style={s.row}><Text style={s.label}>ИИК:</Text><Text style={s.value}>{seller.iban}</Text></View>
          <View style={s.row}><Text style={s.label}>БИК:</Text><Text style={s.value}>{seller.bik}</Text></View>
          <View style={s.row}><Text style={s.label}>КБе:</Text><Text style={s.value}>{seller.kbe}</Text></View>
          {seller.phone ? <View style={s.row}><Text style={s.label}>Телефон:</Text><Text style={s.value}>{seller.phone}</Text></View> : null}
        </View>

        <View style={s.divider} />

        {/* Покупатель */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>ПОКУПАТЕЛЬ (ЗАКАЗЧИК)</Text>
          <View style={s.row}><Text style={s.label}>Наименование:</Text><Text style={s.value}>{buyer.name}</Text></View>
          <View style={s.row}><Text style={s.label}>БИН:</Text><Text style={s.value}>{buyer.bin}</Text></View>
          {buyer.address ? <View style={s.row}><Text style={s.label}>Адрес:</Text><Text style={s.value}>{buyer.address}</Text></View> : null}
          {buyer.bankName ? <View style={s.row}><Text style={s.label}>Банк:</Text><Text style={s.value}>{buyer.bankName}</Text></View> : null}
          {buyer.iban ? <View style={s.row}><Text style={s.label}>ИИК:</Text><Text style={s.value}>{buyer.iban}</Text></View> : null}
          {buyer.bik ? <View style={s.row}><Text style={s.label}>БИК:</Text><Text style={s.value}>{buyer.bik}</Text></View> : null}
          {buyer.kbe ? <View style={s.row}><Text style={s.label}>КБе:</Text><Text style={s.value}>{buyer.kbe}</Text></View> : null}
          {buyer.directorName ? <View style={s.row}><Text style={s.label}>Руководитель:</Text><Text style={s.value}>{buyer.directorName}</Text></View> : null}
        </View>

        <View style={s.divider} />

        {/* Таблица */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.th, s.colN]}>№</Text>
            <Text style={[s.th, s.colService]}>Наименование</Text>
            <Text style={[s.th, s.colUnit]}>Ед.</Text>
            <Text style={[s.th, s.colQty]}>Кол.</Text>
            <Text style={[s.th, s.colPrice]}>Цена</Text>
            <Text style={[s.th, s.colTotal]}>Сумма</Text>
          </View>
          <View style={s.tableRow}>
            <Text style={[s.cell, s.colN]}>1</Text>
            <Text style={[s.cell, s.colService]}>{serviceName}</Text>
            <Text style={[s.cell, s.colUnit]}>{unit}</Text>
            <Text style={[s.cell, s.colQty]}>{quantity}</Text>
            <Text style={[s.cell, s.colPrice]}>{formatMoney(price)}</Text>
            <Text style={[s.cell, s.colTotal, { borderRightWidth: 0 }]}>{formatMoney(total)}</Text>
          </View>
        </View>

        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Итого без НДС:</Text>
          <Text style={s.totalValue}>{formatMoney(total)} тг</Text>
        </View>
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>НДС:</Text>
          <Text style={s.totalValue}>Без НДС</Text>
        </View>
        <View style={s.totalRow}>
          <Text style={[s.totalLabel, { fontSize: 10 }]}>ИТОГО К ОПЛАТЕ:</Text>
          <Text style={[s.totalValue, { fontSize: 10 }]}>{formatMoney(total)} тг</Text>
        </View>

        <Text style={s.words}>Сумма прописью: {amountInWords(total)}</Text>

        <View style={s.signRow}>
          <View style={s.signBlock}>
            <Text style={s.signLabel}>Исполнитель:</Text>
            <View style={s.signLine} />
            <Text style={s.signName}>{seller.directorName || seller.name}</Text>
          </View>
          <View style={s.signBlock}>
            <Text style={[s.signLabel, { textAlign: "right" }]}>М.П.</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
