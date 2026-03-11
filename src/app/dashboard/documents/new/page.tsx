"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  bin: string;
}

type DocType = "invoice" | "avr";

export default function NewDocumentPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState<DocType>("invoice");
  const [form, setForm] = useState({
    clientId: "",
    serviceName: "",
    quantity: "1",
    price: "",
    contractNumber: "",
    contractDate: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
  }, []);

  const total = Number(form.quantity || 1) * Number(form.price || 0);

  async function handleCreate() {
    if (!form.clientId) { toast.error("Выберите клиента"); return; }
    if (!form.serviceName) { toast.error("Укажите название услуги"); return; }
    if (!form.price || Number(form.price) <= 0) { toast.error("Укажите сумму"); return; }

    setLoading(true);
    try {
      const endpoint = docType === "invoice" ? "/api/documents/invoice" : "/api/documents/avr";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = docType === "invoice" ? `schet-${Date.now()}.pdf` : `avr-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(docType === "invoice" ? "Счет создан и скачан!" : "АВР создан и скачан!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  const isInvoice = docType === "invoice";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Создать документ</h1>
        <p className="text-gray-500 mt-1">Выберите тип, заполните и скачайте PDF</p>
      </div>

      {/* Выбор типа документа */}
      <div className="flex gap-3">
        <button
          onClick={() => setDocType("invoice")}
          className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm border-2 transition ${
            isInvoice
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
        >
          Счет на оплату
        </button>
        <button
          onClick={() => setDocType("avr")}
          className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm border-2 transition ${
            !isInvoice
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
          }`}
        >
          Акт выполненных работ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        {/* Клиент */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isInvoice ? "Покупатель" : "Заказчик"} *
          </label>
          {clients.length === 0 ? (
            <div className="border border-amber-200 bg-amber-50 rounded-xl px-4 py-3 text-sm text-amber-700">
              Сначала добавьте клиента в разделе{" "}
              <a href="/dashboard/clients" className="font-medium underline">Клиенты</a>
            </div>
          ) : (
            <select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Выберите клиента...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name} (БИН: {c.bin})</option>
              ))}
            </select>
          )}
        </div>

        {/* Услуга */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isInvoice ? "Название услуги" : "Наименование работ (услуг)"} *
          </label>
          <input
            type="text"
            value={form.serviceName}
            onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
            placeholder="Разработка сайта / Монтаж натяжных потолков / Консультация"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Сумма */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Количество</label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цена (тенге) *</label>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="150000"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {total > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
            <span className="text-green-700">Итого: </span>
            <span className="font-bold text-green-900 text-base">{total.toLocaleString("ru-KZ")} тг</span>
          </div>
        )}

        {/* Договор */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Номер договора <span className="text-gray-400 font-normal">(необязательно)</span>
          </label>
          <input
            type="text"
            value={form.contractNumber}
            onChange={(e) => setForm({ ...form, contractNumber: e.target.value })}
            placeholder="№ 42"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isInvoice ? "Дата счета" : "Дата акта"}
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={loading || clients.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition text-base"
        >
          {loading
            ? "Создаём PDF..."
            : isInvoice
              ? "Создать и скачать счет PDF"
              : "Создать и скачать АВР PDF"
          }
        </button>
      </div>
    </div>
  );
}
