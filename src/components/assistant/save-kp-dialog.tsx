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
  onSave: (data: ClientInfo) => Promise<void>;
  prefilled?: ClientInfo | null;
}

export function SaveKpDialog({ open, onClose, onSave, prefilled }: SaveKpDialogProps) {
  const [name, setName] = useState(prefilled?.name || "");
  const [phone, setPhone] = useState(prefilled?.phone || "");
  const [address, setAddress] = useState(prefilled?.address || "");
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
