import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PLAN_NAMES, PLAN_PRICES } from "@/lib/subscription";
import PaymentClient from "./payment-client";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string; plan?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const { paymentId, plan } = params;

  if (!paymentId || !plan) redirect("/dashboard/pricing");

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId: user.id },
  });

  if (!payment) redirect("/dashboard/pricing");

  if (payment.status === "PAID") {
    redirect("/dashboard/pricing?success=1");
  }

  if (payment.status === "FAILED") {
    redirect("/dashboard/pricing?expired=1");
  }

  const planKey = plan as keyof typeof PLAN_NAMES;
  const amount = PLAN_PRICES[planKey] || 0;
  const planName = PLAN_NAMES[planKey] || plan;
  const createdAt = payment.createdAt.toISOString();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Оплата подписки</h1>
        <p className="text-gray-500 mt-1">Тариф &quot;{planName}&quot;</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        {/* Сумма */}
        <div className="text-center">
          <p className="text-sm text-gray-500">К оплате</p>
          <p className="text-4xl font-black text-gray-900 mt-1">
            {amount.toLocaleString("ru-KZ")} ₸
          </p>
          <p className="text-sm text-gray-400 mt-1">за 1 месяц</p>
        </div>

        {/* Kaspi Pay */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">K</span>
            </div>
            <p className="font-bold text-amber-900">Оплата через Kaspi</p>
          </div>

          <div className="space-y-3 text-sm text-amber-800">
            <div>
              <p className="font-semibold mb-1.5">Kaspi перевод по номеру:</p>
              <div className="bg-white rounded-lg p-3 font-mono text-center text-lg select-all border border-amber-100">
                {process.env.KASPI_PHONE || "+7 (7XX) XXX-XX-XX"}
              </div>
            </div>

            <div>
              <p className="font-semibold mb-1.5">Или на Kaspi Gold:</p>
              <div className="bg-white rounded-lg p-3 font-mono text-center text-sm select-all border border-amber-100">
                {process.env.KASPI_IBAN || "KZ00 0000 0000 0000 0000"}
              </div>
            </div>

            <div className="bg-amber-100 rounded-lg p-3 text-center">
              <p className="text-xs text-amber-700 mb-1">В комментарии к переводу укажите:</p>
              <p className="font-mono font-bold text-amber-900 select-all">{payment.kaspiOrderId}</p>
            </div>
          </div>
        </div>

        {/* Номер заказа */}
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400">Номер заказа</p>
          <p className="font-mono text-sm text-gray-600 mt-0.5">{payment.kaspiOrderId}</p>
        </div>

        {/* Client-side: кнопка, polling, таймер */}
        <PaymentClient paymentId={payment.id} createdAt={createdAt} />

        {/* Trust signals */}
        <div className="border-t border-gray-100 pt-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg mb-0.5">🔒</div>
              <p className="text-xs text-gray-400">Безопасно</p>
            </div>
            <div>
              <div className="text-lg mb-0.5">⚡</div>
              <p className="text-xs text-gray-400">Моментально</p>
            </div>
            <div>
              <div className="text-lg mb-0.5">✅</div>
              <p className="text-xs text-gray-400">Гарантия</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            После оплаты подписка активируется автоматически. Если возникли проблемы — напишите в WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
