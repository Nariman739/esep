"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Save, Loader2, Send, CheckCircle2, Link2Off, RefreshCw } from "lucide-react";
import type { MasterProfile } from "@/lib/types";

const BOT_USERNAME = "potolokaiBot";

export default function ProfilePage() {
  const [master, setMaster] = useState<MasterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Telegram linking state
  const [tgLinked, setTgLinked] = useState(false);
  const [tgLinkCode, setTgLinkCode] = useState<string | null>(null);
  const [tgLoading, setTgLoading] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [brandColor, setBrandColor] = useState("#1e3a5f");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setMaster(data);
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setPhone(data.phone || "");
        setCompanyName(data.companyName || "");
        setBrandColor(data.brandColor || "#1e3a5f");
        setInstagramUrl(data.instagramUrl || "");
        setWhatsappPhone(data.whatsappPhone || "");
        setAddress(data.address || "");
      })
      .finally(() => setLoading(false));

    // Check Telegram link status
    fetch("/api/telegram/link-code")
      .then((r) => r.json())
      .then((data) => setTgLinked(data.linked ?? false))
      .catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          companyName,
          brandColor,
          instagramUrl,
          whatsappPhone,
          address,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Профиль сохранён");
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateCode() {
    setTgLoading(true);
    try {
      const res = await fetch("/api/telegram/link-code", { method: "POST" });
      const data = await res.json();
      if (data.code) setTgLinkCode(data.code);
    } catch {
      toast.error("Ошибка генерации кода");
    } finally {
      setTgLoading(false);
    }
  }

  async function handleUnlink() {
    setTgLoading(true);
    try {
      await fetch("/api/telegram/link-code", { method: "DELETE" });
      setTgLinked(false);
      setTgLinkCode(null);
      toast.success("Telegram отвязан");
    } catch {
      toast.error("Ошибка");
    } finally {
      setTgLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Профиль</h1>

      {/* Personal info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Личные данные</CardTitle>
          <CardDescription>Ваше имя и контакты</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Имя</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Фамилия</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Телефон</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 700 123 4567" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={master?.email || ""} disabled className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Telegram notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Telegram уведомления</CardTitle>
          <CardDescription>
            Получайте уведомления когда клиент принимает КП
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tgLinked ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Telegram подключён</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnlink}
                disabled={tgLoading}
              >
                <Link2Off className="h-4 w-4 mr-2" />
                Отвязать
              </Button>
            </div>
          ) : tgLinkCode ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Нажмите кнопку ниже — откроется бот. Нажмите{" "}
                <strong>Start / Начать</strong> и аккаунт привяжется автоматически.
              </p>
              <Button
                className="w-full bg-[#229ED9] hover:bg-[#1a8fc4] text-white"
                onClick={() =>
                  window.open(
                    `https://t.me/${BOT_USERNAME}?start=${tgLinkCode}`,
                    "_blank"
                  )
                }
              >
                <Send className="h-4 w-4 mr-2" />
                Открыть @{BOT_USERNAME}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={handleGenerateCode}
                disabled={tgLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Новый код
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Привяжите Telegram, чтобы получать мгновенные уведомления
                когда клиент принимает ваше КП.
              </p>
              <Button
                variant="outline"
                onClick={handleGenerateCode}
                disabled={tgLoading}
              >
                {tgLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Привязать Telegram
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Брендинг КП</CardTitle>
          <CardDescription>Как будет выглядеть ваше коммерческое предложение</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Название компании</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Мастер Потолков" />
          </div>

          <div className="space-y-2">
            <Label>Цвет бренда</Label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border"
              />
              <Input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-28 sm:w-32" />
              <div
                className="h-10 w-full sm:flex-1 sm:w-auto rounded-lg flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: brandColor }}
              >
                Превью цвета
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Адрес</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="г. Астана" />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="@potolki_astana" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} placeholder="+77001234567" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="bg-[#1e3a5f] hover:bg-[#152d4a]">
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Сохранение...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </>
        )}
      </Button>
    </div>
  );
}
