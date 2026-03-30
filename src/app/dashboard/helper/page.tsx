"use client";
import { useState } from "react";

// 2026 constants
const MRP = 4325;
const MZP = 85000;
const BASIC_DEDUCTION_30 = 30 * MRP; // 129,750 — базовый вычет (только в одном месте работы)

type CalcMode = "employee" | "ip";

function calcEmployeeTaxes(salary: number, applyBasicDeduction: boolean) {
  // From salary (employee pays)
  const opvBase = Math.min(salary, 50 * MZP);
  const opv = Math.round(opvBase * 0.1);

  const vosmsBas = Math.min(salary, 10 * MZP);
  const vosms = Math.round(vosmsBas * 0.02);

  const deduction = applyBasicDeduction ? BASIC_DEDUCTION_30 : 0;
  const ipnBase = Math.max(salary - opv - vosms - deduction, 0);
  const ipn = Math.round(ipnBase * 0.1);

  const naRuki = salary - opv - vosms - ipn;

  // Employer pays (on top of salary) — для ИП на упрощёнке
  // СО = 5% × (ЗП - ОПВ). Если ЗП = МЗП, то ОПВ не вычитаем: МЗП × 5%
  const soBase = salary <= MZP ? salary : Math.max(salary - opv, 0);
  const so = Math.round(Math.min(soBase, 7 * MZP) * 0.05);

  // ООСМС работодатель = 3% от ЗП
  const osmsEmployer = Math.round(Math.min(salary, 10 * MZP) * 0.03);

  // ОПВР = 3.5% от ЗП
  const opvr = Math.round(salary * 0.035);

  const employerTotal = so + osmsEmployer + opvr;

  return { opv, vosms, ipn, naRuki, so, osmsEmployer, opvr, employerTotal, deduction };
}

function calcIpTaxes(income: number) {
  // ИП за себя (ежемесячно)
  const opv = Math.round(Math.min(income, 50 * MZP) * 0.1);
  const so = Math.round(Math.max(income, 0) * 0.05); // 5% от дохода (ОПВ не вычитаем)
  const vosms = Math.round(1.4 * MZP * 0.05); // фиксированная сумма
  const opvr = Math.round(income * 0.035); // 3.5% от дохода
  const total = opv + so + vosms + opvr;

  return { opv, so, vosms, opvr, total };
}

const DEADLINES = [
  { period: "Ежемесячно до 25 числа", items: ["ОПВ, ВОСМС, ИПН с зарплат работников", "СО, ООСМС, ОПВР (работодатель) за работников", "ОПВ, СО, ВОСМС, ОПВР за себя (ИП)"] },
  { period: "910.00 — 1 полугодие", items: ["Подача: до 15 августа", "Уплата: до 25 августа"] },
  { period: "910.00 — 2 полугодие", items: ["Подача: до 15 февраля", "Уплата: до 25 февраля"] },
  { period: "200.00 за работников (квартальная)", items: ["Q1: до 15 мая", "Q2: до 15 августа", "Q3: до 15 ноября", "Q4: до 15 февраля"] },
];

const FAQ: { q: string; a: string | React.ReactNode }[] = [
  // 1) Условия упрощёнки
  { q: "Условия применения упрощённого режима", a: (
    <div className="space-y-3">
      <p>Применять специальный налоговый режим на основе упрощённой декларации вправе ИП и юридические лица-резиденты РК, которые одновременно соответствуют следующим условиям:</p>
      <ul className="list-disc list-inside space-y-1 text-sm text-gray-500">
        <li>Вид деятельности не включён в перечень запрещённых для упрощёнки, утверждённый Правительством РК.</li>
        <li>Соблюдаются лимиты по доходу: предельный доход на УСН составляет 600 000 МРП (примерно {(600000 * MRP).toLocaleString("ru-KZ")} тг в год).</li>
      </ul>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-3 py-2 font-medium text-gray-700 border-b">Показатель</th>
              <th className="text-left px-3 py-2 font-medium text-gray-700 border-b">Ограничение</th>
            </tr>
          </thead>
          <tbody className="text-gray-500">
            <tr><td className="px-3 py-2 border-b">Оборот за год</td><td className="px-3 py-2 border-b">До <b className="text-gray-900">600 000 МРП</b> ({(600000 * MRP).toLocaleString("ru-KZ")} тг)</td></tr>
            <tr><td className="px-3 py-2 border-b">Штат сотрудников</td><td className="px-3 py-2 border-b">Не регламентировано</td></tr>
            <tr><td className="px-3 py-2 border-b">Филиалы</td><td className="px-3 py-2 border-b">Не регламентировано</td></tr>
            <tr><td className="px-3 py-2">НДС</td><td className="px-3 py-2"><b className="text-gray-900">Запрещено</b></td></tr>
          </tbody>
        </table>
      </div>
      <p>Предприниматель может добровольно перейти на ОУР через Кабинет налогоплательщика.</p>
      <p><a href="https://adilet.zan.kz/rus/docs/P2500000970" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2">Запрещённые виды деятельности для упрощёнки</a></p>
    </div>
  )},
  // 2) Ставка налога
  { q: "Какая ставка налога на упрощёнке?", a: "ИПН (налог на доход): базовая ставка 4% от дохода. Местные акиматы могут корректировать от 2% до 6%. В 2026 году акимат Астаны установил ставку 3%. Ставка может меняться каждый год." },
  // 3) Сколько платит за себя
  { q: "Сколько ИП платит за себя?", a: `ОПВ: 10% от заявленного дохода. СО: 5% от дохода. ВОСМС: 5% × 1.4 × МЗП = ${Math.round(1.4 * MZP * 0.05).toLocaleString("ru-KZ")} тг/мес (фиксированно). ОПВР: 3.5% от дохода.` },
  // 4) Соц платежи без дохода
  { q: "Нужно ли оплачивать соц платежи за ИП, если не было дохода?", a: "В месяц, когда не было дохода, ИП имеет право не оплачивать ОПВ, СО и ОПВР. Однако в обязательном порядке нужно ежемесячно оплачивать ВОСМС, даже если в текущем месяце не было дохода." },
  // 5) Какие отчёты сдаёт ИП
  { q: "Какие отчёты сдаёт ИП на упрощёнке?", a: "Форма 910.00 (упрощённая декларация) — сдаётся раз в полугодие. Если есть работники — дополнительно форма 200.00 (расчёт по ИПН и соц. налогу) ежеквартально. Ежемесячно — перечисление ОПВ, СО, ВОСМС, ОПВР за себя и за работников (если есть)." },
  // 6) Отчёт без дохода
  { q: "Нужно ли сдавать отчёт, если дохода не было?", a: "Да. Если ИП официально не приостановлено, вы обязаны сдать Форму 910.00 с нулевыми показателями («нулёвку») в установленные сроки." },
  // 7) 200.00 без работников
  { q: "Нужно ли сдавать 200.00 если нет работников?", a: "Нет. Форму 200.00 сдают только ИП с работниками." },
  // Остальные
  { q: "Какой КБЕ у ИП?", a: "19. У ТОО — 17." },
  { q: "Сколько дней на выставление ЭСФ после подписания АВР?", a: "15 календарных дней. Лучше выставлять сразу." },
  { q: "Какой МРП и МЗП в 2026?", a: `МРП = ${MRP.toLocaleString("ru-KZ")} тг, МЗП = ${MZP.toLocaleString("ru-KZ")} тг.` },
  { q: "Какая ставка НДС?", a: "Базовая ставка в 2026 году — 16%. Пониженные ставки: 5% (медицинские услуги, реализация лекарств), 10% (отечественные периодические печатные издания). Согласно новому налоговому кодексу, ИП на упрощённом режиме не может быть плательщиком НДС." },
  { q: "Где взять банковские реквизиты?", a: "В мобильном приложении вашего банка: КБЕ, ИИК (IBAN), БИК." },
  { q: "Что такое базовый вычет 30 МРП?", a: `Базовый налоговый вычет в Казахстане с 2026 года составляет 30 МРП (${BASIC_DEDUCTION_30.toLocaleString("ru-KZ")} тг) и применяется за каждый календарный месяц. Общая сумма базового налогового вычета за календарный год не должна превышать 360 МРП (${(360 * MRP).toLocaleString("ru-KZ")} тг). Этот вычет заменил старый стандартный вычет в размере 14 МРП и сделал зарплату, получаемую на руки, больше. Применяется только в одном месте работы.` },
];

type Tab = "calculator" | "deadlines" | "faq";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HelperPage() {
  const [tab, setTab] = useState<Tab>("calculator");
  const [salary, setSalary] = useState("100000");
  const [calcMode, setCalcMode] = useState<CalcMode>("employee");
  const [applyBasicDeduction, setApplyBasicDeduction] = useState(false);
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());

  const toggleFaq = (i: number) => {
    setOpenFaqs((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const sal = Number(salary) || 0;
  const empTaxes = calcEmployeeTaxes(sal, applyBasicDeduction);
  const ipTaxes = calcIpTaxes(sal);

  const tabs: { id: Tab; label: string }[] = [
    { id: "calculator", label: "Калькулятор" },
    { id: "deadlines", label: "Даты" },
    { id: "faq", label: "Вопросы" },
  ];

  return (
    <div className="max-w-2xl lg:max-w-3xl space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 p-7 text-white">
        <h1 className="text-2xl font-bold tracking-tight">Помощник ИП</h1>
        <p className="text-indigo-200 mt-1 text-sm">Налоги, даты и частые вопросы</p>
        <p className="text-indigo-300/60 text-xs mt-0.5">Расчёт для ИП на упрощённой декларации (форма 910.00)</p>
      </div>

      {/* Tabs — sticky on mobile */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm py-2 -mx-1 px-1">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calculator */}
      {tab === "calculator" && (
        <div className="space-y-5">
          {/* Mode toggle — visually different from main tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setCalcMode("employee")}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                calcMode === "employee"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              За сотрудника
            </button>
            <button
              onClick={() => setCalcMode("ip")}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                calcMode === "ip"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              За ИП (за себя)
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              {calcMode === "employee" ? "Зарплата сотрудника (до вычетов), тенге" : "Заявленный доход ИП за месяц, тенге"}
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={salary}
              onChange={(e) => setSalary(e.target.value.replace(/\D/g, ""))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          {/* === Employee mode === */}
          {calcMode === "employee" && sal > 0 && (
            <>
              {/* Basic deduction */}
              <div className="bg-amber-50/80 border border-amber-200/50 rounded-2xl p-4">
                <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={applyBasicDeduction}
                    onChange={(e) => setApplyBasicDeduction(e.target.checked)}
                    className="mt-0.5 w-5 h-5 accent-indigo-600 rounded"
                  />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Базовый вычет 30 МРП ({BASIC_DEDUCTION_30.toLocaleString("ru-KZ")} тг)
                    </p>
                    <p className="text-xs text-amber-700/70 mt-0.5">
                      Только в одном месте работы
                    </p>
                  </div>
                </label>
              </div>

              {/* Employee deductions */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 text-sm">Вычитается из зарплаты:</h3>
                <Row label="ОПВ (10%)" value={empTaxes.opv} />
                <Row label="ВОСМС (2%)" value={empTaxes.vosms} />
                <Row
                  label="ИПН (10%)"
                  value={empTaxes.ipn}
                  hint={`(${sal.toLocaleString("ru-KZ")} − ${empTaxes.opv.toLocaleString("ru-KZ")} − ${empTaxes.vosms.toLocaleString("ru-KZ")}${applyBasicDeduction ? ` − ${BASIC_DEDUCTION_30.toLocaleString("ru-KZ")} вычет` : ""}) × 10%${empTaxes.ipn === 0 ? " = 0 тг" : ""}`}
                />
                <div className="border-t border-gray-100 pt-4">
                  <Row label="На руки" value={empTaxes.naRuki} bold green />
                </div>
              </div>

              {/* Employer costs */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 text-sm">Платит работодатель (сверх ЗП):</h3>
                <Row label="СО (5%)" value={empTaxes.so} hint={`(ЗП${sal > MZP ? " − ОПВ" : ""}) × 5%`} />
                <Row label="ООСМС (3%)" value={empTaxes.osmsEmployer} hint="3% от ЗП" />
                <Row label="ОПВР (3.5%)" value={empTaxes.opvr} hint="3.5% от ЗП" />
                <div className="border-t border-gray-100 pt-4">
                  <Row label="Итого сверх ЗП" value={empTaxes.employerTotal} bold />
                </div>
              </div>

              {/* Summary — dark card */}
              <div className="rounded-2xl bg-gray-900 p-6 space-y-3 text-white">
                <h3 className="font-semibold text-sm text-gray-400">Итого</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Сотрудник получит</span>
                  <span className="font-bold text-lg tabular-nums">{empTaxes.naRuki.toLocaleString("ru-KZ")} тг</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Общая стоимость для ИП</span>
                  <span className="font-bold text-lg tabular-nums">{(sal + empTaxes.employerTotal).toLocaleString("ru-KZ")} тг</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                МРП = {MRP.toLocaleString("ru-KZ")} тг, МЗП = {MZP.toLocaleString("ru-KZ")} тг{applyBasicDeduction ? `, вычет 30 МРП (${BASIC_DEDUCTION_30.toLocaleString("ru-KZ")} тг)` : ""}
              </p>
            </>
          )}

          {/* === IP mode === */}
          {calcMode === "ip" && sal > 0 && (
            <>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 text-sm">ИП платит за себя (ежемесячно):</h3>
                <Row label="ОПВ (10%)" value={ipTaxes.opv} hint="10% от заявленного дохода" />
                <Row label="СО (5%)" value={ipTaxes.so} hint="5% от дохода" />
                <Row label="ВОСМС (5% × 1.4 × МЗП)" value={ipTaxes.vosms} hint="Фиксированная сумма" />
                <Row label="ОПВР (3.5%)" value={ipTaxes.opvr} hint="3.5% от дохода" />
                <div className="border-t border-gray-100 pt-4">
                  <Row label="Итого за себя в месяц" value={ipTaxes.total} bold />
                </div>
              </div>

              {/* Summary — dark card with important note inside */}
              <div className="rounded-2xl bg-gray-900 p-6 space-y-3 text-white">
                <h3 className="font-semibold text-sm text-gray-400">Итого</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ежемесячные отчисления</span>
                  <span className="font-bold text-lg tabular-nums">{ipTaxes.total.toLocaleString("ru-KZ")} тг</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Остаётся от дохода</span>
                  <span className="font-bold text-lg tabular-nums">{(sal - ipTaxes.total).toLocaleString("ru-KZ")} тг</span>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-1">
                  <p className="text-xs text-amber-400">
                    <span className="font-semibold">+ налог 910.00:</span> ИП на упрощёнке платит 3% от выручки за полугодие. Это основной налог.
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                МРП = {MRP.toLocaleString("ru-KZ")} тг, МЗП = {MZP.toLocaleString("ru-KZ")} тг
              </p>
            </>
          )}
        </div>
      )}

      {/* Deadlines */}
      {tab === "deadlines" && (
        <div className="space-y-4">
          {DEADLINES.map((d, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">{d.period}</h3>
              <ul className="space-y-2">
                {d.items.map((item, j) => (
                  <li key={j} className="text-sm text-gray-600 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-xs text-gray-400 text-center">
            ИП без работников не сдаёт форму 200.00
          </p>
        </div>
      )}

      {/* FAQ — multiple can be open */}
      {tab === "faq" && (
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={i} className={`bg-white rounded-2xl border transition-colors overflow-hidden ${openFaqs.has(i) ? "border-indigo-200" : "border-gray-200 hover:border-gray-300"}`}>
              <button
                onClick={() => toggleFaq(i)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 min-h-[52px]"
              >
                <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                <span className={`text-gray-400 ${openFaqs.has(i) ? "text-indigo-500" : ""}`}>
                  <Chevron open={openFaqs.has(i)} />
                </span>
              </button>
              {openFaqs.has(i) && (
                <div className="px-5 pb-5">
                  {typeof item.a === "string" ? (
                    <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
                  ) : (
                    <div className="text-sm text-gray-500 leading-relaxed">{item.a}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Accountant card — AFTER content, not before */}
      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <div className="p-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Не нашли ответ?</p>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-semibold text-base shrink-0">Ж</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">Жанна Беркимбаева</p>
              <p className="text-sm text-indigo-600 mt-0.5 font-medium">Бухгалтер · 7+ лет · 10+ компаний</p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">Помогаю предпринимателям выстроить понятный и надёжный учёт, чтобы избежать штрафов и спокойно вести бизнес.</p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {["Бухгалтерский и налоговый учёт", "Подготовка и сдача отчётности", "Расчёт и оплата налогов", "Кадровый учёт", "Открытие и закрытие ИП", "Работа с egov, stat.gov, Enbek"].map((s) => (
                  <p key={s} className="text-xs text-gray-500 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />{s}</p>
                ))}
              </div>
            </div>
          </div>
          <a
            href="https://wa.me/77713743877?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%92%D0%BE%D0%BF%D1%80%D0%BE%D1%81%20%D0%BF%D0%BE%20esep:"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 w-full block text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition"
          >
            Задать вопрос в WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, hint, bold, green }: { label: string; value: number; hint?: string; bold?: boolean; green?: boolean }) {
  return (
    <div>
      <div className="flex justify-between items-baseline text-sm">
        <span className={`${bold ? "font-semibold" : ""} ${green ? "text-emerald-600" : "text-gray-700"}`}>{label}</span>
        <span className={`tabular-nums ${bold ? "font-bold text-base" : "font-semibold"} ${green ? "text-emerald-600" : "text-gray-900"}`}>
          {value.toLocaleString("ru-KZ")} тг
        </span>
      </div>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
  );
}
