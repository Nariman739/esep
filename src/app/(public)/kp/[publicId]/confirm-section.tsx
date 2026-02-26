"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Variant } from "@/lib/types";

interface ConfirmSectionProps {
  estimateId: string;
  variants: Variant[];
  recommendedVariant: string | null;
  initialConfirmedVariant: string | null;
  brandColor: string;
}

const VARIANT_COLORS = {
  economy: {
    label: "text-emerald-600",
    badge: "bg-emerald-500",
    button: "bg-emerald-600 hover:bg-emerald-700",
    ring: "ring-emerald-200",
    headerBg: "bg-emerald-50",
  },
  standard: {
    label: "text-blue-700",
    badge: "bg-blue-700",
    button: "bg-blue-700 hover:bg-blue-800",
    ring: "ring-blue-200",
    headerBg: "bg-blue-50",
  },
  premium: {
    label: "text-amber-600",
    badge: "bg-amber-500",
    button: "bg-amber-500 hover:bg-amber-600",
    ring: "ring-amber-200",
    headerBg: "bg-amber-50",
  },
};

export function ConfirmSection({
  estimateId,
  variants,
  recommendedVariant,
  initialConfirmedVariant,
  brandColor,
}: ConfirmSectionProps) {
  const [confirmedVariant, setConfirmedVariant] = useState<string | null>(
    initialConfirmedVariant
  );
  const [loading, setLoading] = useState<string | null>(null);

  async function handleConfirm(variantType: string) {
    if (confirmedVariant || loading) return;
    setLoading(variantType);
    try {
      const res = await fetch(`/api/estimates/${estimateId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantType }),
      });
      if (res.ok) setConfirmedVariant(variantType);
    } finally {
      setLoading(null);
    }
  }

  const isConfirmedAny = !!confirmedVariant;

  return (
    <div>
      {/* Success banner */}
      {isConfirmedAny && (
        <div className="mx-4 mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
          <p className="text-emerald-700 font-semibold text-base">
            ✅ Предложение принято!
          </p>
          <p className="text-emerald-600 text-sm mt-1">
            Мастер свяжется с вами для уточнения деталей.
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 px-4 md:grid md:grid-cols-3 md:overflow-visible snap-x snap-mandatory">
        {variants.map((v) => {
          const isRec = v.type === recommendedVariant;
          const isConfirmed = v.type === confirmedVariant;
          const isOtherConfirmed = isConfirmedAny && !isConfirmed;
          const colors = VARIANT_COLORS[v.type as keyof typeof VARIANT_COLORS];

          return (
            <div
              key={v.type}
              className={[
                "min-w-[260px] md:min-w-0 snap-start rounded-2xl border-2 bg-white flex flex-col transition-all",
                isRec
                  ? `border-[var(--brand)] shadow-lg ring-4 ${colors.ring}`
                  : "border-gray-200",
                isConfirmed ? "ring-4 ring-emerald-300 border-emerald-400" : "",
                isOtherConfirmed ? "opacity-50" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={isRec ? { "--brand": brandColor } as React.CSSProperties : {}}
            >
              {/* Card header */}
              <div
                className={`rounded-t-xl p-4 ${isRec ? "" : colors.headerBg}`}
                style={
                  isRec
                    ? { background: `${brandColor}18` }
                    : {}
                }
              >
                {isRec && (
                  <div
                    className="inline-flex items-center gap-1 text-xs font-bold text-white px-2.5 py-0.5 rounded-full mb-2"
                    style={{ backgroundColor: brandColor }}
                  >
                    ⭐ РЕКОМЕНДУЕМ
                  </div>
                )}
                <p className={`font-bold text-base ${colors.label}`}>
                  {v.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-0.5">
                  {formatPrice(v.total)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatPrice(v.pricePerM2)}/м²
                </p>
              </div>

              {/* Line items */}
              <div className="p-4 flex-1 space-y-3">
                {v.rooms.map((rv) => (
                  <div key={rv.roomId}>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      {rv.roomName}
                    </p>
                    {rv.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-xs text-gray-600 py-0.5"
                      >
                        <span className="leading-tight">{item.itemName}</span>
                        <span className="font-medium ml-2 shrink-0">
                          {formatPrice(item.total)}
                        </span>
                      </div>
                    ))}
                    {rv.heightMultiplied && (
                      <p className="text-[10px] text-orange-500 mt-0.5">
                        × 1.3 (высота &gt;3м)
                      </p>
                    )}
                  </div>
                ))}
                {v.minOrderApplied && (
                  <p className="text-[10px] text-gray-400 italic">
                    * Применён минимальный заказ
                  </p>
                )}
              </div>

              {/* Accept button */}
              <div className="p-4 pt-0">
                {isConfirmed ? (
                  <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-semibold py-3 rounded-xl text-sm">
                    ✅ Принято
                  </div>
                ) : isOtherConfirmed ? (
                  <div className="text-center text-gray-400 text-xs py-3">
                    Не выбрано
                  </div>
                ) : (
                  <button
                    onClick={() => handleConfirm(v.type)}
                    disabled={!!loading}
                    className={[
                      "w-full py-3 rounded-xl text-white text-sm font-semibold transition-all",
                      isRec ? "" : colors.button,
                      loading === v.type ? "opacity-70 cursor-not-allowed" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={isRec ? { backgroundColor: brandColor } : {}}
                  >
                    {loading === v.type
                      ? "Подтверждаем..."
                      : `Принять ${v.label}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
