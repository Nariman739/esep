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
  page: { fontFamily: "Roboto", fontSize: 8, padding: 20, color: "#000" },
  pageLand: { fontFamily: "Roboto", fontSize: 7, padding: 16, color: "#000" },
  title: { fontSize: 12, fontWeight: 700, textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 8, textAlign: "center", color: "#555", marginBottom: 10 },

  section: { fontSize: 10, fontWeight: 700, backgroundColor: "#e0e0e0", padding: "4 6", marginTop: 8, marginBottom: 3 },
  subsection: { fontSize: 9, fontWeight: 700, backgroundColor: "#f0f0f0", padding: "3 6", marginTop: 4, marginBottom: 2 },

  // Two-column layout: data + hint
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#ddd", paddingTop: 2, paddingBottom: 2 },
  numCol: { width: 24, fontSize: 7, color: "#888" },
  labelCol: { width: 140, fontSize: 8 },
  valueCol: { width: 180, fontSize: 8, fontWeight: 700, backgroundColor: "#f5f5f5", padding: "1 4" },
  hintCol: { flex: 1, fontSize: 7, color: "#555", paddingLeft: 6 },

  checkRow: { flexDirection: "row", alignItems: "center", paddingTop: 1, paddingBottom: 1, paddingLeft: 24 },
  cb: { width: 8, height: 8, borderWidth: 1, borderColor: "#999", marginRight: 4, textAlign: "center", fontSize: 6 },
  cbOn: { width: 8, height: 8, borderWidth: 1, borderColor: "#333", marginRight: 4, textAlign: "center", fontSize: 6, backgroundColor: "#ccc" },

  // Table G
  tbl: { borderWidth: 0.5, borderColor: "#999", marginTop: 4 },
  tHdr: { flexDirection: "row", backgroundColor: "#e0e0e0", borderBottomWidth: 0.5, borderColor: "#999" },
  tNumRow: { flexDirection: "row", backgroundColor: "#f5f5f5", borderBottomWidth: 0.5, borderColor: "#999" },
  tRow: { flexDirection: "row", borderBottomWidth: 0.5, borderColor: "#ccc" },
  tTotalRow: { flexDirection: "row", borderTopWidth: 1, borderColor: "#333", backgroundColor: "#eee" },
  th: { fontSize: 5, fontWeight: 700, textAlign: "center", padding: "2 1", borderRightWidth: 0.5, borderColor: "#999" },
  thL: { fontSize: 5, fontWeight: 700, textAlign: "center", padding: "2 1" },
  tc: { fontSize: 6, textAlign: "center", padding: "2 1", borderRightWidth: 0.5, borderColor: "#ccc" },
  tl: { fontSize: 6, textAlign: "left", padding: "2 1", borderRightWidth: 0.5, borderColor: "#ccc" },
  tr: { fontSize: 6, textAlign: "right", padding: "2 1", borderRightWidth: 0.5, borderColor: "#ccc" },
  trL: { fontSize: 6, textAlign: "right", padding: "2 1" },

  // G column widths (landscape A4 = ~800pt usable)
  g1: { width: 18 },   // № п/п
  g2: { width: 18 },   // № из СНТ
  g3: { width: 18 },   // Признак
  g4: { width: 110 },  // Наименование
  g5: { width: 60 },   // Наим. по декларации
  g6: { width: 35 },   // Код ГТН
  g7: { width: 28 },   // Ед. изм
  g8: { width: 25 },   // Кол-во
  g9: { width: 42 },   // Цена
  g10: { width: 45 },  // Стоимость
  g11: { width: 25 },  // Акциз ст.
  g12: { width: 25 },  // Акциз сум.
  g13: { width: 45 },  // Размер оборота
  g14: { width: 30 },  // НДС ставка
  g15: { width: 30 },  // НДС сумма
  g16: { width: 48 },  // Стоим. с НДС
  g17: { width: 35 },  // № декларации
  g18: { width: 35 },  // Идентификатор
  g19: { width: 30 },  // Код товара

  footer: { marginTop: 8, fontSize: 6, color: "#777", textAlign: "center", borderTopWidth: 0.5, borderColor: "#ccc", paddingTop: 4 },
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

function F({ n, label, value, hint }: { n: string; label: string; value?: string | null; hint?: string }) {
  return (
    <View style={s.row}>
      <Text style={s.numCol}>{n}</Text>
      <Text style={s.labelCol}>{label}</Text>
      <Text style={value ? s.valueCol : [s.valueCol, { fontWeight: 400, color: "#999" }]}>{value || "-"}</Text>
      {hint ? <Text style={s.hintCol}>{hint}</Text> : null}
    </View>
  );
}

export function EsfPDF({ data }: { data: EsfPdfData }) {
  const { seller, buyer, items, totalSum } = data;

  return (
    <Document>
      {/* Page 1: Sections A-D */}
      <Page size="A4" style={s.page}>
        <Text style={s.title}>ЭСФ - Шпаргалка для портала esf.gov.kz</Text>
        <Text style={s.subtitle}>Откройте портал esf.gov.kz, нажмите "Создать ЭСФ" и заполните поля по этому документу</Text>

        {/* A */}
        <Text style={s.section}>A. Общий раздел</Text>
        <F n="1." label="Рег. номер" hint="Заполнится автоматически порталом" />
        <F n="1.1." label="Номер учетной системы" value={data.number} hint="Введите в поле 1.1" />
        <F n="2." label="Дата выписки" value={formatDate(data.date)} hint="Выберите дату в поле 2" />
        <F n="3." label="Дата совершения оборота" value={formatDate(data.turnoverDate)} hint="Выберите дату в поле 3" />
        <View style={{ paddingLeft: 24, paddingTop: 2 }}>
          <Text style={{ fontSize: 7, color: "#888" }}>Тип ЭСФ: оставьте пустым (обычный)</Text>
        </View>

        {/* B */}
        <Text style={s.section}>B. Реквизиты поставщика</Text>
        <F n="6." label="ИИН/БИН" value={seller.iin} hint="Заполнится авто по вашему ЭЦП" />
        <F n="7." label="Поставщик" value={seller.name} hint="Заполнится авто" />
        <F n="8." label="Адрес" value={seller.address} hint="Проверьте адрес" />
        <F n="8.1." label="Код страны" value="KZ - КАЗАХСТАН" hint="Обычно авто" />
        <F n="9." label="НДС" value="Данные отсутствуют" hint="Пропустите если не плательщик НДС" />

        <Text style={s.subsection}>B1. Банковские реквизиты поставщика</Text>
        <F n="12." label="КБе" value={seller.kbe} hint="Введите в поле 12" />
        <F n="13." label="ИИК" value={seller.iban} hint="Введите в поле 13" />
        <F n="14." label="БИК" value={seller.bik} hint="Введите в поле 14" />
        <F n="15." label="Наименование банка" value={seller.bankName} hint="Введите в поле 15" />

        {/* C */}
        <Text style={s.section}>C. Реквизиты получателя</Text>
        <F n="16." label="ИИН/БИН" value={buyer.iin} hint="Введите БИН - остальное подтянется" />
        <F n="17." label="Получатель" value={buyer.name} hint="Проверьте название" />
        <F n="18." label="Адрес" value={buyer.address} hint="Проверьте адрес" />
        <F n="18.1." label="Код страны" value="KZ - КАЗАХСТАН" hint="Выберите KZ" />

        {/* C1 */}
        <Text style={s.subsection}>C1. Гос. учреждение (если получатель - гос. орган)</Text>
        <View style={{ paddingLeft: 24 }}>
          <Text style={{ fontSize: 7, color: "#888" }}>Обычно пропускается. Заполните если получатель - гос. учреждение</Text>
        </View>

        {/* D */}
        <Text style={s.section}>D. Грузоотправитель и грузополучатель</Text>
        <Text style={s.subsection}>ГРУЗООТПРАВИТЕЛЬ</Text>
        <F n="25.1." label="ИИН/БИН" value={seller.iin} hint="Обычно = поставщик (вы)" />
        <F n="25.2." label="Грузоотправитель" value={seller.name} hint="" />
        <F n="25.3." label="Адрес отправки" value={seller.address} hint="" />
        <Text style={s.subsection}>ГРУЗОПОЛУЧАТЕЛЬ</Text>
        <F n="26.1." label="ИИН/БИН" value={buyer.iin} hint="Обычно = получатель" />
        <F n="26.2." label="Грузополучатель" value={buyer.name} hint="" />
        <F n="26.3." label="Адрес доставки" value={buyer.address} hint="" />
        <F n="26.4." label="Код страны" value="KZ - КАЗАХСТАН" hint="" />
      </Page>

      {/* Page 2: Sections E-F */}
      <Page size="A4" style={s.page}>
        <Text style={{ fontSize: 9, fontWeight: 700, color: "#888", textAlign: "right", marginBottom: 6 }}>ЭСФ-шпаргалка (стр. 2)</Text>

        {/* E */}
        <Text style={s.section}>E. Условия поставки</Text>
        <Text style={{ fontSize: 8, fontWeight: 700, marginTop: 3, marginBottom: 2, paddingLeft: 24 }}>
          27. ДОГОВОР (КОНТРАКТ) НА ПОСТАВКУ ТОВАРОВ, РАБОТ, УСЛУГ
        </Text>
        <View style={s.checkRow}>
          <View style={data.hasContract ? s.cbOn : s.cb}><Text>{data.hasContract ? "v" : " "}</Text></View>
          <Text style={{ fontSize: 8 }}>27.1. Договор на поставку</Text>
          <Text style={s.hintCol}>{data.hasContract ? "Выберите эту галочку" : ""}</Text>
        </View>
        <View style={s.checkRow}>
          <View style={!data.hasContract ? s.cbOn : s.cb}><Text>{!data.hasContract ? "v" : " "}</Text></View>
          <Text style={{ fontSize: 8 }}>27.2. Без договора</Text>
          <Text style={s.hintCol}>{!data.hasContract ? "Выберите эту галочку" : ""}</Text>
        </View>
        {data.hasContract && data.contractNumber && (
          <View style={{ paddingLeft: 24, marginTop: 3 }}>
            <F n="" label="Номер договора" value={data.contractNumber} hint="Введите номер" />
            {data.contractDate && <F n="" label="Дата договора" value={data.contractDate} hint="Выберите дату" />}
          </View>
        )}

        <View style={{ paddingLeft: 24, marginTop: 4 }}>
          <Text style={{ fontSize: 7, color: "#888" }}>30. Поставка по доверенности - обычно пропускается</Text>
          <Text style={{ fontSize: 7, color: "#888" }}>31. Пункт назначения - обычно пропускается</Text>
          <Text style={{ fontSize: 7, color: "#888" }}>31.1. Условия поставки - обычно "Не выбрано"</Text>
        </View>

        {/* F */}
        <Text style={s.section}>F. Документы, подтверждающие поставку товаров, работ, услуг</Text>
        <View style={{ paddingLeft: 24, marginBottom: 3 }}>
          <Text style={{ fontSize: 7, color: "#555" }}>Здесь указывается АВР или накладная. ЭСФ выписывается ТОЛЬКО на основе этого документа!</Text>
        </View>
        <F n="33.1." label="Номер документа" value={data.avrNumber ? `АКТ-${seller.iin}-${data.avrNumber}` : ""} hint="Введите номер АВР" />
        <F n="33.2." label="Дата документа" value={data.avrDate} hint="Дата вашего АВР" />

        {/* G settings */}
        <Text style={s.section}>G. Данные по товарам, работам, услугам (настройки)</Text>
        <F n="" label="Код валюты" value="KZT - Тенге (Казахстан)" hint="Выберите KZT" />
        <View style={{ paddingLeft: 24, marginTop: 3 }}>
          <Text style={{ fontSize: 7, color: "#555" }}>Направление расчета: нажмите "Прямой расчет" (синяя кнопка)</Text>
          <Text style={{ fontSize: 7, color: "#555" }}>Способ расчета: нажмите "Автоматический" (синяя кнопка)</Text>
          <Text style={{ fontSize: 7, color: "#555" }}>Без НДС - не РК: оставьте пустым</Text>
        </View>

        <View style={s.footer}>
          <Text>Таблица товаров/услуг (раздел G) - на следующей странице (альбомная)</Text>
        </View>
      </Page>

      {/* Page 3: Table G - LANDSCAPE with ALL columns */}
      <Page size="A4" orientation="landscape" style={s.pageLand}>
        <Text style={{ fontSize: 9, fontWeight: 700, marginBottom: 4 }}>
          G. Таблица товаров, работ, услуг (заполните на портале идентично)
        </Text>

        <View style={s.tbl}>
          {/* Header row */}
          <View style={s.tHdr}>
            <Text style={[s.th, s.g1]}>№ п/п</Text>
            <Text style={[s.th, s.g2]}>№ из СНТ</Text>
            <Text style={[s.th, s.g3]}>Призн. происх.</Text>
            <Text style={[s.th, s.g4]}>Наименование товаров, работ, услуг</Text>
            <Text style={[s.th, s.g5]}>Наим. по деклар. (код БАСИ)</Text>
            <Text style={[s.th, s.g6]}>Код ГТН</Text>
            <Text style={[s.th, s.g7]}>Ед. изм.</Text>
            <Text style={[s.th, s.g8]}>Кол-во</Text>
            <Text style={[s.th, s.g9]}>Цена за ед.</Text>
            <Text style={[s.th, s.g10]}>Стоимость</Text>
            <Text style={[s.th, s.g11]}>Акциз ст.</Text>
            <Text style={[s.th, s.g12]}>Акциз сум.</Text>
            <Text style={[s.th, s.g13]}>Размер оборота</Text>
            <Text style={[s.th, s.g14]}>НДС ставка</Text>
            <Text style={[s.th, s.g15]}>НДС сумма</Text>
            <Text style={[s.th, s.g16]}>Стоим. с учетом НДС</Text>
            <Text style={[s.th, s.g17]}>№ деклар.</Text>
            <Text style={[s.th, s.g18]}>Идентиф.</Text>
            <Text style={[s.thL, s.g19]}>Код товара</Text>
          </View>

          {/* Column numbers */}
          <View style={s.tNumRow}>
            <Text style={[s.tc, s.g1]}>1</Text>
            <Text style={[s.tc, s.g2]}>2</Text>
            <Text style={[s.tc, s.g3]}>3</Text>
            <Text style={[s.tc, s.g4]}>4</Text>
            <Text style={[s.tc, s.g5]}>5</Text>
            <Text style={[s.tc, s.g6]}>6</Text>
            <Text style={[s.tc, s.g7]}>7</Text>
            <Text style={[s.tc, s.g8]}>8</Text>
            <Text style={[s.tc, s.g9]}>9</Text>
            <Text style={[s.tc, s.g10]}>10</Text>
            <Text style={[s.tc, s.g11]}>11</Text>
            <Text style={[s.tc, s.g12]}>12</Text>
            <Text style={[s.tc, s.g13]}>13</Text>
            <Text style={[s.tc, s.g14]}>14</Text>
            <Text style={[s.tc, s.g15]}>15</Text>
            <Text style={[s.tc, s.g16]}>16</Text>
            <Text style={[s.tc, s.g17]}>17</Text>
            <Text style={[s.tc, s.g18]}>18</Text>
            <Text style={[s.trL, s.g19]}>19</Text>
          </View>

          {/* Data rows */}
          {items.map((item, i) => (
            <View key={i} style={s.tRow}>
              <Text style={[s.tc, s.g1]}>{i + 1}</Text>
              <Text style={[s.tc, s.g2]}></Text>
              <Text style={[s.tc, s.g3]}>6</Text>
              <Text style={[s.tl, s.g4]}>{item.name}</Text>
              <Text style={[s.tc, s.g5]}></Text>
              <Text style={[s.tc, s.g6]}></Text>
              <Text style={[s.tc, s.g7]}>{item.unit}</Text>
              <Text style={[s.tc, s.g8]}>{item.qty}</Text>
              <Text style={[s.tr, s.g9]}>{formatMoney(item.price)}</Text>
              <Text style={[s.tr, s.g10]}>{formatMoney(item.total)}</Text>
              <Text style={[s.tc, s.g11]}></Text>
              <Text style={[s.tc, s.g12]}>0</Text>
              <Text style={[s.tr, s.g13]}>{formatMoney(item.total)}</Text>
              <Text style={[s.tc, s.g14]}>Без НДС</Text>
              <Text style={[s.tr, s.g15]}>0</Text>
              <Text style={[s.tr, s.g16]}>{formatMoney(item.total)}</Text>
              <Text style={[s.tc, s.g17]}></Text>
              <Text style={[s.tc, s.g18]}></Text>
              <Text style={[s.trL, s.g19]}></Text>
            </View>
          ))}

          {/* Totals */}
          <View style={s.tTotalRow}>
            <Text style={[s.tc, s.g1]}></Text>
            <Text style={[s.tc, s.g2]}></Text>
            <Text style={[s.tc, s.g3]}></Text>
            <Text style={[s.tl, s.g4, { fontWeight: 700 }]}>ИТОГО</Text>
            <Text style={[s.tc, s.g5]}></Text>
            <Text style={[s.tc, s.g6]}></Text>
            <Text style={[s.tc, s.g7]}></Text>
            <Text style={[s.tc, s.g8]}></Text>
            <Text style={[s.tc, s.g9]}></Text>
            <Text style={[s.tr, s.g10, { fontWeight: 700 }]}>{formatMoney(totalSum)}</Text>
            <Text style={[s.tc, s.g11]}></Text>
            <Text style={[s.tc, s.g12]}>0</Text>
            <Text style={[s.tr, s.g13, { fontWeight: 700 }]}>{formatMoney(totalSum)}</Text>
            <Text style={[s.tc, s.g14]}>Без НДС</Text>
            <Text style={[s.tr, s.g15, { fontWeight: 700 }]}>0</Text>
            <Text style={[s.tr, s.g16, { fontWeight: 700 }]}>{formatMoney(totalSum)}</Text>
            <Text style={[s.tc, s.g17]}></Text>
            <Text style={[s.tc, s.g18]}></Text>
            <Text style={[s.trL, s.g19]}></Text>
          </View>
        </View>

        {/* Hints for table */}
        <View style={{ marginTop: 6 }}>
          <Text style={{ fontSize: 7, fontWeight: 700, marginBottom: 2 }}>Подсказки по заполнению таблицы:</Text>
          <Text style={{ fontSize: 6, color: "#555" }}>Колонка 3 (Признак): 6 = услуги/работы произведенные в РК. Для товаров укажите соответствующий код.</Text>
          <Text style={{ fontSize: 6, color: "#555" }}>Колонки 5, 6, 17, 18, 19: заполняются только при наличии импортных товаров / декларации.</Text>
          <Text style={{ fontSize: 6, color: "#555" }}>Колонка 13 (Размер оборота): обычно = стоимости товаров (колонка 10).</Text>
          <Text style={{ fontSize: 6, color: "#555" }}>Колонка 14 (НДС): "Без НДС" для ИП на упрощёнке. Если плательщик НДС - укажите ставку 12%.</Text>
          <Text style={{ fontSize: 6, color: "#555" }}>После заполнения нажмите "Исправить" для проверки, затем "Сохранить" для отправки.</Text>
        </View>

        <View style={s.footer}>
          <Text>Сформировано в системе esep. Все номера полей и колонок соответствуют порталу ИС ЭСФ (esf.gov.kz)</Text>
        </View>
      </Page>
    </Document>
  );
}
