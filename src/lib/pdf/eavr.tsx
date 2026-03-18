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
  labelCol: { width: 160, fontSize: 7 },
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

  // G columns (landscape)
  g1: { width: 20 },   // № п/п
  g2: { width: 120 },  // Наименование работ
  g21: { width: 70 },  // Наим. по классиф.
  g22: { width: 45 },  // Сальный код ТНВЭД
  g3: { width: 50 },   // Дата выполнения
  g4: { width: 35 },   // Ед. изм
  g5: { width: 30 },   // Кол. (единица)
  g6: { width: 45 },   // Цена (тариф) за ед.
  g7: { width: 50 },   // Стоимость работ, услуг
  g8: { width: 45 },   // Размер оборота по реализации
  g9: { width: 35 },   // НДС Ставка
  g10: { width: 35 },  // НДС Сумма
  g11: { width: 50 },  // Стоимость работ с учётом косв. налогов
  g12: { width: 60 },  // Дополнительные сведения

  footer: { marginTop: 6, fontSize: 6, color: "#777", textAlign: "center", borderTopWidth: 0.5, borderColor: "#ccc", paddingTop: 3 },
});

interface EavrParty {
  iin: string;
  name: string;
  address: string;
  kbe?: string;
  iban?: string;
  bik?: string;
  bankName?: string;
  directorName?: string;
}

interface EavrItem {
  name: string;
  unit: string;
  qty: number;
  price: number;
  total: number;
}

export interface EavrPdfData {
  number: string;
  date: Date;
  workDate: Date;
  seller: EavrParty;   // Исполнитель
  buyer: EavrParty;    // Заказчик
  items: EavrItem[];
  totalSum: number;
  hasNds: boolean;
  ndsRate?: number;
  hasContract: boolean;
  contractNumber?: string;
  contractDate?: string;
  avrNumber?: string;
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

export function EavrPDF({ data }: { data: EavrPdfData }) {
  const { seller, buyer, items, totalSum } = data;

  const ndsRate = data.hasNds ? (data.ndsRate || 16) : 0;
  const ndsSum = data.hasNds ? Math.round(totalSum * ndsRate / (100 + ndsRate)) : 0;
  const totalWithNds = totalSum;

  return (
    <Document>
      {/* ============ Page 1: A + B + C + D + E ============ */}
      <Page size="A4" style={s.page}>
        <Text style={s.title}>Электронный АВР - Шпаргалка для портала esf.gov.kz</Text>
        <Text style={s.subtitle}>Откройте esf.gov.kz → "Акты выполненных работ" → "Создать". Заполняйте поля по этому документу. Номера полей совпадают с порталом.</Text>

        {/* ===== A. Общий раздел ===== */}
        <Text style={s.section}>Раздел A. Общий раздел</Text>
        <F n="1." label="Регистрационный номер" hint="Присвоится автоматически порталом" />
        <F n="1.1." label="Дата составления (выписки)" value={formatDate(data.date)} hint="Выберите дату" />
        <F n="2." label="Номер документа в учетной системе" value={data.avrNumber || data.number} hint="Введите номер" />
        <F n="3." label="Дата выполнения работ (оказания услуг)" value={formatDate(data.workDate)} hint="Выберите дату" />
        <F n="4." label="Актуальность" hint="Оставьте по умолчанию" />
        <View style={{ paddingLeft: 24, paddingTop: 1 }}>
          <Text style={{ fontSize: 6, color: "#888" }}>Вид АВР: оставьте пустым (обычный АВР, не исправленный и не дополнительный)</Text>
        </View>

        {/* ===== B. Реквизиты исполнителя (поставщика) ===== */}
        <Text style={s.section}>Раздел B. Реквизиты исполнителя (поставщика)</Text>
        <F n="5." label="ИИН/БИН *" value={seller.iin} hint="Заполнится авто по вашему ЭЦП" />
        <F n="5.0." label="БИН структурного подразделения" hint="Пропустите (для филиалов юр. лиц)" />
        <F n="6." label="Исполнитель (Поставщик) *" value={seller.name} hint="Заполнится авто" />
        <F n="7." label="Адрес места нахождения *" value={seller.address} hint="Проверьте адрес" />
        <F n="7.1." label="Дополнительные сведения" hint="Оставьте пустым" />
        <Text style={s.subsection}>8. Свидетельство плательщика НДС</Text>
        <F n="8." label="Дата постановки на рег. учет НДС" hint="Пропустите если не плательщик НДС" />
        <F n="8.1." label="Серия *" hint="Пропустите если не плательщик НДС" />
        <F n="8.2." label="Номер *" hint="Пропустите если не плательщик НДС" />
        <F n="9." label="Категория исполнителя (поставщика)" value="B. Индивидуальный предприниматель" hint="Выберите B для ИП, A для юр.лица" />

        {/* ===== C. Банковские реквизиты исполнителя ===== */}
        <Text style={s.section}>Раздел C. Банковские реквизиты исполнителя (поставщика)</Text>
        <View style={{ paddingLeft: 24, marginBottom: 2 }}>
          <Text style={{ fontSize: 6, color: "#555" }}>Реквизиты можно найти в приложении вашего банка. КБе для ИП = 19, для ТОО = 17. ИИК — номер банковского счёта.</Text>
        </View>
        <F n="10." label="КБе" value={seller.kbe} hint="ИП = 19, ТОО = 17" />
        <F n="11." label="ИИК" value={seller.iban} hint="Введите номер счёта (IBAN)" />
        <F n="12." label="БИК" value={seller.bik} hint="Введите БИК банка" />
        <F n="13." label="Наименование банка" value={seller.bankName} hint="Введите название банка" />

        {/* ===== D. Реквизиты заказчика (получателя) ===== */}
        <Text style={s.section}>Раздел D. Реквизиты заказчика (получателя)</Text>
        <F n="14." label="ИИН/БИН *" value={buyer.iin} hint="Введите БИН — остальное подтянется" />
        <F n="14.0." label="БИН структурного подразделения" hint="Пропустите" />
        <F n="14.1." label="Нерезидент" value="Нет" hint="Оставьте 'Нет'" />
        <F n="15." label="Заказчик (Получатель) *" value={buyer.name} hint="Проверьте название" />
        <F n="16." label="Адрес места нахождения *" value={buyer.address} hint="Проверьте адрес" />
        <F n="16.1." label="Дополнительные сведения" hint="Оставьте пустым" />
        <F n="17." label="Категория заказчика (получателя)" hint="Выберите: A-юр.лицо, B-ИП, C-физ.лицо" />

        {/* ===== E. Банковские реквизиты заказчика ===== */}
        <Text style={s.section}>Раздел E. Банковские реквизиты заказчика (получателя)</Text>
        <F n="18." label="КБе" value={buyer.kbe} hint="ИП = 19, ТОО = 17" />
        <F n="19." label="ИИК" value={buyer.iban} hint="Номер счёта заказчика" />
        <F n="20." label="БИК" value={buyer.bik} hint="БИК банка заказчика" />
        <F n="21." label="Наименование банка" value={buyer.bankName} hint="Банк заказчика" />
      </Page>

      {/* ============ Page 2: F + G settings + hints ============ */}
      <Page size="A4" style={s.page}>
        <Text style={{ fontSize: 8, fontWeight: 700, color: "#888", textAlign: "right", marginBottom: 4 }}>Электронный АВР — шпаргалка (стр. 2)</Text>

        {/* ===== F. Договор (контракт) ===== */}
        <Text style={s.section}>Раздел F. Договор (контракт)</Text>
        <View style={s.checkRow}>
          <View style={data.hasContract ? s.cbOn : s.cb}><Text>{data.hasContract ? "v" : " "}</Text></View>
          <Text style={{ fontSize: 7 }}>22.1. Договор (контракт) на выполнение работ (оказание услуг)</Text>
          <Text style={s.hintCol}>{data.hasContract ? "Выберите эту галочку" : ""}</Text>
        </View>
        <View style={s.checkRow}>
          <View style={!data.hasContract ? s.cbOn : s.cb}><Text>{!data.hasContract ? "v" : " "}</Text></View>
          <Text style={{ fontSize: 7 }}>22.2. Без договора (контракта) на выполнение работ (оказание услуг)</Text>
          <Text style={s.hintCol}>{!data.hasContract ? "Выберите эту галочку" : ""}</Text>
        </View>
        {data.hasContract && data.contractNumber && (
          <View style={{ paddingLeft: 24, marginTop: 2 }}>
            <F n="22.3." label="Номер" value={data.contractNumber} hint="Введите номер договора" />
            {data.contractDate && <F n="22.4." label="Дата" value={data.contractDate} hint="Введите дату договора" />}
          </View>
        )}
        <F n="22.5." label="Регистрационный номер ЭД" hint="Заполните если был электронный договор, иначе пропустите" />

        {/* ===== G. Настройки таблицы ===== */}
        <Text style={s.section}>Раздел G. Данные по выполненным работам (оказанным услугам)</Text>
        <F n="23.1." label="Код валюты *" value="KZT" hint="Выберите KZT из списка" />
        <F n="23.2." label="Курс валюты" hint="Оставьте пустым (для KZT)" />
        <View style={{ paddingLeft: 24, marginTop: 2 }}>
          <Text style={{ fontSize: 6, color: "#555" }}>Направление расчета: нажмите "Прямой расчет"</Text>
          <Text style={{ fontSize: 6, color: "#555" }}>Способ расчета: нажмите "Автоматический"</Text>
        </View>

        {/* ===== H. Дополнительные сведения ===== */}
        <Text style={s.section}>Раздел H. Дополнительные сведения</Text>
        <View style={{ paddingLeft: 24, marginBottom: 2 }}>
          <Text style={{ fontSize: 6, color: "#888" }}>Оставьте пустым. Заполняется при необходимости.</Text>
        </View>

        {/* ===== I. Сдал (исполнитель) / Принял (заказчик) ===== */}
        <Text style={s.section}>Раздел I. Сдал (исполнитель) / Принял (заказчик)</Text>
        <Text style={s.subsection}>Сдал (исполнитель)</Text>
        <F n="" label="ФИО" value={seller.directorName} hint="Ваше ФИО" />
        <Text style={s.subsection}>Принял (заказчик)</Text>
        <F n="" label="ФИО" value={buyer.directorName} hint="ФИО заказчика (подтянется после подписания)" />

        {/* ===== J. Приложения ===== */}
        <Text style={s.section}>Раздел J. Приложения</Text>
        <View style={{ paddingLeft: 24, marginBottom: 2 }}>
          <Text style={{ fontSize: 6, color: "#888" }}>Можно прикрепить файлы (отчёты, фото работ). Необязательно.</Text>
        </View>

        {/* ===== K. Текущий статус ===== */}
        <Text style={s.section}>Раздел K. Текущий статус: Акта выполненных работ</Text>
        <View style={{ paddingLeft: 24, marginBottom: 2 }}>
          <Text style={{ fontSize: 6, color: "#888" }}>Статус покажется автоматически после отправки. Сначала "Черновик", потом "Отправлен", "Подписан".</Text>
        </View>

        <View style={{ marginTop: 6, padding: "4 6", backgroundColor: "#fff3cd", borderWidth: 0.5, borderColor: "#ffc107" }}>
          <Text style={{ fontSize: 7, fontWeight: 700, color: "#856404" }}>ВАЖНО: После подписания АВР у вас 15 календарных дней на выставление ЭСФ! Лучше сразу выставить.</Text>
        </View>

        <View style={s.footer}>
          <Text>Таблица работ/услуг (раздел G) на следующей странице (альбомная ориентация)</Text>
        </View>
      </Page>

      {/* ============ Page 3: Table G - LANDSCAPE ============ */}
      <Page size="A4" orientation="landscape" style={s.pageLand}>
        <Text style={{ fontSize: 9, fontWeight: 700, marginBottom: 3 }}>
          G. Таблица данных по выполненным работам (оказанным услугам) — заполните на портале ИДЕНТИЧНО
        </Text>

        <View style={s.tbl}>
          {/* Header */}
          <View style={s.tHdr}>
            <Text style={[s.th, s.g1]}>№ п/п</Text>
            <Text style={[s.th, s.g2]}>Наименование работ (услуг)</Text>
            <Text style={[s.th, s.g21]}>Наим. по классификатору</Text>
            <Text style={[s.th, s.g22]}>Стоимостный код ТНВЭД</Text>
            <Text style={[s.th, s.g3]}>Дата выполнения работ (оказания услуг)</Text>
            <Text style={[s.th, s.g4]}>Ед. изм</Text>
            <Text style={[s.th, s.g5]}>Кол. (единица)</Text>
            <Text style={[s.th, s.g6]}>Цена (тариф) за единицу</Text>
            <Text style={[s.th, s.g7]}>Стоимость работ, услуг</Text>
            <Text style={[s.th, s.g8]}>Размер оборота по реализации</Text>
            <Text style={[s.th, s.g9]}>НДС Ставка</Text>
            <Text style={[s.th, s.g10]}>НДС Сумма</Text>
            <Text style={[s.th, s.g11]}>Стоимость работ с учётом косв. налогов</Text>
            <Text style={[s.thL, s.g12]}>Дополнительные сведения</Text>
          </View>

          {/* Column numbers */}
          <View style={s.tNumRow}>
            <Text style={[s.tc, s.g1]}>1</Text>
            <Text style={[s.tc, s.g2]}>2</Text>
            <Text style={[s.tc, s.g21]}>2.1</Text>
            <Text style={[s.tc, s.g22]}>2.2</Text>
            <Text style={[s.tc, s.g3]}>3</Text>
            <Text style={[s.tc, s.g4]}>4</Text>
            <Text style={[s.tc, s.g5]}>5</Text>
            <Text style={[s.tc, s.g6]}>6</Text>
            <Text style={[s.tc, s.g7]}>7</Text>
            <Text style={[s.tc, s.g8]}>8</Text>
            <Text style={[s.tc, s.g9]}>9</Text>
            <Text style={[s.tc, s.g10]}>10</Text>
            <Text style={[s.tc, s.g11]}>11</Text>
            <Text style={[s.trL, s.g12]}>12</Text>
          </View>

          {/* Data rows */}
          {items.map((item, i) => {
            const itemNds = data.hasNds ? Math.round(item.total * ndsRate / (100 + ndsRate)) : 0;
            return (
              <View key={i} style={s.tRow}>
                <Text style={[s.tc, s.g1]}>{i + 1}</Text>
                <Text style={[s.tl, s.g2]}>{item.name}</Text>
                <Text style={[s.tc, s.g21]}></Text>
                <Text style={[s.tc, s.g22]}></Text>
                <Text style={[s.tc, s.g3]}>{formatDate(data.workDate)}</Text>
                <Text style={[s.tc, s.g4]}>{item.unit}</Text>
                <Text style={[s.tc, s.g5]}>{item.qty}</Text>
                <Text style={[s.tr, s.g6]}>{formatMoney(item.price)}</Text>
                <Text style={[s.tr, s.g7]}>{formatMoney(item.total)}</Text>
                <Text style={[s.tr, s.g8]}>{formatMoney(item.total)}</Text>
                <Text style={[s.tc, s.g9]}>{data.hasNds ? `${ndsRate}%` : "Без НДС"}</Text>
                <Text style={[s.tr, s.g10]}>{itemNds}</Text>
                <Text style={[s.tr, s.g11]}>{formatMoney(item.total)}</Text>
                <Text style={[s.trL, s.g12]}></Text>
              </View>
            );
          })}

          {/* Total */}
          <View style={s.tTotalRow}>
            <Text style={[s.tc, s.g1]}></Text>
            <Text style={[s.tl, s.g2, { fontWeight: 700 }]}>Итого</Text>
            <Text style={[s.tc, s.g21]}></Text>
            <Text style={[s.tc, s.g22]}></Text>
            <Text style={[s.tc, s.g3]}></Text>
            <Text style={[s.tc, s.g4]}></Text>
            <Text style={[s.tc, s.g5]}></Text>
            <Text style={[s.tc, s.g6]}></Text>
            <Text style={[s.tr, s.g7, { fontWeight: 700 }]}>{formatMoney(totalSum)}</Text>
            <Text style={[s.tr, s.g8, { fontWeight: 700 }]}>{formatMoney(totalSum)}</Text>
            <Text style={[s.tc, s.g9]}></Text>
            <Text style={[s.tr, s.g10, { fontWeight: 700 }]}>{ndsSum}</Text>
            <Text style={[s.tr, s.g11, { fontWeight: 700 }]}>{formatMoney(totalWithNds)}</Text>
            <Text style={[s.trL, s.g12]}></Text>
          </View>

          {/* Всего по счету row */}
          <View style={s.tTotalRow}>
            <Text style={[s.tc, s.g1]}></Text>
            <Text style={[s.tl, s.g2, { fontWeight: 700 }]}>Всего по счету</Text>
            <Text style={[s.tc, s.g21]}></Text>
            <Text style={[s.tc, s.g22]}></Text>
            <Text style={[s.tc, s.g3]}></Text>
            <Text style={[s.tc, s.g4]}></Text>
            <Text style={[s.tc, s.g5]}></Text>
            <Text style={[s.tc, s.g6]}></Text>
            <Text style={[s.tr, s.g7, { fontWeight: 700 }]}>{formatMoney(totalSum)}</Text>
            <Text style={[s.tr, s.g8, { fontWeight: 700 }]}>{formatMoney(totalSum)}</Text>
            <Text style={[s.tc, s.g9]}></Text>
            <Text style={[s.tr, s.g10, { fontWeight: 700 }]}>{ndsSum}</Text>
            <Text style={[s.tr, s.g11, { fontWeight: 700 }]}>{formatMoney(totalWithNds)}</Text>
            <Text style={[s.trL, s.g12]}></Text>
          </View>
        </View>

        {/* Table hints */}
        <View style={{ marginTop: 4 }}>
          <Text style={{ fontSize: 6, fontWeight: 700, marginBottom: 1 }}>Подсказки по колонкам:</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>Кол. 1 (№ п/п): в первой графе нужно ввести код, соответствующий оказанной услуге (похож на ОКЭД).</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>Кол. 2 (Наименование): пишем вручную название услуги/работы.</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>Кол. 2.1-2.2 (Классификатор, ТНВЭД): оставьте пустым для обычных услуг.</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>Кол. 3 (Дата): дата фактического выполнения работ.</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>Кол. 4-5 (Ед.изм, Кол-во): единица измерения и количество.</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>Кол. 8 (Размер оборота): = стоимости работ (кол. 7) для обычных операций.</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>Кол. 9-10 (НДС): "Без НДС" для ИП на упрощенке. Плательщики НДС — укажите 16%.</Text>
          <Text style={{ fontSize: 5, color: "#555" }}>После заполнения: нажмите "Проверить" для проверки ошибок, затем "Сохранить" и отправьте на подписание.</Text>
        </View>

        <View style={{ marginTop: 4, padding: "4 6", backgroundColor: "#fff3cd", borderWidth: 0.5, borderColor: "#ffc107" }}>
          <Text style={{ fontSize: 6, fontWeight: 700, color: "#856404" }}>НАПОМИНАНИЕ: После подписания АВР — 15 календарных дней на выставление ЭСФ. Лучше выставить сразу!</Text>
        </View>

        <View style={s.footer}>
          <Text>Сформировано в системе esep. Все номера полей и разделов идентичны порталу esf.gov.kz → Акты выполненных работ</Text>
        </View>
      </Page>
    </Document>
  );
}
