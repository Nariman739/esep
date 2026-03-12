import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-inter), sans-serif" }}>

      {/* ─── NAV ─── */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 2h7l3 3v9H3V2z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M10 2v3h3" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M5 7h4M5 9.5h4M5 12h2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Esep</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-white/70 hover:text-white font-medium transition">
              Войти
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition active:scale-95"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              Начать бесплатно
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section
        className="relative overflow-hidden min-h-screen flex items-center"
        style={{ background: "linear-gradient(160deg, #0f0a1e 0%, #1a1035 50%, #0d1b3e 100%)" }}
      >
        {/* Decorative orbs */}
        <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />
        <div className="absolute bottom-[-150px] left-[-50px] w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }} />

        <div className="relative max-w-6xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left: text */}
          <div>
            <div
              className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-full mb-8"
              style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
              Для ИП Казахстана · Упрощённая система
            </div>

            <h1 className="font-extrabold leading-[1.05] tracking-tight mb-6" style={{ fontSize: "clamp(42px, 5vw, 68px)", color: "#ffffff" }}>
              Хватит бояться<br />
              <span style={{ color: "#818cf8" }}>налоговых</span><br />
              документов
            </h1>

            <p className="text-lg leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.55)", maxWidth: "420px" }}>
              Счет, АВР, ЭСФ — правильно и за 30 секунд. Реквизиты подставляются сами, формы проверены бухгалтером.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-xl text-base text-white transition active:scale-95"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 0 40px rgba(99,102,241,0.4)" }}
              >
                Попробовать бесплатно
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center font-semibold px-8 py-4 rounded-xl text-base transition"
                style={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                Уже есть аккаунт
              </Link>
            </div>
          </div>

          {/* Right: real document card */}
          <div className="hidden lg:flex justify-end">
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute inset-[-20px] rounded-3xl opacity-30" style={{ background: "radial-gradient(circle at 50% 50%, #6366f1, transparent 70%)", filter: "blur(20px)" }} />

              {/* Document card */}
              <div className="relative w-[380px] rounded-2xl overflow-hidden text-sm" style={{ background: "#161228", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
                {/* Card header */}
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <p className="font-bold text-white text-base">Счет на оплату № 42</p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>от 12 марта 2026 г.</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>PDF готов</span>
                </div>

                {/* Parties */}
                <div className="px-5 py-4 grid grid-cols-2 gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginBottom: "4px" }}>ПОСТАВЩИК</p>
                    <p className="font-semibold text-white text-xs">ИП Жаминов Н.Е.</p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>ИИН: 123456789012</p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>Kaspi Bank</p>
                  </div>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginBottom: "4px" }}>ПОКУПАТЕЛЬ</p>
                    <p className="font-semibold text-white text-xs">ТОО &ldquo;AlphaTrade&rdquo;</p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>БИН: 230840001230</p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>Halyk Bank</p>
                  </div>
                </div>

                {/* Table */}
                <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-white text-xs font-medium">Разработка веб-сайта</p>
                      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>1 услуга</p>
                    </div>
                    <p className="font-bold text-white">150 000 ₸</p>
                  </div>
                  <div className="flex justify-between items-center py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <p className="text-white text-xs font-medium">SEO-оптимизация</p>
                      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>1 услуга</p>
                    </div>
                    <p className="font-bold text-white">50 000 ₸</p>
                  </div>
                </div>

                {/* Total */}
                <div className="px-5 py-4 flex items-center justify-between" style={{ background: "rgba(99,102,241,0.1)" }}>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>НДС: 0 ₸</p>
                    <p className="font-black text-white text-xl mt-0.5">Итого: 200 000 ₸</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.3)" }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M4 9h10M9 4l5 5-5 5" stroke="#a5b4fc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* AVR floating card */}
              <div
                className="absolute -left-16 bottom-[-30px] w-52 rounded-xl text-xs"
                style={{ background: "#1e1635", border: "1px solid rgba(255,255,255,0.1)", padding: "14px", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(34,197,94,0.2)" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="font-bold text-white">АВР № 18</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>ТОО &ldquo;AlphaTrade&rdquo;</p>
                <p className="font-bold mt-1" style={{ color: "#4ade80" }}>200 000 ₸</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PAIN → SOLUTION ─── */}
      <section className="py-24 px-6" style={{ background: "#FAFAF8" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Before */}
            <div className="rounded-2xl border border-red-100 p-8" style={{ background: "#fff8f7" }}>
              <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-5">Раньше</p>
              <div className="space-y-3">
                {[
                  "Скачать шаблон xlsx из интернета",
                  "Заполнять реквизиты вручную каждый раз",
                  "Бояться сделать ошибку в форме",
                  "Звонить бухгалтеру по любому вопросу",
                  "Не знать: правильный ли формат?",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-red-200 flex items-center justify-center mt-0.5 shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-300" />
                    </div>
                    <p className="text-sm text-gray-500 line-through decoration-red-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* After */}
            <div className="rounded-2xl border border-indigo-100 p-8" style={{ background: "#f7f7ff" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#6366f1" }}>С Esep</p>
              <div className="space-y-3">
                {[
                  "Реквизиты сохранены — вводишь один раз",
                  "Клиенты в базе — выбираешь из списка",
                  "Формы по официальным требованиям МФ РК",
                  "Проверено налоговым консультантом Жаной",
                  "PDF скачан и отправлен за 30 секунд",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0" style={{ background: "#6366f1" }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#6366f1" }}>Документы</p>
            <h2 className="text-4xl font-extrabold text-gray-900 leading-tight" style={{ letterSpacing: "-0.02em" }}>
              Три документа, которые<br />нужны каждому ИП
            </h2>
          </div>

          <div className="space-y-5">
            {[
              {
                num: "01",
                title: "Счет на оплату",
                desc: "Официальный казахстанский формат. Поставщик, покупатель, таблица услуг, итоговая сумма прописью. Реквизиты из профиля подставляются автоматически — просто выберите клиента и укажите сумму.",
                tags: ["PDF одним кликом", "Официальный формат РК", "Реквизиты автоматически"],
                color: "#eff0ff",
                accent: "#6366f1",
              },
              {
                num: "02",
                title: "Акт выполненных работ (АВР)",
                desc: "Приложение 50 к приказу МФ РК от 20.12.2012 № 562. Реквизиты исполнителя и заказчика, банковские данные обеих сторон, дата выполнения, подписи. Всё как требует налоговая.",
                tags: ["Форма Прил. 50 МФ РК", "Банк. реквизиты сторон", "Нужен перед ЭСФ"],
                color: "#f0fdf4",
                accent: "#16a34a",
              },
              {
                num: "03",
                title: "Электронная счёт-фактура (ЭСФ)",
                desc: "Подпись через ЭЦП и отправка напрямую в esf.gov.kz. С 2025 года обязательна для всех ИП. Вы загружаете .p12 файл, вводите пароль — мы отправляем.",
                tags: ["Обязательна с 2025 г.", "Подпись ЭЦП (.p12)", "Прямо в esf.gov.kz"],
                color: "#fdf4ff",
                accent: "#9333ea",
              },
            ].map((f) => (
              <div key={f.num} className="rounded-2xl border border-gray-100 p-8 flex flex-col sm:flex-row gap-6 hover:shadow-lg transition-shadow" style={{ background: f.color }}>
                <div className="shrink-0">
                  <p className="font-black text-5xl leading-none" style={{ color: f.accent, opacity: 0.25 }}>{f.num}</p>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4 text-sm">{f.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {f.tags.map((tag) => (
                      <span key={tag} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.7)", color: f.accent, border: `1px solid ${f.accent}22` }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EXPERT ─── */}
      <section className="py-24 px-6" style={{ background: "#0f0a1e" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "#818cf8" }}>Экспертиза</p>
            <h2 className="text-4xl font-extrabold text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
              Не просто программисты
            </h2>
            <p className="mt-3 text-base" style={{ color: "rgba(255,255,255,0.5)" }}>
              Каждую форму проверила реальный специалист по налогам РК
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden" style={{ background: "#161228", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)" }} />
            <div className="p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                  Ж
                </div>
                <div className="flex items-center gap-1.5 mt-3 justify-center">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="6" fill="#6366f1"/>
                    <path d="M4 6.5l2 2L9.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-xs font-semibold" style={{ color: "#818cf8" }}>Эксперт</span>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white">Жана [Фамилия]</h3>
                <p className="text-sm mb-5" style={{ color: "#818cf8" }}>Налоговый консультант · Казахстан</p>
                <p className="leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px" }}>
                  &ldquo;Я проверила каждую форму в Esep по требованиям налогового законодательства РК.
                  Счёт, АВР, ЭСФ — всё соответствует актуальным приказам МФ. Как бухгалтер с опытом работы с ИП, я знаю где обычно допускают ошибки.&rdquo;
                </p>
                <div className="flex flex-wrap gap-4">
                  {[
                    { val: "10+", label: "лет опыта" },
                    { val: "500+", label: "клиентов ИП" },
                    { val: "УСН", label: "специализация" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl px-5 py-3 text-center" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                      <p className="text-xl font-black text-white">{stat.val}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hint for Zhana */}
          <div className="mt-5 rounded-2xl px-6 py-5" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <p className="font-bold mb-3" style={{ color: "#fbbf24" }}>Жана, для заполнения блока нам нужно от вас:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Фото (деловое, квадратное или 3×4)",
                "Полное имя и фамилия",
                "Количество лет опыта",
                "Кол-во клиентов (100+, 300+...)",
                "2–3 предложения о себе",
                "Контакт для кнопки «Задать вопрос»",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "rgba(251,191,36,0.7)" }}>
                  <span style={{ color: "#fbbf24" }}>→</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#6366f1" }}>Начните сегодня</p>
          <h2 className="text-5xl font-extrabold text-gray-900 leading-tight mb-5" style={{ letterSpacing: "-0.02em" }}>
            Первый документ —<br />
            <span style={{ color: "#6366f1" }}>через 5 минут</span>
          </h2>
          <p className="text-xl text-gray-500 mb-10">
            Зарегистрируйтесь, заполните реквизиты и создайте счет или АВР прямо сейчас.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-3 font-bold px-10 py-5 rounded-2xl text-lg text-white transition active:scale-95"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 20px 60px rgba(99,102,241,0.35)" }}
          >
            Создать аккаунт бесплатно
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <p className="mt-4 text-sm text-gray-400">Бесплатно. Без карты. Без установки.</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <path d="M3 2h7l3 3v9H3V2z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M10 2v3h3" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-gray-700">Esep</span>
            <span className="text-gray-300 mx-1">·</span>
            <span className="text-sm text-gray-400">Документы для ИП Казахстана</span>
          </div>
          <p className="text-sm text-gray-400">Разработано с налоговым консультантом Жаной · 2026</p>
        </div>
      </footer>

    </div>
  );
}
