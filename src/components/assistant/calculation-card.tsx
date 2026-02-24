"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { formatPrice, formatArea } from "@/lib/format";
import type { CalculationResult } from "@/lib/types";

interface CalculationCardProps {
  result: CalculationResult;
  onSaveKp?: () => void;
}

const variantConfig = {
  economy: { label: "Эконом", color: "text-green-600", bg: "bg-green-50" },
  standard: { label: "Стандарт", color: "text-[#1e3a5f]", bg: "bg-blue-50" },
  premium: { label: "Премиум", color: "text-amber-600", bg: "bg-amber-50" },
} as const;

export function CalculationCard({ result, onSaveKp }: CalculationCardProps) {
  return (
    <Card className="border-[#1e3a5f]/20">
      <CardContent className="pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Расчёт: {formatArea(result.totalArea)}</p>
          <Badge variant="secondary" className="text-xs">
            {result.rooms.length} {result.rooms.length === 1 ? "комната" : "комнат"}
          </Badge>
        </div>

        {/* 3 variants horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
          {result.variants.map((v) => {
            const config = variantConfig[v.type];
            const isHit = v.type === "standard";
            return (
              <div
                key={v.type}
                className={`flex-shrink-0 w-[140px] rounded-lg p-3 ${config.bg} ${
                  isHit ? "ring-2 ring-[#1e3a5f]/20" : ""
                } snap-start`}
              >
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-semibold ${config.color}`}>
                    {config.label}
                  </span>
                  {isHit && (
                    <Badge className="bg-[#1e3a5f] text-[10px] px-1 py-0">ХИТ</Badge>
                  )}
                </div>
                <p className="text-lg font-bold mt-1">{formatPrice(v.total)}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatPrice(v.pricePerM2)}/м²
                </p>
              </div>
            );
          })}
        </div>

        {onSaveKp && (
          <Button
            size="sm"
            className="w-full bg-[#1e3a5f] hover:bg-[#152d4a]"
            onClick={onSaveKp}
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить КП
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
