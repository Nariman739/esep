"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  bin: string;
}

interface Item {
  name: string;
  quantity: string;
  price: string;
}

type DocType = "invoice" | "avr";

const emptyItem = (): Item => ({ name: "", quantity: "1", price: "" });

export default function NewDocumentPage() {
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState<DocType>(
    (searchParams.get("type") as DocType) || "invoice"
  );
  const [clientId, setClientId] = useState(searchParams.get("clientId") || "");
  const [items, setItems] = useState<Item[]>([
    {
      name: searchParams.get("service") || "",
      quantity: searchParams.get("qty") || "1",
      price: searchParams.get("price") || "",
    },
  ]);
  const [contractNumber, setContractNumber] = useState(searchParams.get("contract") || "");
  const [contractDate, setContractDate] = useState(searchParams.get("contractDate") || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
  }, []);

  function updateItem(index: number, field: keyof Item, value: string) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    setItems([...items, emptyItem()]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  const itemTotals = items.map((it) => Number(it.quantity || 1) * Number(it.price || 0));
  const grandTotal = itemTotals.reduce((sum, t) => sum + t, 0);

  async function handleCreate() {
    if (!clientId) { toast.error("Выберите клиента"); return; }
    const namedItems = items.filter((it) => it.name.trim());
    if (namedItems.length === 0) { toast.error("Укажите название услуги"); return; }
    const validItems = namedItems.filter((it) => Number(it.price) > 0);
    if (validItems.length === 0) { toast.error("Укажите цену услуги"); return; }

    setLoading(true);
    try {
      const endpoint = docType === "invoice" ? "/api/documents/invoice" : "/api/documents/avr";
      const body = {
        clientId,
        contractNumber,
        contractDate,
        date,
        // Backwards compat: first item as main fields
        serviceName: validItems.map((it) => it.name).join(", "),
        quantity: validItems.length === 1 ? Number(validItems[0].quantity || 1) : 1,
        price: validItems.length === 1 ? Number(validItems[0].price) : grandTotal,
        // New: items array
        items: validItems.map((it) => ({
          name: it.name,
          unit: "услуга",
          quantity: Number(it.quantity || 1),
          price: Number(it.price),
          total: Number(it.quantity || 1) * Number(it.price),
        })),
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      if (docType === "invoice") {
        toast.success("Счет создан и скачан!");
      } else {
        toast.success("АВР создан и скачан!");
        toast("Не забудьте: после подписания АВР — 15 дней на выставление ЭСФ!", { duration: 8000 });
      }
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
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Выберите клиента...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name} (БИН: {c.bin})</option>
              ))}
            </select>
          )}
        </div>

        {/* Услуги / Работы */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isInvoice ? "Услуги" : "Работы / услуги"} *
          </label>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">Позиция {i + 1}</span>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(i)}
                      className="text-xs text-red-400 hover:text-red-600 transition"
                    >
                      Удалить
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(i, "name", e.target.value)}
                  placeholder="Название услуги / работы"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", e.target.value.replace(/\D/g, "") || "1")}
                      placeholder="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">Кол-во</span>
                  </div>
                  <div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={item.price}
                      onChange={(e) => updateItem(i, "price", e.target.value.replace(/\D/g, ""))}
                      placeholder="Цена (тг)"
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        item.name && !item.price ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">Цена за ед.</span>
                  </div>
                  <div className="flex items-center justify-end text-sm font-medium text-gray-700">
                    {itemTotals[i] > 0 ? `${itemTotals[i].toLocaleString("ru-KZ")} тг` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addItem}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
          >
            + Добавить ещё услугу
          </button>
        </div>

        {grandTotal > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
            <span className="text-green-700">Итого: </span>
            <span className="font-bold text-green-900 text-base">{grandTotal.toLocaleString("ru-KZ")} тг</span>
          </div>
        )}

        {/* Договор */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Договор <span className="text-gray-400 font-normal">(при наличии укажите номер и дату)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
              placeholder="Номер договора"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={contractDate}
              onChange={(e) => setContractDate(e.target.value)}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                contractNumber && !contractDate ? "border-amber-400 bg-amber-50" : "border-gray-300"
              }`}
            />
          </div>
          {contractNumber && !contractDate && (
            <p className="text-xs text-amber-600 mt-1.5">Укажите дату договора — она нужна для шпаргалок ЭСФ и АВР</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isInvoice ? "Дата счета" : "Дата акта"}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
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
