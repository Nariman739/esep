import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-inter), sans-serif" }}>

      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100 px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="1" width="7" height="9" rx="1" stroke="white" strokeWidth="1.5"/>
                <path d="M4 5h3M4 7h3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M8 8l3 3" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Esep</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-800 font-medium transition">
              Войти
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              Попробовать →
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-60" />
          <div className="absolute top-[60px] right-[-100px] w-[400px] h-[400px] bg-indigo-100 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-100 text-blue-600 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-7 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse" />
            Для ИП Казахстана · Упрощённая система налогообложения
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-5">
            Счета и АВР —<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
              за 30 секунд
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed">
            Заполните реквизиты один раз — создавайте правильные документы без ошибок и без бухгалтера рядом.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-8 py-4 rounded-xl text-base shadow-lg shadow-blue-200 transition"
            >
              Начать бесплатно
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-4 rounded-xl text-base border border-gray-200 transition"
            >
              Войти в аккаунт
            </Link>
          </div>

          {/* Document preview mockup */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/80 overflow-hidden text-left">
              {/* Mock browser bar */}
              <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-300" />
                  <div className="w-3 h-3 rounded-full bg-yellow-300" />
                  <div className="w-3 h-3 rounded-full bg-green-300" />
                </div>
                <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-200 mx-8 text-center">
                  esep.kz/dashboard
                </div>
              </div>
              {/* Mock UI */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="h-4 w-36 bg-gray-900 rounded-md" />
                    <div className="h-2.5 w-52 bg-gray-200 rounded-md mt-1.5" />
                  </div>
                  <div className="h-8 w-28 bg-blue-600 rounded-lg" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["blue", "green", "purple"].map((c, i) => (
                    <div key={i} className="rounded-xl border border-gray-100 p-3.5">
                      <div className={`h-6 w-12 rounded-md mb-2 ${c === "blue" ? "bg-blue-100" : c === "green" ? "bg-green-100" : "bg-purple-100"}`} />
                      <div className="h-2 w-16 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  {[1,2,3].map((r) => (
                    <div key={r} className={`flex items-center gap-3 px-4 py-3 ${r < 3 ? "border-b border-gray-50" : ""}`}>
                      <div className="h-5 w-16 bg-blue-100 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <div className="h-2.5 w-32 bg-gray-200 rounded" />
                        <div className="h-2 w-24 bg-gray-100 rounded" />
                      </div>
                      <div className="h-2.5 w-20 bg-gray-200 rounded" />
                      <div className="h-6 w-12 bg-gray-100 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAR ─── */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-5 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          {[
            { label: "Официальный формат МФ РК" },
            { label: "Счет + АВР + ЭСФ в одном месте" },
            { label: "Реквизиты заполняются автоматически" },
            { label: "Скачать PDF за 30 секунд" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" fill="#2563eb" fillOpacity="0.15"/>
                <path d="M4 7l2 2 4-4" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-medium text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Возможности</p>
          <h2 className="text-3xl font-bold text-gray-900">Все документы ИП в одном месте</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              color: "blue",
              bg: "bg-blue-50",
              border: "border-blue-100",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="2" width="12" height="16" rx="2" stroke="#2563eb" strokeWidth="1.8"/>
                  <path d="M8 8h4M8 11h4M8 14h2" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M14 18l4 4M16 20l2-2" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ),
              title: "Счет на оплату",
              desc: "Официальный казахстанский формат. Реквизиты подставляются автоматически — PDF одним кликом.",
              tag: "Самый частый документ",
            },
            {
              color: "green",
              bg: "bg-green-50",
              border: "border-green-100",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="#16a34a" strokeWidth="1.8"/>
                  <path d="M7 12l3 3 7-7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              title: "Акт выполненных работ",
              desc: "По форме Приложения 50 МФ РК. Реквизиты исполнителя и заказчика, банковские данные — всё включено.",
              tag: "Требуется после услуги",
            },
            {
              color: "purple",
              bg: "bg-purple-50",
              border: "border-purple-100",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16v12H4z" rx="2" stroke="#7c3aed" strokeWidth="1.8"/>
                  <path d="M8 12l2 2 4-4" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 20h8" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ),
              title: "Электронная счёт-фактура",
              desc: "Подпись через ЭЦП и отправка напрямую в esf.gov.kz. С этого года обязательна для всех.",
              tag: "Обязательна с 2025 г.",
            },
          ].map((f) => (
            <div key={f.title} className={`rounded-2xl border ${f.border} ${f.bg} p-6 flex flex-col gap-4`}>
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm border border-white">
                {f.icon}
              </div>
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 text-base">{f.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
              <div className="mt-auto">
                <span className="inline-block text-xs font-semibold text-gray-500 bg-white/70 border border-gray-200 px-3 py-1 rounded-full">
                  {f.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="bg-gray-950 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-3">Как это работает</p>
            <h2 className="text-3xl font-bold text-white">От регистрации до PDF — 3 шага</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                title: "Заполните реквизиты один раз",
                desc: "ИИН, банк, ИИК, БИК — всё сохраняется. Больше вводить не нужно.",
              },
              {
                n: "02",
                title: "Добавьте клиента",
                desc: "БИН компании, адрес, банковские реквизиты — один раз, потом выбираете из списка.",
              },
              {
                n: "03",
                title: "Создайте документ",
                desc: "Укажите услугу и сумму — скачайте готовый PDF или отправьте ЭСФ.",
              },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-gray-900 border border-gray-800 p-6">
                <p className="text-4xl font-black text-blue-500/30 mb-4 leading-none">{s.n}</p>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EXPERT ─── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Экспертиза</p>
            <h2 className="text-3xl font-bold text-gray-900">Разработано вместе с бухгалтером</h2>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">Не просто программисты — каждую форму проверила реальный специалист по налогам РК</p>
          </div>

          <div className="rounded-3xl border border-gray-200 overflow-hidden shadow-xl shadow-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2" />
            <div className="p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-center sm:items-start">
              {/* Avatar */}
              <div className="shrink-0 text-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg mx-auto">
                  Ж
                </div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" fill="#2563eb"/>
                    <path d="M3.5 6l2 2L9 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-xs text-blue-600 font-semibold">Верифицирован</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-0.5">Жана [Фамилия]</h3>
                <p className="text-blue-600 font-semibold text-sm mb-3">Налоговый консультант · Казахстан</p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Все документы в Esep разработаны по требованиям налогового законодательства РК.
                  Жана проверила каждую форму, чтобы ИП не получили замечания от налоговой.
                </p>
                <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                  {[
                    { val: "10+", label: "лет опыта" },
                    { val: "500+", label: "клиентов" },
                    { val: "УСН", label: "специализация" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-50 rounded-xl px-5 py-3 text-center border border-gray-100">
                      <p className="text-xl font-black text-gray-900">{stat.val}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hint block */}
          <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm">
            <p className="font-bold text-amber-800 mb-2">Жана, для заполнения этого блока нам нужно:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5">
              {[
                "Фото (деловое, квадратное или 3×4)",
                "Полное имя и фамилия",
                "Количество лет опыта",
                "Примерное кол-во клиентов (100+, 300+...)",
                "2–3 предложения о себе и специализации",
                "Контакт для кнопки «Задать вопрос»",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-amber-700">
                  <span className="mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1d4ed8, #4f46e5)" }}>
          <div className="px-10 py-16 text-center relative">
            <div className="absolute inset-0 opacity-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute w-64 h-64 rounded-full border border-white/20" style={{ top: `${i * 40 - 80}px`, left: `${i * 60 - 100}px` }} />
              ))}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 relative">Попробуйте прямо сейчас</h2>
            <p className="text-blue-100 text-base mb-8 relative">Бесплатно. Без скачивания. Работает в браузере.</p>
            <Link
              href="/register"
              className="relative inline-flex items-center gap-2 bg-white hover:bg-gray-50 active:scale-95 text-blue-600 font-bold px-9 py-4 rounded-xl text-base transition shadow-xl shadow-blue-900/30"
            >
              Создать аккаунт
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="1" width="7" height="9" rx="1" stroke="white" strokeWidth="1.5"/>
                <path d="M4 5h3M4 7h3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-600">Esep</span>
            <span className="text-gray-300">·</span>
            <span>Документы для ИП Казахстана</span>
          </div>
          <p>Разработано совместно с налоговым консультантом Жаной · 2026</p>
        </div>
      </footer>

    </div>
  );
}
