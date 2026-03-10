import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { amountInWords, formatMoney, formatDateFull } from "@/lib/utils";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf", fontWeight: 400 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
  ],
});

const s = StyleSheet.create({
  page: { fontFamily: "Roboto", fontSize: 9, padding: 28, color: "#000" },

  // Верхняя таблица реквизитов
  bankTable: { borderWidth: 1, borderColor: "#000", marginBottom: 8 },
  bankRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000" },
  bankRowLast: { flexDirection: "row" },
  bankCell: { padding: "3 4", borderRightWidth: 1, borderColor: "#000" },
  bankCellLast: { padding: "3 4" },
  bankLabel: { fontSize: 8, color: "#555" },
  bankValue: { fontWeight: 700, fontSize: 9 },

  // Заголовок
  title: { fontSize: 12, fontWeight: 700, marginBottom: 6, marginTop: 6 },

  // Инфо строки
  infoRow: { flexDirection: "row", marginBottom: 3 },
  infoLabel: { width: 70, fontWeight: 700 },
  infoValue: { flex: 1 },

  // Таблица услуг
  table: { marginTop: 8, borderWidth: 1, borderColor: "#000" },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000", backgroundColor: "#fff" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000" },
  tableRowLast: { flexDirection: "row" },
  th: { padding: "4 3", borderRightWidth: 1, borderColor: "#000", fontWeight: 700, textAlign: "center" },
  td: { padding: "4 3", borderRightWidth: 1, borderColor: "#000" },
  tdLast: { padding: "4 3" },

  colN: { width: 22 },
  colCode: { width: 45 },
  colName: { flex: 1 },
  colQty: { width: 38, textAlign: "center" },
  colUnit: { width: 40, textAlign: "center" },
  colPrice: { width: 68, textAlign: "right" },
  colSum: { width: 80, textAlign: "right" },

  // Итоги
  totalSection: { marginTop: 0 },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", borderBottomWidth: 1, borderColor: "#000", borderLeftWidth: 1, borderRightWidth: 1 },
  totalLabel: { flex: 1, padding: "3 4", borderRightWidth: 1, borderColor: "#000", textAlign: "right" },
  totalValue: { width: 80, padding: "3 4", textAlign: "right" },
  totalLabelBold: { flex: 1, padding: "3 4", borderRightWidth: 1, borderColor: "#000", textAlign: "right", fontWeight: 700 },
  totalValueBold: { width: 80, padding: "3 4", textAlign: "right", fontWeight: 700 },

  // Подписи
  signRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  signBlock: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  signLabel: { fontWeight: 700 },
  signLine: { flex: 1, borderBottomWidth: 1, borderColor: "#000", width: 200, marginHorizontal: 8 },
  stamp: { fontWeight: 700 },
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

  const sellerLine = `БИН / ИИН ${seller.iin}, ${seller.name}${seller.address ? `, ${seller.address}` : ""}`;
  const buyerLine = `БИН / ИИН ${buyer.bin}, ${buyer.name}${buyer.address ? `, ${buyer.address}` : ""}`;

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Верхняя таблица реквизитов бенефициара */}
        <View style={s.bankTable}>
          <View style={s.bankRow}>
            <View style={[s.bankCell, { flex: 2 }]}>
              <Text style={s.bankLabel}>Бенефициар:</Text>
              <Text style={s.bankValue}>{seller.name}</Text>
              <Text>БИН: {seller.iin}</Text>
            </View>
            <View style={[s.bankCell, { flex: 1 }]}>
              <Text style={s.bankLabel}>ИИК</Text>
              <Text style={s.bankValue}>{seller.iban}</Text>
            </View>
            <View style={[s.bankCellLast, { width: 60 }]}>
              <Text style={s.bankLabel}>КБе</Text>
              <Text style={s.bankValue}>{seller.kbe}</Text>
            </View>
          </View>
          <View style={s.bankRowLast}>
            <View style={[s.bankCell, { flex: 2 }]}>
              <Text style={s.bankLabel}>Банк бенефициара:</Text>
              <Text style={s.bankValue}>{seller.bankName}</Text>
            </View>
            <View style={[s.bankCell, { flex: 1 }]}>
              <Text style={s.bankLabel}>БИК</Text>
              <Text style={s.bankValue}>{seller.bik}</Text>
            </View>
            <View style={[s.bankCellLast, { width: 60 }]}>
              <Text style={s.bankLabel}>Код назначения платежа</Text>
              <Text style={s.bankValue}>859</Text>
            </View>
          </View>
        </View>

        {/* Заголовок */}
        <Text style={s.title}>
          Счет на оплату №{number}{"  "}от {formatDateFull(new Date(date))}
        </Text>

        {/* Поставщик / Покупатель */}
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Поставщик:</Text>
          <Text style={s.infoValue}>{sellerLine}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Покупатель:</Text>
          <Text style={s.infoValue}>{buyerLine}</Text>
        </View>
        {data.contractNumber && (
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Договор:</Text>
            <Text style={s.infoValue}>
              {data.contractNumber}
              {data.contractDate ? ` от ${formatDateFull(new Date(data.contractDate))}` : ""}
            </Text>
          </View>
        )}

        {/* Таблица услуг */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.th, s.colN]}>№</Text>
            <Text style={[s.th, s.colCode]}>Код</Text>
            <Text style={[s.th, s.colName]}>Наименование</Text>
            <Text style={[s.th, s.colQty]}>Кол-во</Text>
            <Text style={[s.th, s.colUnit]}>Ед.</Text>
            <Text style={[s.th, s.colPrice]}>Цена</Text>
            <Text style={[{ ...s.th, borderRightWidth: 0 }, s.colSum]}>Сумма</Text>
          </View>
          <View style={s.tableRowLast}>
            <Text style={[s.td, s.colN, { textAlign: "center" }]}>1</Text>
            <Text style={[s.td, s.colCode]}></Text>
            <Text style={[s.td, s.colName]}>{serviceName}</Text>
            <Text style={[s.td, s.colQty, { textAlign: "center" }]}>{quantity}</Text>
            <Text style={[s.td, s.colUnit, { textAlign: "center" }]}>{unit}</Text>
            <Text style={[s.td, s.colPrice, { textAlign: "right" }]}>{formatMoney(price)}</Text>
            <Text style={[s.tdLast, s.colSum, { textAlign: "right" }]}>{formatMoney(total)}</Text>
          </View>
        </View>

        {/* Итоги */}
        <View style={s.totalSection}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Итого:</Text>
            <Text style={s.totalValue}>{formatMoney(total)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>В том числе НДС:</Text>
            <Text style={s.totalValue}>0</Text>
          </View>
        </View>

        {/* Прописью */}
        <Text style={{ marginTop: 6, fontSize: 9 }}>
          Всего наименований 1, на сумму {formatMoney(total)} KZT
        </Text>
        <Text style={{ fontWeight: 700, fontSize: 9, marginTop: 2 }}>
          Всего к оплате: {amountInWords(total)}
        </Text>

        {/* Подписи */}
        <View style={s.signRow}>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <Text style={s.signLabel}>Исполнитель</Text>
            <View style={{ width: 200, borderBottomWidth: 1, borderColor: "#000", marginHorizontal: 8, marginBottom: 2 }} />
          </View>
          <Text style={s.stamp}>М.П.</Text>
        </View>

      </Page>
    </Document>
  );
}
