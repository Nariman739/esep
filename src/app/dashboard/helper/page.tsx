"use client";
import { useState } from "react";

// 2025 constants
const MRP = 3932;
const MZP = 85000;
const IPN_DEDUCTION = 14 * MRP; // 55,048

function calcSalaryTaxes(salary: number) {
  // From salary (employee pays)
  const opvBase = Math.min(salary, 50 * MZP);
  const opv = Math.round(opvBase * 0.1);

  const vosmsBas = Math.min(salary, 10 * MZP);
  const vosms = Math.round(vosmsBas * 0.02);

  const ipnBase = Math.max(salary - opv - IPN_DEDUCTION, 0);
  const ipn = Math.round(ipnBase * 0.1);

  const naRuki = salary - opv - vosms - ipn;

  // Employer pays (on top of salary)
  const soBase = Math.min(salary - opv, 7 * MZP);
  const so = Math.round(Math.max(soBase, 0) * 0.035);

  const osmsEmployer = Math.round(Math.min(salary, 10 * MZP) * 0.02);

  const snBase = salary - opv - vosms;
  const snCalc = Math.round(Math.max(snBase, 0) * 0.095) - so;
  const sn = Math.max(snCalc, 0);

  const employerTotal = so + osmsEmployer + sn;

  return { opv, vosms, ipn, naRuki, so, osmsEmployer, sn, employerTotal };
}

const DEADLINES = [
  { period: "Ежемесячно до 25 числа", items: ["ОПВ, ВОСМС, ИПН с зарплат работников", "СО, ОСМС (работодатель) за работников", "ОПВ, СО, ОСМС за себя (ИП)"] },
  { period: "910.00 — 1 полугодие", items: ["Подача: до 15 августа", "Уплата: до 25 августа"] },
  { period: "910.00 — 2 полугодие", items: ["Подача: до 15 февраля", "Уплата: до 25 февраля"] },
  { period: "200.00 за работников (квартальная)", items: ["Q1: до 15 мая", "Q2: до 15 августа", "Q3: до 15 ноября", "Q4: до 15 февраля"] },
];

const FAQ = [
  { q: "Какая ставка налога на упрощёнке?", a: "3% от выручки за полугодие (1.5% ИПН + 1.5% СН). СН уменьшается на сумму СО." },
  { q: "Нужно ли сдавать 200.00 если нет работников?", a: "Нет. Форму 200.00 сдают только ИП с работниками." },
  { q: "Сколько ИП платит за себя?", a: "ОПВ: 10% от объявленного дохода. СО: 3.5% от дохода. ОСМС: 5% × 1.4 × МЗП = 5 950 тг/мес (фиксированно)." },
  { q: "Какой КБЕ у ИП?", a: "19. У ТОО — 17." },
  { q: "Сколько дней на выставление ЭСФ после подписания АВР?", a: "15 календарных дней. Лучше выставлять сразу." },
  { q: "Какой МРП и МЗП в 2025?", a: `МРП = ${MRP.toLocaleString("ru-KZ")} тг, МЗП = ${MZP.toLocaleString("ru-KZ")} тг.` },
  { q: "Какая ставка НДС?", a: "16% с 2025 года. ИП на упрощёнке — без НДС (если оборот до лимита)." },
  { q: "Где взять банковские реквизиты?", a: "В мобильном приложении вашего банка: КБЕ, ИИК (IBAN), БИК." },
];

type Tab = "calculator" | "deadlines" | "faq";

export default function HelperPage() {
  const [tab, setTab] = useState<Tab>("calculator");
  const [salary, setSalary] = useState("100000");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sal = Number(salary) || 0;
  const taxes = calcSalaryTaxes(sal);

  const tabs: { id: Tab; label: string }[] = [
    { id: "calculator", label: "Калькулятор ЗП" },
    { id: "deadlines", label: "Даты отчётности" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Помощник ИП</h1>
        <p className="text-gray-500 mt-1">Налоги, даты и частые вопросы</p>
      </div>

      {/* Ask accountant */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-green-800">Не нашли ответ?</p>
          <p className="text-sm text-green-600 mt-0.5">Задайте вопрос бухгалтеру напрямую</p>
        </div>
        <a
          href="https://wa.me/77001234567?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%92%D0%BE%D0%BF%D1%80%D0%BE%D1%81%20%D0%BF%D0%BE%20esep:"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition shrink-0"
        >
          Написать в WhatsApp
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              tab === t.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Calculator */}
      {tab === "calculator" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Зарплата работника (до вычетов), тенге
            </label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              min="0"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {sal > 0 && (
            <>
              {/* Employee deductions */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
                <h3 className="font-semibold text-gray-900">Вычитается из зарплаты работника:</h3>
                <Row label="ОПВ (10%)" value={taxes.opv} />
                <Row label="ВОСМС (2%)" value={taxes.vosms} />
                <Row label="ИПН (10%)" value={taxes.ipn} hint={`(${sal.toLocaleString("ru-KZ")} − ${taxes.opv.toLocaleString("ru-KZ")} − ${IPN_DEDUCTION.toLocaleString("ru-KZ")}) × 10%`} />
                <div className="border-t pt-3">
                  <Row label="На руки" value={taxes.naRuki} bold green />
                </div>
              </div>

              {/* Employer costs */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
                <h3 className="font-semibold text-gray-900">Платит работодатель (сверх зарплаты):</h3>
                <Row label="СО (3.5%)" value={taxes.so} />
                <Row label="ОСМС работодатель (2%)" value={taxes.osmsEmployer} />
                <Row label="СН (9.5% − СО)" value={taxes.sn} />
                <div className="border-t pt-3">
                  <Row label="Итого сверх ЗП" value={taxes.employerTotal} bold />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 space-y-2">
                <h3 className="font-semibold text-blue-900">Итого:</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Работник получит</span>
                  <span className="font-bold text-blue-900">{taxes.naRuki.toLocaleString("ru-KZ")} тг</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Общая стоимость для ИП</span>
                  <span className="font-bold text-blue-900">{(sal + taxes.employerTotal).toLocaleString("ru-KZ")} тг</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                МРП 2025 = {MRP.toLocaleString("ru-KZ")} тг, МЗП = {MZP.toLocaleString("ru-KZ")} тг, вычет ИПН = 14 МРП = {IPN_DEDUCTION.toLocaleString("ru-KZ")} тг
              </p>
            </>
          )}
        </div>
      )}

      {/* Deadlines */}
      {tab === "deadlines" && (
        <div className="space-y-4">
          {DEADLINES.map((d, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">{d.period}</h3>
              <ul className="space-y-1">
                {d.items.map((item, j) => (
                  <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
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

      {/* FAQ */}
      {tab === "faq" && (
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-5 py-4 text-left flex items-center justify-between"
              >
                <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                <span className="text-gray-400 text-lg shrink-0 ml-2">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-600">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, hint, bold, green }: { label: string; value: number; hint?: string; bold?: boolean; green?: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className={`${bold ? "font-semibold" : ""} ${green ? "text-green-700" : "text-gray-600"}`}>{label}</span>
        <span className={`${bold ? "font-bold" : "font-medium"} ${green ? "text-green-700" : "text-gray-900"}`}>
          {value.toLocaleString("ru-KZ")} тг
        </span>
      </div>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}
