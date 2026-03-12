import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(1deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 40px rgba(99,102,241,0.4), 0 20px 60px rgba(99,102,241,0.2); }
          50% { box-shadow: 0 0 70px rgba(99,102,241,0.6), 0 20px 80px rgba(99,102,241,0.3); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .float-card { animation: float 6s ease-in-out infinite; }
        .float-card-slow { animation: floatSlow 8s ease-in-out infinite; }
        .glow-btn { animation: glowPulse 3s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #818cf8 0%, #f472b6 25%, #818cf8 50%, #c084fc 75%, #818cf8 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .hero-bg {
          background: #08090f;
          background-image:
            radial-gradient(ellipse 80% 60% at 70% 20%, rgba(99,102,241,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 20% 80%, rgba(139,92,246,0.1) 0%, transparent 60%),
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0);
          background-size: 100% 100%, 100% 100%, 28px 28px;
        }
        .dark-section {
          background: #08090f;
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0);
          background-size: 100% 100%, 28px 28px;
        }
        .card-glass {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.07);
        }
        .feature-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }
        .nav-glass {
          background: rgba(8,9,15,0.7);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
      `}</style>

      <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-inter), sans-serif" }}>

        {/* ─── NAV ─── */}
        <nav className="nav-glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M3 2h7l3 3v9H3V2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M10 2v3h3" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M5 7h4M5 9.5h4M5 12h2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-base font-bold text-white tracking-tight">Esep</span>
            </div>
            <div className="hidden sm:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium transition" style={{ color: "rgba(255,255,255,0.5)" }}>Документы</a>
              <a href="#expert" className="text-sm font-medium transition" style={{ color: "rgba(255,255,255,0.5)" }}>Эксперт</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold transition" style={{ color: "rgba(255,255,255,0.6)" }}>
                Войти
              </Link>
              <Link
                href="/register"
                className="text-sm font-bold px-5 py-2.5 rounded-xl text-white transition active:scale-95"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}
              >
                Попробовать →
              </Link>
            </div>
          </div>
        </nav>

        {/* ─── HERO ─── */}
        <section className="hero-bg relative overflow-hidden" style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>

          {/* Big ambient glow */}
          <div className="absolute pointer-events-none" style={{ top: "-200px", right: "-200px", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", borderRadius: "50%" }} />
          <div className="absolute pointer-events-none" style={{ bottom: "-150px", left: "-100px", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />

          <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-20 items-center">

              {/* Left */}
              <div style={{ animation: "fadeUp 0.8s ease both" }}>
                <div
                  className="inline-flex items-center gap-2.5 text-xs font-semibold px-4 py-2 rounded-full mb-8"
                  style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#818cf8", animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#6366f1" }}></span>
                  </span>
                  Для ИП и малого бизнеса Казахстана
                </div>

                <h1 className="font-black leading-none mb-7" style={{ fontSize: "clamp(48px, 6vw, 76px)", letterSpacing: "-0.03em" }}>
                  <span style={{ color: "rgba(255,255,255,0.95)", display: "block" }}>Налоговые</span>
                  <span style={{ color: "rgba(255,255,255,0.95)", display: "block" }}>документы —</span>
                  <span className="gradient-text" style={{ display: "block" }}>без стресса</span>
                </h1>

                <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.45)", maxWidth: "420px", lineHeight: "1.7" }}>
                  Счет, АВР, ЭСФ по официальным формам МФ РК.
                  Реквизиты подставляются сами. Проверено бухгалтером.
                </p>

                <div className="flex flex-wrap gap-3 mb-12">
                  <Link
                    href="/register"
                    className="glow-btn inline-flex items-center gap-2.5 font-bold px-8 py-4 rounded-2xl text-base text-white transition active:scale-95"
                    style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
                  >
                    Создать первый документ
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 font-semibold px-7 py-4 rounded-2xl text-sm transition"
                    style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    Уже есть аккаунт
                  </Link>
                </div>

                {/* Trust pills */}
                <div className="flex flex-wrap gap-3">
                  {["✓ Форма Прил. 50 МФ РК", "✓ Проверено бухгалтером", "✓ PDF за 30 секунд"].map((t) => (
                    <span key={t} className="text-xs font-semibold px-3.5 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: document stack */}
              <div className="hidden lg:block relative" style={{ height: "520px" }}>

                {/* Main invoice card */}
                <div className="float-card absolute" style={{ top: 0, right: 0, width: "420px", borderRadius: "20px", overflow: "hidden", background: "#13111f", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)" }}>
                  {/* Gradient top border */}
                  <div style={{ height: "3px", background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)" }} />

                  {/* Doc header */}
                  <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#6366f1" }}>Счет на оплату</p>
                        <p className="font-black text-white" style={{ fontSize: "22px", letterSpacing: "-0.02em" }}>№ 42</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>от 12 марта 2026 г.</p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg mt-1" style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>
                        ✓ Готов
                      </span>
                    </div>
                  </div>

                  {/* Parties */}
                  <div className="px-5 py-4 grid grid-cols-2 gap-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", fontWeight: 700 }}>Поставщик</p>
                      <p className="font-bold text-white text-sm">ИП Жаминов Н.Е.</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>ИИН: 123456789012</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Kaspi Bank</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", fontWeight: 700 }}>Покупатель</p>
                      <p className="font-bold text-white text-sm">ТОО &ldquo;AlphaTrade&rdquo;</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>БИН: 230840001230</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Halyk Bank</p>
                    </div>
                  </div>

                  {/* Line items */}
                  <div className="px-5 py-3">
                    {[
                      { name: "Разработка веб-сайта", qty: "1 услуга", amount: "150 000 ₸" },
                      { name: "SEO-оптимизация", qty: "1 услуга", amount: "50 000 ₸" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <div>
                          <p className="text-sm font-semibold text-white">{item.name}</p>
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{item.qty}</p>
                        </div>
                        <p className="font-bold text-white text-sm">{item.amount}</p>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mx-3 mb-4 px-5 py-4 rounded-xl" style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>НДС: 0 ₸</p>
                        <p className="font-black text-white mt-0.5" style={{ fontSize: "24px", letterSpacing: "-0.02em" }}>200 000 ₸</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.25)" }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M4 10h12M11 5l5 5-5 5" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AVR mini card — floating bottom left */}
                <div className="float-card-slow absolute" style={{ bottom: "20px", left: "-30px", width: "200px", borderRadius: "16px", overflow: "hidden", background: "#1a1530", border: "1px solid rgba(34,197,94,0.2)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", animationDelay: "2s" }}>
                  <div style={{ height: "2px", background: "linear-gradient(90deg, #22c55e, #4ade80)" }} />
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "rgba(74,222,128,0.7)", fontSize: "10px", fontWeight: 700 }}>АВР выполнен</p>
                    <p className="font-black text-white text-base mb-0.5">№ 18</p>
                    <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>ТОО &ldquo;AlphaTrade&rdquo;</p>
                    <div className="flex items-center justify-between">
                      <p className="font-black" style={{ color: "#4ade80", fontSize: "18px" }}>200 000 ₸</p>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ESF badge — top left */}
                <div className="float-card-slow absolute" style={{ top: "70px", left: "-40px", borderRadius: "14px", background: "#1a1232", border: "1px solid rgba(139,92,246,0.25)", padding: "12px 16px", boxShadow: "0 12px 30px rgba(0,0,0,0.4)", animationDelay: "1s" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.2)" }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="1" y="1" width="12" height="12" rx="2" stroke="#a78bfa" strokeWidth="1.5"/>
                        <path d="M4 7l2 2 4-4" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">ЭСФ отправлен</p>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>esf.gov.kz ✓</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── STATS BAR ─── */}
        <section style={{ background: "#f8f8fc", borderTop: "1px solid #ebebf5", borderBottom: "1px solid #ebebf5" }}>
          <div className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-10">
            {[
              { val: "3", label: "типа документов" },
              { val: "30 сек", label: "на создание PDF" },
              { val: "Прил. 50", label: "официальная форма МФ РК" },
              { val: "0 ₸", label: "стоимость сейчас" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-black text-2xl text-gray-900" style={{ letterSpacing: "-0.02em" }}>{s.val}</p>
                <p className="text-xs font-medium text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── BEFORE / AFTER ─── */}
        <section className="py-28 px-6" style={{ background: "#fcfcfe" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#6366f1" }}>Зачем это нужно</p>
              <h2 className="font-black text-gray-900" style={{ fontSize: "clamp(32px, 4vw, 48px)", letterSpacing: "-0.025em", lineHeight: "1.1" }}>
                Как это было — и как стало
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="rounded-3xl p-8 border" style={{ background: "#fff5f5", borderColor: "#fecaca" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#fee2e2" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 3l8 8M11 3l-8 8" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="font-black text-base" style={{ color: "#ef4444" }}>Раньше</p>
                </div>
                <div className="space-y-3.5">
                  {[
                    "Скачать шаблон xlsx из интернета",
                    "Вводить реквизиты вручную каждый раз",
                    "Бояться ошибиться в форме",
                    "Звонить бухгалтеру по любому вопросу",
                    "Не знать: правильный ли это формат?",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#fee2e2", border: "1.5px solid #fca5a5" }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#f87171" }} />
                      </div>
                      <p className="text-sm font-medium line-through" style={{ color: "#9ca3af", textDecorationColor: "#fca5a5" }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl p-8 border" style={{ background: "#f5f3ff", borderColor: "#ddd6fe" }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#ede9fe" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l4 4 6-6" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="font-black text-base" style={{ color: "#7c3aed" }}>С Esep</p>
                </div>
                <div className="space-y-3.5">
                  {[
                    "Реквизиты сохранены — один раз навсегда",
                    "Клиент выбирается из списка за секунду",
                    "Форма по официальным требованиям МФ РК",
                    "Проверено налоговым консультантом Жаной",
                    "PDF скачан и отправлен за 30 секунд ✓",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#7c3aed" }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" className="py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-16">
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#6366f1" }}>Документы</p>
              <h2 className="font-black text-gray-900" style={{ fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "-0.025em", lineHeight: "1.1" }}>
                Три документа,<br />которые нужны каждому ИП
              </h2>
            </div>

            <div className="space-y-4" id="features">
              {[
                {
                  num: "01", accent: "#6366f1", bg: "#f5f3ff", border: "#ddd6fe",
                  title: "Счет на оплату",
                  desc: "Официальный формат для Казахстана. Поставщик, покупатель, таблица услуг, НДС, итоговая сумма прописью. Реквизиты из профиля — автоматически.",
                  tags: ["PDF одним кликом", "Официальный формат РК", "Сумма прописью"],
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path d="M5 3h9l4 4v12H5V3z" stroke="#6366f1" strokeWidth="1.8" strokeLinejoin="round"/>
                      <path d="M14 3v4h4" stroke="#6366f1" strokeWidth="1.8" strokeLinejoin="round"/>
                      <path d="M8 9h5M8 12h5M8 15h3" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ),
                },
                {
                  num: "02", accent: "#059669", bg: "#f0fdf4", border: "#bbf7d0",
                  title: "Акт выполненных работ (АВР)",
                  desc: "Приложение 50 к приказу МФ РК от 20.12.2012 № 562. Реквизиты и банковские данные обеих сторон, дата выполнения, подписи. Нужен перед выставлением ЭСФ.",
                  tags: ["Форма Прил. 50 МФ РК", "Банк. реквизиты сторон", "Требуется для ЭСФ"],
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <rect x="3" y="3" width="16" height="16" rx="3" stroke="#059669" strokeWidth="1.8"/>
                      <path d="M7 11l3 3 5-5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                },
                {
                  num: "03", accent: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff",
                  title: "Электронная счёт-фактура (ЭСФ)",
                  desc: "С 2025 года обязательна для всех. Подпись через ЭЦП (.p12 файл с egov.kz) и автоматическая отправка в систему esf.gov.kz. Всё в одном окне.",
                  tags: ["Обязательна с 2025 г.", "Подпись ЭЦП (.p12)", "Прямо в esf.gov.kz"],
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path d="M4 5h14v10H4z" rx="2" stroke="#7c3aed" strokeWidth="1.8" strokeLinejoin="round"/>
                      <path d="M8 12l2.5 2.5L15 8" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 19h8" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ),
                },
              ].map((f) => (
                <div key={f.num} className="feature-hover rounded-2xl border p-7 flex flex-col sm:flex-row gap-6 cursor-default transition-all" style={{ background: f.bg, borderColor: f.border }}>
                  <div className="shrink-0 flex sm:flex-col items-center sm:items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "white", boxShadow: `0 0 0 1px ${f.border}` }}>
                      {f.icon}
                    </div>
                    <p className="font-black text-4xl leading-none" style={{ color: f.accent, opacity: 0.15 }}>{f.num}</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-gray-900 mb-2" style={{ letterSpacing: "-0.01em" }}>{f.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{f.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {f.tags.map((tag) => (
                        <span key={tag} className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "white", color: f.accent, border: `1px solid ${f.accent}30` }}>
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
        <section id="expert" className="dark-section py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#818cf8" }}>Не просто инструмент</p>
              <h2 className="font-black text-white" style={{ fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "-0.025em", lineHeight: "1.1" }}>
                Разработано с<br />
                <span className="gradient-text">настоящим бухгалтером</span>
              </h2>
              <p className="mt-4 text-base max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
                Каждую форму проверил специалист по налогам РК. Не очередной шаблон из интернета.
              </p>
            </div>

            <div className="rounded-3xl overflow-hidden" style={{ background: "#0e0c1a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ height: "3px", background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #f59e0b)" }} />
              <div className="p-8 sm:p-12">
                <div className="flex flex-col sm:flex-row gap-8 items-start mb-8">
                  <div className="shrink-0">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl text-white" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>Ж</div>
                    <div className="flex items-center gap-1.5 mt-3 justify-center">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6.5" fill="#6366f1"/>
                        <path d="M4.5 7l2 2L10 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-xs font-bold" style={{ color: "#818cf8" }}>Верифицирован</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-white" style={{ letterSpacing: "-0.02em" }}>Жана [Фамилия]</h3>
                    <p className="font-semibold text-sm mt-0.5 mb-4" style={{ color: "#818cf8" }}>Налоговый консультант · Казахстан</p>
                    <blockquote className="text-base leading-relaxed border-l-2 pl-4" style={{ color: "rgba(255,255,255,0.55)", borderColor: "#6366f1" }}>
                      &ldquo;Я проверила каждую форму в Esep по требованиям налогового законодательства РК.
                      Счёт, АВР, ЭСФ — всё соответствует актуальным приказам МФ.
                      Как бухгалтер с опытом работы с ИП, я знаю где обычно допускают ошибки — здесь их нет.&rdquo;
                    </blockquote>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: "10+", label: "лет опыта" },
                    { val: "500+", label: "клиентов ИП" },
                    { val: "УСН", label: "специализация" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                      <p className="font-black text-white text-2xl" style={{ letterSpacing: "-0.03em" }}>{s.val}</p>
                      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hint */}
            <div className="mt-5 rounded-2xl px-6 py-5" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
              <p className="font-bold mb-3" style={{ color: "#fbbf24", fontSize: "13px" }}>Жана, для заполнения этого блока нужно:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["Фото (деловое, квадратное)", "Полное имя и фамилия", "Лет опыта", "Кол-во клиентов (100+...)", "2–3 предложения о себе", "Контакт для кнопки «Вопрос»"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(251,191,36,0.6)" }}>
                    <span style={{ color: "#fbbf24" }}>→</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-28 px-6" style={{ background: "#fcfcfe" }}>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full mb-8" style={{ background: "#eff0ff", color: "#6366f1", border: "1px solid #ddd6fe" }}>
              🇰🇿 Сделано для ИП Казахстана
            </div>
            <h2 className="font-black text-gray-900 mb-5" style={{ fontSize: "clamp(36px, 5vw, 60px)", letterSpacing: "-0.03em", lineHeight: "1.05" }}>
              Первый документ —<br />
              <span style={{ color: "#6366f1" }}>через 5 минут</span>
            </h2>
            <p className="text-xl mb-10 leading-relaxed" style={{ color: "#6b7280", maxWidth: "420px", margin: "0 auto 40px" }}>
              Зарегистрируйтесь, заполните реквизиты один раз — и создавайте счета и АВР без ошибок.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-3 font-black px-10 py-5 rounded-2xl text-lg text-white transition active:scale-95"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", boxShadow: "0 20px 60px rgba(99,102,241,0.35), 0 4px 20px rgba(99,102,241,0.2)", letterSpacing: "-0.01em" }}
            >
              Создать аккаунт — это бесплатно
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <p className="mt-5 text-sm font-medium" style={{ color: "#9ca3af" }}>Без карты. Без скачивания. Работает в браузере.</p>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer style={{ borderTop: "1px solid #e5e7eb", paddingTop: "32px", paddingBottom: "32px", paddingLeft: "24px", paddingRight: "24px" }}>
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M3 2h7l3 3v9H3V2z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
                  <path d="M10 2v3h3" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-bold text-gray-700">Esep</span>
              <span className="text-gray-300 mx-1">·</span>
              <span className="text-sm text-gray-400">Документы для ИП Казахстана</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/login" className="hover:text-gray-600 transition">Войти</Link>
              <Link href="/register" className="hover:text-gray-600 transition">Регистрация</Link>
              <span>Разработано с Жаной · 2026</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
