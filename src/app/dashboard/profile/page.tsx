"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Profile {
  fullName?: string;
  iin?: string;
  bankName?: string;
  iban?: string;
  bik?: string;
  kbe?: string;
  address?: string;
  directorName?: string;
  phone?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then(setProfile);
  }, []);

  async function parseRequisites() {
    if (!pasteText.trim()) return;
    setParsing(true);
    try {
      const res = await fetch("/api/parse-requisites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      });
      const parsed = await res.json();
      setProfile((prev) => ({
        ...prev,
        fullName: parsed.name || prev.fullName,
        iin: parsed.bin || prev.iin,
        bankName: parsed.bankName || prev.bankName,
        iban: parsed.iban || prev.iban,
        bik: parsed.bik || prev.bik,
        kbe: parsed.kbe || prev.kbe,
        address: parsed.address || prev.address,
        directorName: parsed.directorName || prev.directorName,
        phone: parsed.phone || prev.phone,
      }));
      setPasteText("");
      toast.success("Реквизиты распознаны!");
    } catch {
      toast.error("Ошибка распознавания");
    } finally {
      setParsing(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error();
      toast.success("Реквизиты сохранены!");
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  }

  const field = (label: string, key: keyof Profile, placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={profile[key] || ""}
        onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Мои реквизиты</h1>
        <p className="text-gray-500 mt-1">Заполните один раз — будут в каждом документе автоматически</p>
      </div>

      {/* Быстрый парсинг */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <p className="font-medium text-blue-900 mb-1">Быстрое заполнение</p>
        <p className="text-sm text-blue-700 mb-3">Вставьте ваши реквизиты текстом — распознаем автоматически</p>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={"ИП Жаминов Нариман\nИИН 123456789012\nБанк: Kaspi\nИИК KZ...\nБИК CASPKZKA"}
          rows={4}
          className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={parseRequisites}
          disabled={parsing || !pasteText.trim()}
          className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
        >
          {parsing ? "Распознаём..." : "Распознать автоматически"}
        </button>
      </div>

      {/* Форма */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form onSubmit={handleSave} className="space-y-4">
          {field("Ваше ФИО / Название ИП", "fullName", "ИП Жаминов Нариман Ерланович")}
          {field("ИИН", "iin", "123456789012")}
          {field("Банк", "bankName", "АО «Kaspi Bank»")}
          {field("ИИК (IBAN)", "iban", "KZ...")}
          {field("БИК", "bik", "CASPKZKA")}
          {field("КБе", "kbe", "17")}
          {field("Юридический адрес", "address", "г. Алматы, ул. ...")}
          {field("ФИО руководителя", "directorName", "Жаминов Нариман Ерланович")}
          {field("Телефон", "phone", "+7 777 000 00 00")}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? "Сохраняем..." : "Сохранить"}
          </button>
        </form>
      </div>
    </div>
  );
}
