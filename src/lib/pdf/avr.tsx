import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { formatMoney, formatDateFull, amountInWords } from "@/lib/utils";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf", fontWeight: 400 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 700 },
  ],
});

const s = StyleSheet.create({
  page: { fontFamily: "Roboto", fontSize: 8, padding: 20, color: "#000" },

  // Шапка (справа вверху)
  appendixNote: { fontSize: 7, textAlign: "right", lineHeight: 1.4, marginBottom: 6, color: "#333" },

  // Таблица реквизитов сторон
  headerTable: { borderWidth: 1, borderColor: "#000", marginBottom: 0 },
  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000" },
  headerRowLast: { flexDirection: "row" },
  headerLabelCell: { width: 90, padding: "3 4", borderRightWidth: 1, borderColor: "#000", justifyContent: "center" },
  headerValueCell: { flex: 1, padding: "3 4", borderRightWidth: 1, borderColor: "#000" },
  headerHintCell: { width: 220, padding: "2 4", borderRightWidth: 1, borderColor: "#000" },
  headerHint: { fontSize: 7, color: "#777", fontStyle: "italic", textAlign: "center" },
  headerBinCell: { width: 60, padding: "3 4" },
  headerLabel: { fontWeight: 700 },

  // Договор строка
  contractRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000" },
  contractLabelCell: { width: 90, padding: "3 4", borderRightWidth: 1, borderColor: "#000", justifyContent: "center" },
  contractValueCell: { flex: 1, padding: "3 4", borderRightWidth: 1, borderColor: "#000" },
  contractNumCell: { width: 80, padding: "2 4", borderRightWidth: 1, borderColor: "#000" },
  contractDateCell: { width: 70, padding: "2 4" },
  contractSubLabel: { fontSize: 7, color: "#555", textAlign: "center" },

  // Заголовок
  title: { fontSize: 11, fontWeight: 700, textAlign: "center", marginTop: 6, marginBottom: 4 },

  // Основная таблица работ
  workTable: { borderWidth: 1, borderColor: "#000", marginTop: 4 },
  workHeaderRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000" },
  workRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000" },
  workRowLast: { flexDirection: "row" },
  th: { padding: "3 2", borderRightWidth: 1, borderColor: "#000", fontWeight: 700, textAlign: "center", fontSize: 7 },
  thLast: { padding: "3 2", fontWeight: 700, textAlign: "center", fontSize: 7 },
  td: { padding: "4 3", borderRightWidth: 1, borderColor: "#000", fontSize: 8 },
  tdLast: { padding: "4 3", fontSize: 8 },
  tdCenter: { padding: "4 3", borderRightWidth: 1, borderColor: "#000", textAlign: "center", fontSize: 8 },
  tdRight: { padding: "4 3", borderRightWidth: 1, borderColor: "#000", textAlign: "right", fontSize: 8 },
  tdRightLast: { padding: "4 3", textAlign: "right", fontSize: 8 },

  colNum: { width: 24 },
  colName: { flex: 1 },
  colDate: { width: 50 },
  colInfo: { width: 70 },
  colUnit: { width: 40 },
  colQty: { width: 45 },
  colPrice: { width: 65 },
  colSum: { width: 65 },

  // Итого строка
  totalRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#000", borderLeftWidth: 1, borderRightWidth: 1 },
  totalLabelCell: { flex: 1, padding: "3 4", borderRightWidth: 1, borderColor: "#000", textAlign: "right", fontWeight: 700 },
  totalValueCell: { width: 65, padding: "3 4", textAlign: "right" },

  // Нижние строки
  reserveRow: { flexDirection: "row", borderWidth: 1, borderColor: "#000", marginTop: -1 },
  reserveLabelCell: { flex: 1, padding: "3 4", borderRightWidth: 1, borderColor: "#000" },
  reserveValueCell: { flex: 1, padding: "2 4" },
  reserveHint: { fontSize: 7, color: "#777", fontStyle: "italic", textAlign: "center" },

  appendixRow: { borderWidth: 1, borderColor: "#000", padding: "3 4", marginTop: -1 },

  // Подписи
  signSection: { marginTop: 10 },
  signRow: { flexDirection: "row", justifyContent: "space-between" },
  signBlock: { width: "48%" },
  signTitle: { fontWeight: 700, fontSize: 8, marginBottom: 4 },
  signLine: { flexDirection: "row", marginBottom: 3 },
  signLineLabel: { fontSize: 7, color: "#555", width: 70 },
  signLineValue: { flex: 1, borderBottomWidth: 1, borderColor: "#000", marginLeft: 4, marginBottom: 1 },
  stampRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, alignItems: "center" },
  stampBlock: { flexDirection: "row", alignItems: "center", gap: 8 },
  stampLabel: { fontWeight: 700, fontSize: 8 },
  dateBlock: { flex: 1, textAlign: "center" },
  dateLabel: { fontSize: 7, color: "#555" },
  dateLine: { borderBottomWidth: 1, borderColor: "#000", marginTop: 12, marginHorizontal: 20 },
});

interface Party {
  name: string;
  iin?: string;
  bin?: string;
  address: string;
  phone?: string;
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

  const sellerInfo = `${seller.name}${seller.address ? `, ${seller.address}` : ""}${seller.phone ? `, тел: ${seller.phone}` : ""}`;
  const buyerInfo = `${buyer.name}${buyer.address ? `, ${buyer.address}` : ""}`;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page}>

        {/* Приложение — справа вверху */}
        <Text style={s.appendixNote}>
          Приложение 50{"\n"}к приказу Министра финансов{"\n"}Республики Казахстан{"\n"}от 20 декабря 2012 года № 562{"\n"}Форма
        </Text>

        {/* Шапка: Заказчик / Исполнитель */}
        <View style={s.headerTable}>
          <View style={s.headerRow}>
            <View style={s.headerLabelCell}>
              <Text style={s.headerLabel}>Заказчик</Text>
            </View>
            <View style={s.headerValueCell}>
              <Text>{buyerInfo}</Text>
            </View>
            <View style={s.headerHintCell}>
              <Text style={s.headerHint}>полное наименование, адрес, данные о средствах связи</Text>
            </View>
            <View style={s.headerBinCell}>
              <Text style={{ fontSize: 7, color: "#555" }}>ИИН/БИН</Text>
              <Text style={{ fontWeight: 700 }}>{buyer.bin}</Text>
            </View>
          </View>
          <View style={s.headerRow}>
            <View style={s.headerLabelCell}>
              <Text style={s.headerLabel}>Исполнитель</Text>
            </View>
            <View style={s.headerValueCell}>
              <Text>{sellerInfo}</Text>
            </View>
            <View style={[s.headerHintCell, { borderRightWidth: 0 }]}>
              <Text style={s.headerHint}>полное наименование, адрес, данные о средствах связи</Text>
            </View>
            <View style={{ width: 60, padding: "3 4" }}>
              <Text style={{ fontWeight: 700 }}>{seller.iin}</Text>
            </View>
          </View>
          <View style={[s.contractRow, { borderBottomWidth: 0 }]}>
            <View style={s.contractLabelCell}>
              <Text style={s.headerLabel}>Договор (контракт)</Text>
            </View>
            <View style={s.contractValueCell}>
              <Text>{data.contractNumber || ""}</Text>
              {data.contractDate && (
                <Text style={{ fontSize: 7, color: "#555" }}>от {formatDateFull(new Date(data.contractDate))}</Text>
              )}
            </View>
            <View style={s.contractNumCell}>
              <Text style={s.contractSubLabel}>Номер документа</Text>
              <Text style={{ textAlign: "center", fontWeight: 700 }}>{number}</Text>
            </View>
            <View style={s.contractDateCell}>
              <Text style={s.contractSubLabel}>Дата составления</Text>
              <Text style={{ textAlign: "center" }}>{formatDateFull(new Date(date))}</Text>
            </View>
          </View>
        </View>

        {/* Заголовок */}
        <Text style={s.title}>АКТ ВЫПОЛНЕННЫХ РАБОТ (ОКАЗАННЫХ УСЛУГ)</Text>

        {/* Таблица работ */}
        <View style={s.workTable}>
          {/* Заголовок таблицы */}
          <View style={s.workHeaderRow}>
            <Text style={[s.th, s.colNum]}>Номер по порядку</Text>
            <Text style={[s.th, s.colName]}>Наименование работ (услуг) (в разрезе их подвидов в соответствии с технической спецификацией, заданием, графиком выполнения работ (услуг) при их наличии)</Text>
            <Text style={[s.th, s.colDate]}>Дата выполнения работ (оказания услуг)</Text>
            <Text style={[s.th, s.colInfo]}>Сведения об отчете о научных исследованиях, маркетинговых, консультационных и прочих услугах (дата, номер, количество страниц) (при их наличии)</Text>
            <Text style={[s.th, s.colUnit]}>Единица измерения</Text>
            <Text style={[s.th, s.colQty]}>Выполнено работ (оказано услуг){"\n"}количество</Text>
            <Text style={[s.th, s.colPrice]}>цена за единицу</Text>
            <Text style={[s.thLast, s.colSum]}>стоимость</Text>
          </View>

          {/* Номера колонок */}
          <View style={s.workHeaderRow}>
            <Text style={[s.th, s.colNum]}>1</Text>
            <Text style={[s.th, s.colName]}>2</Text>
            <Text style={[s.th, s.colDate]}>3</Text>
            <Text style={[s.th, s.colInfo]}>4</Text>
            <Text style={[s.th, s.colUnit]}>5</Text>
            <Text style={[s.th, s.colQty]}>6</Text>
            <Text style={[s.th, s.colPrice]}>7</Text>
            <Text style={[s.thLast, s.colSum]}>8</Text>
          </View>

          {/* Строка с данными */}
          <View style={s.workRowLast}>
            <Text style={[s.tdCenter, s.colNum]}>1</Text>
            <Text style={[s.td, s.colName]}>{serviceName}</Text>
            <Text style={[s.tdCenter, s.colDate]}>{formatDateFull(new Date(date))}</Text>
            <Text style={[s.tdCenter, s.colInfo]}></Text>
            <Text style={[s.tdCenter, s.colUnit]}>{unit}</Text>
            <Text style={[s.tdCenter, s.colQty]}>{quantity}</Text>
            <Text style={[s.tdRight, s.colPrice]}>{formatMoney(price)}</Text>
            <Text style={[s.tdRightLast, s.colSum]}>{formatMoney(total)}</Text>
          </View>
        </View>

        {/* Итого */}
        <View style={s.totalRow}>
          <View style={s.totalLabelCell}>
            <Text>Итого</Text>
          </View>
          <View style={[{ width: 45, padding: "3 4", borderRightWidth: 1, borderColor: "#000", textAlign: "center" }]}>
            <Text>{quantity}</Text>
          </View>
          <View style={[{ width: 65, padding: "3 4", borderRightWidth: 1, borderColor: "#000", textAlign: "right" }]}>
            <Text>x</Text>
          </View>
          <View style={s.totalValueCell}>
            <Text style={{ textAlign: "right" }}>{formatMoney(total)}</Text>
          </View>
        </View>

        {/* Прописью */}
        <Text style={{ fontSize: 8, marginTop: 3 }}>
          Итого к оплате: <Text style={{ fontWeight: 700 }}>{amountInWords(total)}</Text>
        </Text>

        {/* Сведения об использовании запасов */}
        <View style={s.reserveRow}>
          <View style={s.reserveLabelCell}>
            <Text>Сведения об использовании запасов, полученных от заказчика</Text>
          </View>
          <View style={s.reserveValueCell}>
            <Text style={s.reserveHint}>наименование, количество, стоимость</Text>
          </View>
        </View>

        {/* Приложение */}
        <View style={s.appendixRow}>
          <Text>Приложение: Перечень документации, в том числе отчет(ы) о маркетинговых, научных исследованиях, консультационных и прочих услугах (обязательны при его (их) наличии) на ____________ страниц</Text>
        </View>

        {/* Подписи */}
        <View style={s.signSection}>
          <View style={s.signRow}>
            {/* Сдал */}
            <View style={s.signBlock}>
              <Text style={s.signTitle}>Сдал</Text>
              <View style={s.signLine}>
                <Text style={s.signLineLabel}>должность</Text>
                <View style={s.signLineValue} />
              </View>
              <View style={s.signLine}>
                <Text style={s.signLineLabel}>подпись</Text>
                <View style={s.signLineValue} />
              </View>
              <View style={s.signLine}>
                <Text style={s.signLineLabel}>расшифровка подписи</Text>
                <View style={s.signLineValue}>
                  <Text style={{ fontSize: 8 }}>{seller.directorName || ""}</Text>
                </View>
              </View>
            </View>

            {/* При (принял) */}
            <View style={s.signBlock}>
              <Text style={s.signTitle}>При (принял)</Text>
              <View style={s.signLine}>
                <Text style={s.signLineLabel}>должность</Text>
                <View style={s.signLineValue} />
              </View>
              <View style={s.signLine}>
                <Text style={s.signLineLabel}>подпись</Text>
                <View style={s.signLineValue} />
              </View>
              <View style={s.signLine}>
                <Text style={s.signLineLabel}>расшифровка подписи</Text>
                <View style={s.signLineValue}>
                  <Text style={{ fontSize: 8 }}>{buyer.directorName || ""}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* М.П. и дата */}
          <View style={s.stampRow}>
            <View style={s.stampBlock}>
              <Text style={s.stampLabel}>М.П</Text>
            </View>
            <View style={s.dateBlock}>
              <Text style={s.dateLabel}>Дата подписания (принятия) работ (услуг)</Text>
              <View style={s.dateLine} />
            </View>
            <View style={s.stampBlock}>
              <Text style={s.stampLabel}>М.П.</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
}
