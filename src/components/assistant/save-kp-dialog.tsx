"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { ClientInfo } from "@/lib/types";

interface SaveKpDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ClientInfo & { recommendedVariant: string }) => Promise<void>;
  prefilled?: ClientInfo | null;
}

const VARIANTS = [
  { value: "economy", label: "Эконом" },
  { value: "standard", label: "Стандарт" },
  { value: "premium", label: "Премиум" },
];

export function SaveKpDialog({ open, onClose, onSave, prefilled }: SaveKpDialogProps) {
  const [name, setName] = useState(prefilled?.name || "");
  const [phone, setPhone] = useState(prefilled?.phone || "");
  const [address, setAddress] = useState(prefilled?.address || "");
  const [recommendedVariant, setRecommendedVariant] = useState("standard");
  const [saving, setSaving] = useState(false);

  // Sync fields when prefilled data arrives after dialog is already open
  useEffect(() => {
    if (prefilled?.name) setName(prefilled.name);
    if (prefilled?.phone) setPhone(prefilled.phone);
    if (prefilled?.address) setAddress(prefilled.address);
  }, [prefilled]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        recommendedVariant,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Сохранить КП</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recommended variant selector */}
          <div className="space-y-2">
            <Label>Рекомендуемый вариант</Label>
            <div className="flex gap-2">
              {VARIANTS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setRecommendedVariant(v.value)}
                  className={[
                    "flex-1 py-2 rounded-lg border text-sm font-medium transition-colors",
                    recommendedVariant === v.value
                      ? "bg-[#1e3a5f] border-[#1e3a5f] text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Этот вариант будет выделен в КП как рекомендованный
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kp-name">Имя клиента</Label>
            <Input
              id="kp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Петров"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kp-phone">Телефон</Label>
            <Input
              id="kp-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 700 123 4567"
              type="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kp-address">Адрес (необязательно)</Label>
            <Input
              id="kp-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ул. Абая 15, кв. 42"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 bg-[#1e3a5f] hover:bg-[#152d4a]"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить"
              )}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
