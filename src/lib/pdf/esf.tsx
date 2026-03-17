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
  title: { fontSize: 12, fontWeight: 700, textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 7, textAlign: "center", color: "#555", marginBottom: 8 },

  section: { fontSize: 10, fontWeight: 700, backgroundColor: "#e0e0e0", padding: "4 6", marginTop: 7, marginBottom: 2 },
  subsection: { fontSize: 9, fontWeight: 700, backgroundColor: "#f0f0f0", padding: "2 6", marginTop: 3, marginBottom: 1 },

  row: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#ddd", paddingTop: 1, paddingBottom: 1 },
  numCol: { width: 24, fontSize: 6, color: "#888" },
  labelCol: { width: 150, fontSize: 7 },
  valueCol: { width: 170, fontSize: 7, fontWeight: 700, backgroundColor: "#f5f5f5", padding: "1 3" },
  hintCol: { flex: 1, fontSize: 6, color: "#555", paddingLeft: 4 },

  checkRow: { flexDirection: "row", alignItems: "center", paddingTop: 1, paddingBottom: 1, paddingLeft: 24 },
  cb: { width: 8, height: 8, borderWidth: 1, borderColor: "#999", marginRight: 4, textAlign: "center", fontSize: 6 },
  cbOn: { width: 8, height: 8, borderWidth: 1, borderColor: "#333", marginRight: 4, textAlign: "center", fontSize: 6, backgroundColor: "#ccc" },

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

  // G columns (landscape ~800pt)
  g1: { width: 16 },  // № п/п
  g2: { width: 16 },  // № из СНТ
  g3: { width: 16 },  // Признак
  g4: { width: 95 },  // Наименование
  g5: { width: 50 },  // Наим по деклар
  g6: { width: 30 },  // Код ГТН
  g7: { width: 26 },  // КД ИЗМ (ед.изм)
  g8: { width: 22 },  // КОР-ВО
  g9: { width: 30 },  // Кол. единица
  g10: { width: 28 }, // Кол-во товаров
  g11: { width: 38 }, // Цена за ед.
  g12: { width: 40 }, // Стоимость
  g13: { width: 22 }, // Акциз ст.
  g14: { width: 22 }, // Акциз сум.
  g15: { width: 40 }, // Размер оборота
  g16: { width: 28 }, // НДС ставка
  g17: { width: 28 }, // НДС сумма
  g18: { width: 42 }, // Стоим. с НДС
  g19: { width: 30 }, // № деклар.
  g20: { width: 28 }, // Ном. товарной позиции
  g21: { width: 30 }, // Идентиф.
  g22: { width: 25 }, // Код товара

  footer: { marginTop: 6, fontSize: 6, color: "#777", textAlign: "center", borderTopWidth: 0.5, borderColor: "#ccc", paddingTop: 3 },
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
      {/* ============ Page 1: A + B + B1 + C ============ */}
      <Page size="A4" style={s.page}>
        <Text style={s.title}>ЭСФ - Шпаргалка для портала esf.gov.kz</Text>
        <Text style={s.subtitle}>Откройте esf.gov.kz, нажмите "Создать ЭСФ" и заполняйте поля по этому документу. Номера полей совпадают с порталом.</Text>

        {/* ===== A. Общий раздел ===== */}
        <Text style={s.section}>A. Общий раздел</Text>
        <F n="1." label="Рег. номер" hint="Присвоится автоматически порталом" />
        <F n="1.1." label="Номер учетной системы" value={data.number} hint="Введите в поле 1.1" />
        <F n="2." label="Дата выписки" value={formatDate(data.date)} hint="Выберите дату" />
        <F n="3." label="Дата совершения оборота" value={formatDate(data.turnoverDate)} hint="Выберите дату" />
        <View style={{ paddingLeft: 24, paddingTop: 1 }}>
          <Text style={{ fontSize: 6, color: "#888" }}>Тип ЭСФ: оставьте пустым (обычный ЭСФ, не исправленный и не дополнительный)</Text>
        </View>

        {/* ===== B. Реквизиты поставщика ===== */}
        <Text style={s.section}>B. Реквизиты поставщика</Text>
        <F n="6." label="ИИН/БИН" value={seller.iin} hint="Заполнится авто по вашему ЭЦП" />
        <F n="6.0." label="БИН структурного подразделения" hint="Пропустите (для филиалов юр. лиц)" />
        <F n="6.1." label="БИН реорганизованного лица" hint="Пропустите" />
        <F n="6.2." label="Код ОГД" hint="Заполнится авто или введите код налоговой" />
        <F n="7." label="Поставщик" value={seller.name} hint="Заполнится авто" />
        <F n="8." label="Адрес места нахождения" value={seller.address} hint="Проверьте адрес" />
        <F n="8.1." label="Код страны" value="KZ - КАЗАХСТАН" hint="Обычно авто" />
        <F n="9." label="Свидетельство плательщика НДС" value="Данные отсутствуют" hint="Пропустите если не плательщик НДС" />
        <F n="10." label="Категория поставщика" hint="Оставьте пустым" />
        <F n="11." label="Дополнительные сведения" hint="Оставьте пустым" />

        <Text style={s.subsection}>B1. БАНКОВСКИЕ РЕКВИЗИТЫ ПОСТАВЩИКА</Text>
        <F n="12." label="КБе" value={seller.kbe} hint="Введите КБе" />
        <F n="13." label="ИИК" value={seller.iban} hint="Введите ИИК (IBAN)" />
        <F n="14." label="БИК" value={seller.bik} hint="Введите БИК" />
        <F n="15." label="Наименование банка" value={seller.bankName} hint="Введите банк" />

        {/* ===== C. Реквизиты получателя ===== */}
        <Text style={s.section}>C. Реквизиты получателя</Text>
        <F n="16." label="ИИН/БИН" value={buyer.iin} hint="Введите БИН - остальное подтянется" />
        <F n="16.0." label="БИН структурного подразделения" hint="Пропустите" />
        <F n="16.1." label="БИН реорганизованного лица" hint="Пропустите" />
        <F n="17." label="Получатель" value={buyer.name} hint="Проверьте название" />
        <F n="18." label="Адрес места нахождения" value={buyer.address} hint="Проверьте адрес" />
        <F n="18.1." label="Код страны" value="KZ - КАЗАХСТАН" hint="Выберите KZ" />
        <F n="19." label="Дополнительные сведения" hint="Оставьте пустым" />
        <F n="20." label="Категория получателя" hint="Оставьте пустым" />
      </Page>

      {/* ============ Page 2: C1 + D + E + F + G settings ============ */}
      <Page size="A4" style={s.page}>
        <Text style={{ fontSize: 8, fontWeight: 700, color: "#888", textAlign: "right", marginBottom: 4 }}>ЭСФ-шпаргалка (стр. 2)</Text>

        {/* ===== C1. Гос. учреждение ===== */}
        <Text style={s.section}>C1. Реквизиты государственного учреждения</Text>
        <View style={{ paddingLeft: 24, marginBottom: 2 }}>
          <Text style={{ fontSize: 6, color: "#888" }}>Заполняется ТОЛЬКО если получатель - государственное учреждение. Иначе пропустите весь раздел.</Text>
        </View>
        <F n="21." label="ИИК" hint="Только для гос. учреждений" />
        <F n="22." label="Код товаров, работ, услуг" hint="Только для гос. учреждений" />
        <F n="23." label="Назначение платежа" hint="Только для гос. учреждений" />
        <F n="24." label="БИК" hint="Только для гос. учреждений" />

        {/* ===== D. Грузоотправитель / грузополучатель ===== */}
        <Text style={s.section}>D. Реквизиты грузоотправителя и грузополучателя</Text>
        <Text style={s.subsection}>ГРУЗООТПРАВИТЕЛЬ</Text>
        <F n="25.1." label="ИИН/БИН" value={seller.iin} hint="= ваш ИИН/БИН (поставщик)" />
        <F n="25.2." label="Грузоотправитель" value={seller.name} hint="= ваше наименование" />
        <F n="25.3." label="Адрес отправки" value={seller.address} hint="= ваш адрес" />
        <Text style={s.subsection}>ГРУЗОПОЛУЧАТЕЛЬ</Text>
        <F n="26.1." label="ИИН/БИН" value={buyer.iin} hint="= БИН получателя" />
        <F n="26.2." label="Грузополучатель" value={buyer.name} hint="= название получателя" />
        <F n="26.3." label="Адрес доставки" value={buyer.address} hint="= адрес получателя" />
        <F n="26.4." label="Код страны" value="KZ - КАЗАХСТАН" hint="Выберите KZ" />

        {/* ===== E. Условия поставки ===== */}
        <Text style={s.section}>E. Условия поставки</Text>
        <Text style={{ fontSize: 7, fontWeight: 700, marginTop: 2, marginBottom: 1, paddingLeft: 24 }}>
          27. ДОГОВОР (КОНТРАКТ) НА ПОСТАВКУ ТОВАРОВ, РАБОТ, УСЛУГ
        </Text>
        <View style={s.checkRow}>
          <View style={data.hasContract ? s.cbOn : s.cb}><Text>{data.hasContract ? "v" : " "}</Text></View>
          <Text style={{ fontSize: 7 }}>27.1. Договор (контракт) на поставку товаров, работ, услуг</Text>
          <Text style={s.hintCol}>{data.hasContract ? "Выберите эту галочку на портале" : ""}</Text>
        </View>
        <View style={s.checkRow}>
          <View style={!data.hasContract ? s.cbOn : s.cb}><Text>{!data.hasContract ? "v" : " "}</Text></View>
          <Text style={{ fontSize: 7 }}>27.2. Без договора (контракта) на поставку товаров, работ, услуг</Text>
          <Text style={s.hintCol}>{!data.hasContract ? "Выберите эту галочку на портале" : ""}</Text>
        </View>
        {data.hasContract && data.contractNumber && (
          <View style={{ paddingLeft: 24, marginTop: 2 }}>
            <F n="" label="Номер договора" value={data.contractNumber} hint="Введите номер" />
            {data.contractDate && <F n="" label="Дата договора" value={data.contractDate} hint="Выберите дату" />}
          </View>
        )}
        <Text style={{ fontSize: 7, fontWeight: 700, marginTop: 3, paddingLeft: 24 }}>
          30. ПОСТАВКА ТОВАРОВ ОСУЩЕСТВЛЕНА ПО ДОВЕРЕННОСТИ
        </Text>
        <F n="30.1." label="Номер доверенности" hint="Обычно пропускается" />
        <F n="30.2." label="Дата доверенности" hint="Обычно пропускается" />
        <F n="31." label="Пункт назначения" hint="Обычно пропускается" />
        <F n="31.1." label="Условия поставки" value="Не выбрано" hint="Оставьте 'Не выбрано'" />

        {/* ===== F. Документ-основание ===== */}
        <Text style={s.section}>F. Реквизиты документов, подтверждающих поставку товаров, работ, услуг</Text>
        <View style={{ paddingLeft: 24, marginBottom: 2 }}>
          <Text style={{ fontSize: 6, color: "#c00" }}>ВАЖНО: ЭСФ выписывается ТОЛЬКО на основе АВР или накладной! Без этого документа ЭСФ не выписать.</Text>
        </View>
        <F n="33.1." label="Номер документа" value={data.avrNumber ? `АКТ-${seller.iin}-${data.avrNumber}` : ""} hint="Введите номер вашего АВР" />
        <F n="33.2." label="Дата документа" value={data.avrDate} hint="Введите дату АВР" />

        {/* ===== G settings ===== */}
        <Text style={s.section}>G. Данные по товарам, работам, услугам (настройки)</Text>
        <F n="33.1." label="Код валюты" value="KZT - Тенге (Казахстан)" hint="Выберите KZT из списка" />
        <F n="33.2." label="Курс валюты" hint="Оставьте пустым (для KZT)" />
        <View style={{ paddingLeft: 24, marginTop: 2 }}>
          <Text style={{ fontSize: 6, color: "#555" }}>Направление расчета: нажмите кнопку "Прямой расчет" (синяя активная кнопка)</Text>
          <Text style={{ fontSize: 6, color: "#555" }}>Способ расчета: нажмите кнопку "Автоматический" (синяя активная кнопка)</Text>
          <Text style={{ fontSize: 6, color: "#555" }}>Без НДС - не РК: НЕ ставьте галочку</Text>
        </View>

        <View style={s.footer}>
          <Text>Таблица товаров/услуг (раздел G) на следующей странице (альбомная ориентация)</Text>
        </View>
      </Page>

      {/* ============ Page 3: Table G - LANDSCAPE ALL COLUMNS ============ */}
      <Page size="A4" orientation="landscape" style={s.pageLand}>
        <Text style={{ fontSize: 9, fontWeight: 700, marginBottom: 3 }}>
          G. Таблица товаров, работ, услуг (заполните на портале ИДЕНТИЧНО этой таблице)
        </Text>

        <View style={s.tbl}>
          {/* Header */}
          <View style={s.tHdr}>
            <Text style={[s.th, s.g1]}>№ п/п</Text>
            <Text style={[s.th, s.g2]}>№ п/п из СНТ</Text>
            <Text style={[s.th, s.g3]}>Признак происх.</Text>
            <Text style={[s.th, s.g4]}>Наименование товаров, работ, услуг</Text>
            <Text style={[s.th, s.g5]}>Наим. по деклар. (код БАСИ)</Text>
            <Text style={[s.th, s.g6]}>Код товара ГТН</Text>
            <Text style={[s.th, s.g7]}>КД ИЗМ</Text>
            <Text style={[s.th, s.g8]}>КОР-ВО</Text>
            <Text style={[s.th, s.g9]}>Кол. единица</Text>
            <Text style={[s.th, s.g10]}>Кол-во товаров</Text>
            <Text style={[s.th, s.g11]}>Цена (тариф) за единицу</Text>
            <Text style={[s.th, s.g12]}>Стоимость товаров без НДС</Text>
            <Text style={[s.th, s.g13]}>Акциз ставка</Text>
            <Text style={[s.th, s.g14]}>Акциз сумма</Text>
            <Text style={[s.th, s.g15]}>Размер оборота по реализации</Text>
            <Text style={[s.th, s.g16]}>НДС ставка</Text>
            <Text style={[s.th, s.g17]}>НДС сумма</Text>
            <Text style={[s.th, s.g18]}>Стоимость с учетом косв. налогов</Text>
            <Text style={[s.th, s.g19]}>№ деклар. на товары</Text>
            <Text style={[s.th, s.g20]}>Номер товарн. позиции</Text>
            <Text style={[s.th, s.g21]}>Идентиф. товара</Text>
            <Text style={[s.thL, s.g22]}>Код товара</Text>
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
            <Text style={[s.tc, s.g19]}>19</Text>
            <Text style={[s.tc, s.g20]}>20</Text>
            <Text style={[s.tc, s.g21]}>21</Text>
            <Text style={[s.trL, s.g22]}>22</Text>
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
              <Text style={[s.tc, s.g8]}></Text>
              <Text style={[s.tc, s.g9]}>Одна {item.unit}</Text>
              <Text style={[s.tc, s.g10]}>{item.qty}</Text>
              <Text style={[s.tr, s.g11]}>{formatMoney(item.price)}</Text>
              <Text style={[s.tr, s.g12]}>{formatMoney(item.total)}</Text>
              <Text style={[s.tc, s.g13]}></Text>
              <Text style={[s.tc, s.g14]}>0</Text>
              <Text style={[s.tr, s.g15]}>{formatMoney(item.total)}</Text>
              <Text style={[s.tc, s.g16]}>Без НДС</Text>
              <Text style={[s.tr, s.g17]}>0</Text>
              <Text style={[s.tr, s.g18]}>{formatMoney(item.total)}</Text>
              <Text style={[s.tc, s.g19]}></Text>
              <Text style={[s.tc, s.g20]}>1</Text>
              <Text style={[s.tc, s.g21]}></Text>
              <Text style={[s.trL, s.g22]}></Text>
            </View>
          ))}

          {/* Total */}
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
            <Text style={[s.tc, s.g10]}></Text>
            <Text style={[s.tc, s.g11]}></Text>
            <Text style={[s.tr, s.g12, { fontWeight: 700 }]}>{formatMoney(totalSum)}</Text>
            <Text style={[s.tc, s.g13]}></Text>
            <Text style={[s.tc, s.g14]}>0</Text>
            <Text style={[s.tr, s.g15, { fontWeight: 700 }]}>{formatMoney(totalSum)}</Text>
            <Text style={[s.tc, s.g16]}>Без НДС</Text>
            <Text style={[s.tr, s.g17, { fontWeight: 700 }]}>0</Text>
            <Text style={[s.tr, s.g18, { fontWeight: 700 }]}>{formatMoney(totalSum)}</Text>
            <Text style={[s.tc, s.g19]}></Text>
            <Text style={[s.tc, s.g20]}></Text>
            <Text style={[s.tc, s.g21]}></Text>
            <Text style={[s.trL, s.g22]}></Text>
          </View>
        </View>

        {/* Table hints */}
        <View style={{ marginTop: 4 }}>
          <Text style={{ fontSize: 6, fontWeight: 700, marginBottom: 1 }}>Подсказки по колонкам:</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>Кол. 3 (Признак): 6 = только для услуг/работ произведенных в РК. Для товаров - свой код в зависимости от происхождения.</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>Кол. 5, 6 (декларация, ГТН): только при наличии импортных товаров с таможенной декларацией.</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>Кол. 8 (КОР-ВО): количество в корректировке. Для обычного ЭСФ оставьте пустым.</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>Кол. 13-14 (Акциз): оставьте 0 если товар не подакцизный.</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>Кол. 15 (Размер оборота): = стоимости товаров (кол. 12) для обычных операций.</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>Кол. 16 (НДС): "Без НДС" для ИП на упрощенке. Плательщики НДС - укажите 16%.</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>Кол. 19-22: заполняются только при наличии декларации на импортные товары.</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>После заполнения: нажмите "Исправить" для проверки ошибок, затем "Сохранить" для отправки ЭСФ.</Text>
        </View>

        <View style={s.footer}>
          <Text>Сформировано в системе esep. Все номера полей и колонок идентичны порталу ИС ЭСФ (esf.gov.kz)</Text>
        </View>
      </Page>
    </Document>
  );
}
