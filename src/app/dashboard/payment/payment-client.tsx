"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const EXPIRY_MS = 30 * 60 * 1000; // 30 минут

export default function PaymentClient({
  paymentId,
  createdAt,
}: {
  paymentId: string;
  createdAt: string;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<"pending" | "paid" | "waiting" | "expired">("pending");
  const [timeLeft, setTimeLeft] = useState("");

  // Таймер обратного отсчёта
  useEffect(() => {
    const created = new Date(createdAt).getTime();

    const tick = () => {
      const remaining = EXPIRY_MS - (Date.now() - created);
      if (remaining <= 0) {
        setStatus("expired");
        setTimeLeft("00:00");
        return;
      }
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  // Polling — проверяем статус каждые 10 секунд
  useEffect(() => {
    if (status === "expired" || status === "paid") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status?paymentId=${paymentId}`);
        const data = await res.json();
        if (data.status === "PAID") {
          setStatus("paid");
          clearInterval(interval);
          router.push("/dashboard/pricing?success=1");
        }
      } catch {
        // ignore
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [paymentId, router, status]);

  const handleConfirm = useCallback(async () => {
    if (status === "expired") return;
    setChecking(true);
    try {
      const res = await fetch(`/api/payments/status?paymentId=${paymentId}`);
      const data = await res.json();
      if (data.status === "PAID") {
        setStatus("paid");
        router.push("/dashboard/pricing?success=1");
      } else {
        setStatus("waiting");
        setTimeout(() => setStatus("pending"), 3000);
      }
    } catch {
      setStatus("pending");
    }
    setChecking(false);
  }, [paymentId, router, status]);

  if (status === "expired") {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-700 font-bold">Время оплаты истекло</p>
          <p className="text-red-600 text-sm mt-1">Создайте новый платёж</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/pricing")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
        >
          Вернуться к тарифам
        </button>
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-green-700 font-bold text-lg">Оплата подтверждена!</p>
        <p className="text-green-600 text-sm mt-1">Перенаправляем...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Таймер */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-gray-500">Ожидание оплаты</span>
        <span className="font-mono font-bold text-gray-700">{timeLeft}</span>
      </div>

      <button
        onClick={handleConfirm}
        disabled={checking}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition"
      >
        {checking ? "Проверяем..." : "Я оплатил"}
      </button>

      {status === "waiting" && (
        <p className="text-center text-amber-600 text-sm">
          Оплата пока не поступила. Подождите 1-2 минуты и попробуйте снова.
        </p>
      )}

      <p className="text-xs text-gray-400 text-center">
        Оплата проверяется автоматически каждые 10 секунд.
        <br />
        Если оплата не подтверждается — напишите нам в WhatsApp.
      </p>
    </div>
  );
}
