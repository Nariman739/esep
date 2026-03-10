"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  bin: string;
  bankName?: string;
  iban?: string;
  directorName?: string;
}

interface ParsedData {
  name?: string;
  bin?: string;
  bankName?: string;
  iban?: string;
  bik?: string;
  kbe?: string;
  address?: string;
  directorName?: string;
  phone?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ParsedData>({});

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
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
      setForm(parsed);
      setPasteText("");
      toast.success("Реквизиты распознаны!");
    } catch {
      toast.error("Ошибка распознавания");
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    if (!form.name || !form.bin) {
      toast.error("Укажите название и БИН");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const newClient = await res.json();
      setClients([newClient, ...clients]);
      setShowForm(false);
      setForm({});
      toast.success("Клиент добавлен!");
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  const field = (label: string, key: keyof ParsedData, placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={form[key] || ""}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Клиенты</h1>
          <p className="text-gray-500 mt-1">Сохраните клиента один раз — потом выбираете из списка</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition text-sm"
        >
          + Добавить клиента
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Новый клиент</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">
              Вставьте реквизиты из WhatsApp — распознаем автоматически
            </p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={"ТОО «RightPartners»\nБИН 201040022708\nБИК HSBKKZKX\nИИК KZ70601A871003041481\nАО «Народный Банк Казахстана»\nКБе 17"}
              rows={5}
              className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={parseRequisites}
              disabled={parsing || !pasteText.trim()}
              className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
            >
              {parsing ? "Распознаём..." : "Распознать"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field("Название *", "name", "ТОО «RightPartners»")}
            {field("БИН *", "bin", "201040022708")}
            {field("Банк", "bankName", "Народный Банк")}
            {field("ИИК", "iban", "KZ...")}
            {field("БИК", "bik", "HSBKKZKX")}
            {field("КБе", "kbe", "17")}
            {field("Адрес", "address", "г. Астана, ул. ...")}
            {field("Директор", "directorName", "Иванов И.И.")}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
            >
              {saving ? "Сохраняем..." : "Сохранить клиента"}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm({}); }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {clients.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-500">Клиентов пока нет. Добавьте первого!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {clients.map((client) => (
              <div key={client.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500">БИН: {client.bin}</p>
                </div>
                {client.directorName && (
                  <p className="text-sm text-gray-400">{client.directorName}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
