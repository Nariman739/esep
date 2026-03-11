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
  infoLabel: { width: 80, fontWeight: 700 },
  infoValue: { flex: 1 },

  // Таблица услуг
  table: { marginTop: 8, borderWidth: 1, borderColor: "#000" },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000", backgroundColor: "#fff" },
  tableRowLast: { flexDirection: "row" },
  th: { padding: "4 3", borderRightWidth: 1, borderColor: "#000", fontWeight: 700, textAlign: "center" },
  td: { padding: "4 3", borderRightWidth: 1, borderColor: "#000" },
  tdLast: { padding: "4 3" },

  colN: { width: 22 },
  colName: { flex: 1 },
  colQty: { width: 38, textAlign: "center" },
  colUnit: { width: 40, textAlign: "center" },
  colPrice: { width: 68, textAlign: "right" },
  colSum: { width: 80, textAlign: "right" },

  // Итоги
  totalRow: { flexDirection: "row", justifyContent: "flex-end", borderBottomWidth: 1, borderColor: "#000", borderLeftWidth: 1, borderRightWidth: 1 },
  totalLabel: { flex: 1, padding: "3 4", borderRightWidth: 1, borderColor: "#000", textAlign: "right" },
  totalValue: { width: 80, padding: "3 4", textAlign: "right" },

  // Подписи
  signSection: { marginTop: 24 },
  signRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  signBlock: { width: "45%" },
  signLabel: { fontWeight: 700, marginBottom: 4 },
  signLine: { borderBottomWidth: 1, borderColor: "#000", marginTop: 20, marginBottom: 2 },
  signHint: { fontSize: 7, color: "#555", textAlign: "center" },
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
}

interface AvrData {
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

export function AvrPDF({ data }: { data: AvrData }) {
  const { number, date, seller, buyer, serviceName, unit, quantity, price, total } = data;

  const sellerLine = `БИН / ИИН ${seller.iin}, ${seller.name}${seller.address ? `, ${seller.address}` : ""}`;
  const buyerLine = `БИН / ИИН ${buyer.bin}, ${buyer.name}${buyer.address ? `, ${buyer.address}` : ""}`;

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Верхняя таблица реквизитов */}
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
          Акт выполненных работ №{number}{"  "}от {formatDateFull(new Date(date))}
        </Text>

        {/* Исполнитель / Заказчик */}
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Исполнитель:</Text>
          <Text style={s.infoValue}>{sellerLine}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Заказчик:</Text>
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

        {/* Таблица работ */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.th, s.colN]}>№</Text>
            <Text style={[s.th, s.colName]}>Наименование работ (услуг)</Text>
            <Text style={[s.th, s.colQty]}>Кол-во</Text>
            <Text style={[s.th, s.colUnit]}>Ед.</Text>
            <Text style={[s.th, s.colPrice]}>Цена</Text>
            <Text style={[{ ...s.th, borderRightWidth: 0 }, s.colSum]}>Сумма</Text>
          </View>
          <View style={s.tableRowLast}>
            <Text style={[s.td, s.colN, { textAlign: "center" }]}>1</Text>
            <Text style={[s.td, s.colName]}>{serviceName}</Text>
            <Text style={[s.td, s.colQty, { textAlign: "center" }]}>{quantity}</Text>
            <Text style={[s.td, s.colUnit, { textAlign: "center" }]}>{unit}</Text>
            <Text style={[s.td, s.colPrice, { textAlign: "right" }]}>{formatMoney(price)}</Text>
            <Text style={[s.tdLast, s.colSum, { textAlign: "right" }]}>{formatMoney(total)}</Text>
          </View>
        </View>

        {/* Итоги */}
        <View>
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
          Итого к оплате: {amountInWords(total)}
        </Text>

        {/* Заключение */}
        <Text style={{ marginTop: 10, fontSize: 9, lineHeight: 1.4 }}>
          Вышеперечисленные работы (услуги) выполнены полностью и в срок. Заказчик претензий по объему, качеству и срокам оказания услуг не имеет.
        </Text>

        {/* Подписи обеих сторон */}
        <View style={s.signSection}>
          <View style={s.signRow}>
            <View style={s.signBlock}>
              <Text style={s.signLabel}>Исполнитель:</Text>
              <Text style={{ fontSize: 8, marginTop: 2 }}>{seller.name}</Text>
              {seller.directorName && (
                <Text style={{ fontSize: 8 }}>{seller.directorName}</Text>
              )}
              <View style={s.signLine} />
              <Text style={s.signHint}>подпись / М.П.</Text>
            </View>
            <View style={s.signBlock}>
              <Text style={s.signLabel}>Заказчик:</Text>
              <Text style={{ fontSize: 8, marginTop: 2 }}>{buyer.name}</Text>
              {buyer.directorName && (
                <Text style={{ fontSize: 8 }}>{buyer.directorName}</Text>
              )}
              <View style={s.signLine} />
              <Text style={s.signHint}>подпись / М.П.</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
}
