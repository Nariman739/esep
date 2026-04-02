import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserSubscription, PLAN_PRICES, PLAN_NAMES, checkDocumentLimit } from "@/lib/subscription";
import Link from "next/link";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; already?: string; expired?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const success = params.success === "1";
  const already = params.already === "1";
  const expired = params.expired === "1";

  const sub = await getUserSubscription(user.id);
  const { used, limit, plan } = await checkDocumentLimit(user.id);

  const plans = [
    {
      key: "FREE" as const,
      name: "Бесплатный",
      price: "0",
      period: "",
      features: [
        "3 документа в месяц",
        "Счёт на оплату + АВР",
        "ЭСФ и Эл. АВР шпаргалки",
        "Помощник ИП",
      ],
      notIncluded: [
        "AI парсинг реквизитов",
        "Экспорт в Excel",
        "Консультация бухгалтера",
      ],
    },
    {
      key: "PRO" as const,
      name: "Про",
      price: "2 990",
      period: "/мес",
      popular: true,
      features: [
        "Безлимит документов",
        "Счёт на оплату + АВР",
        "ЭСФ и Эл. АВР шпаргалки",
        "Помощник ИП",
        "AI парсинг реквизитов",
        "Экспорт в Excel",
      ],
      notIncluded: [
        "Консультация бухгалтера",
      ],
    },
    {
      key: "PRO_ACCOUNTANT" as const,
      name: "Про + Бухгалтер",
      price: "9 990",
      period: "/мес",
      features: [
        "Всё из тарифа Про",
        "Личный бухгалтер в WhatsApp",
        "Проверка документов",
        "Помощь с заполнением ЭСФ",
        "Консультации по налогам",
        "Ответ в течение 24 часов",
      ],
      notIncluded: [],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Тарифы</h1>
        <p className="text-gray-500 mt-1">Выберите подходящий план для вашего бизнеса</p>
      </div>

      {/* Banners */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="font-bold text-green-800 text-lg">Подписка активирована!</p>
          <p className="text-green-600 text-sm mt-1">Спасибо за оплату. Все функции тарифа доступны.</p>
        </div>
      )}
      {already && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="font-bold text-amber-800">У вас уже есть активная подписка</p>
        </div>
      )}
      {expired && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
          <p className="font-bold text-red-800">Время оплаты истекло</p>
          <p className="text-red-600 text-sm mt-1">Выберите тариф и попробуйте снова</p>
        </div>
      )}

      {/* Current plan status */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="font-medium text-blue-900">
              Ваш тариф: <span className="font-bold">{PLAN_NAMES[plan]}</span>
            </p>
            {plan === "FREE" && (
              <p className="text-sm text-blue-700 mt-0.5">
                Использовано {used} из {limit} документов в этом месяце
              </p>
            )}
            {sub.expiresAt && sub.plan !== "FREE" && (
              <p className="text-sm text-blue-700 mt-0.5">
                Действует до {new Date(sub.expiresAt).toLocaleDateString("ru-KZ")}
              </p>
            )}
          </div>
          {plan === "FREE" && (
            <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {limit - used} осталось
            </div>
          )}
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid sm:grid-cols-3 gap-4">
        {plans.map((p) => {
          const isCurrent = p.key === plan;
          const isUpgrade = PLAN_PRICES[p.key] > PLAN_PRICES[plan];

          return (
            <div
              key={p.key}
              className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${
                p.popular
                  ? "border-blue-500 shadow-lg shadow-blue-100"
                  : isCurrent
                  ? "border-green-400"
                  : "border-gray-200"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Популярный
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Текущий
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-bold text-lg text-gray-900">{p.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-black text-gray-900">{p.price}</span>
                  <span className="text-gray-500 ml-1">₸{p.period}</span>
                </div>
              </div>

              <div className="flex-1 space-y-2.5 mb-6">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">{f}</span>
                  </div>
                ))}
                {p.notIncluded.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm text-gray-400">{f}</span>
                  </div>
                ))}
              </div>

              {isCurrent ? (
                <div className="bg-gray-100 text-gray-500 text-center text-sm font-medium py-3 rounded-xl">
                  Текущий план
                </div>
              ) : isUpgrade ? (
                <Link
                  href={`/api/payments/create?plan=${p.key}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-center text-sm font-bold py-3 rounded-xl transition block"
                >
                  Подключить за {p.price} ₸/мес
                </Link>
              ) : (
                <div className="bg-gray-50 text-gray-400 text-center text-sm py-3 rounded-xl">
                  —
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment info */}
      <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-gray-900">Как оплатить?</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="bg-blue-100 text-blue-700 font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs">1</span>
            <span>Нажмите &quot;Подключить&quot; на нужном тарифе</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-blue-100 text-blue-700 font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs">2</span>
            <span>Оплатите через Kaspi QR или переводом</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="bg-blue-100 text-blue-700 font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs">3</span>
            <span>Подписка активируется автоматически</span>
          </div>
        </div>
      </div>
    </div>
  );
}
