"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, MessageCircle, Check } from "lucide-react";

interface EstimateActionsProps {
  publicId: string;
  clientPhone?: string | null;
}

export function EstimateActions({ publicId, clientPhone }: EstimateActionsProps) {
  const [copied, setCopied] = useState(false);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/kp/${publicId}`
      : `/kp/${publicId}`;

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/kp/${publicId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement("input");
      el.value = `${window.location.origin}/kp/${publicId}`;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const url = `${window.location.origin}/kp/${publicId}`;
    const text = encodeURIComponent(`Ваш расчёт потолка готов! Посмотрите здесь: ${url}`);
    const phone = clientPhone?.replace(/\D/g, "");
    const waUrl = phone
      ? `https://wa.me/${phone}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" size="sm" onClick={handleCopy}>
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-2 text-green-600" />
            Скопировано!
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4 mr-2" />
            Скопировать ссылку
          </>
        )}
      </Button>
      <Button variant="outline" size="sm" onClick={handleWhatsApp}>
        <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
        Отправить в WhatsApp
      </Button>
    </div>
  );
}
