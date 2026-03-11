"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { signXml, checkNcaLayer } from "@/lib/ncalayer/client";
import { buildInvoiceXml } from "@/lib/esf/invoice-xml";
import type { EsfInvoiceData } from "@/lib/esf/invoice-xml";

interface Client {
  id: string;
  name: string;
  bin?: string;
  address?: string;
}

interface Profile {
  fullName?: string;
  iin?: string;
  address?: string;
  iban?: string;
  bik?: string;
}

type Step = "form" | "signing" | "done";

export default function EsfPage() {
  const [step, setStep] = useState<Step>("form");
  const [ncaAvailable, setNcaAvailable] = useState<boolean | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    num: "",
    date: new Date().toISOString().slice(0, 10),
    clientId: "",
    contractNum: "",
    contractDate: "",
    items: [{ name: "", unit: "услуга", qty: 1, price: 0 }],
  });

  const [result, setResult] = useState<{ invoiceId?: string; regNum?: string } | null>(null);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then(setProfile);
    fetch("/api/clients").then((r) => r.json()).then(setClients);
    checkNcaLayer().then(setNcaAvailable);
  }, []);

  const selectedClient = clients.find((c) => c.id === form.clientId);

  function updateItem(i: number, field: string, value: string | number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) =>
        idx === i ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", unit: "услуга", qty: 1, price: 0 }],
    }));
  }

  function removeItem(i: number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== i),
    }));
  }

  const totalSum = form.items.reduce((s, item) => s + item.qty * item.price, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!profile.iin) {
      toast.error("Заполните ИИН в профиле");
      return;
    }
    if (!selectedClient?.bin) {
      toast.error("У клиента не указан ИИН/БИН");
      return;
    }
    if (!form.num) {
      toast.error("Укажите номер ЭСФ");
      return;
    }

    setStep("signing");
    setLoading(true);

    try {
      // Build invoice data
      const invoiceData: EsfInvoiceData = {
        num: form.num,
        date: form.date,
        seller: {
          tin: profile.iin,
          name: profile.fullName || "",
          address: profile.address || "",
          iban: profile.iban,
          bik: profile.bik,
        },
        buyer: {
          tin: selectedClient.bin!,
          name: selectedClient.name,
          address: selectedClient.address || "",
        },
        items: form.items.map((item, i) => ({
          num: i + 1,
          name: item.name,
          unit: item.unit,
          qty: item.qty,
          price: item.price,
          total: item.qty * item.price,
          ndsRate: 0,
          ndsSum: 0,
        })),
        contractNum: form.contractNum || undefined,
        contractDate: form.contractDate || undefined,
      };

      // Build XML
      const invoiceXml = buildInvoiceXml(invoiceData);

      // Step 1: Get nonce from ESF
      toast.info("Получаем nonce от ЭСФ...");
      const nonceRes = await fetch("/api/esf/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getNonce", tin: profile.iin }),
      });
      const { nonce, error: nonceErr } = await nonceRes.json();
      if (nonceErr) throw new Error(nonceErr);

      // Step 2: Sign nonce with NCALayer
      toast.info("Подписываем через NCALayer... Подтвердите в диалоге NCALayer");
      const nonceXml = `<nonce>${nonce}</nonce>`;
      const signedNonce = await signXml(nonceXml);

      // Extract signature and certificate from signed XML
      const sigValue = signedNonce.match(/<ds:SignatureValue[^>]*>([^<]+)<\/ds:SignatureValue>/)?.[1]
        || signedNonce.match(/<SignatureValue[^>]*>([^<]+)<\/SignatureValue>/)?.[1] || "";
      const certValue = signedNonce.match(/<ds:X509Certificate[^>]*>([^<]+)<\/ds:X509Certificate>/)?.[1]
        || signedNonce.match(/<X509Certificate[^>]*>([^<]+)<\/X509Certificate>/)?.[1] || "";

      // Step 3: Create session
      const sessionRes = await fetch("/api/esf/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          tin: profile.iin,
          signature: sigValue,
          certificate: certValue,
        }),
      });
      const { sessionToken, error: sessionErr } = await sessionRes.json();
      if (sessionErr) throw new Error(sessionErr);

      // Step 4: Sign invoice XML with NCALayer
      toast.info("Подписываем счёт-фактуру... Подтвердите в диалоге NCALayer");
      const signedInvoiceXml = await signXml(invoiceXml);

      // Step 5: Upload to ESF
      toast.info("Отправляем в ЭСФ...");
      const uploadRes = await fetch("/api/esf/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedXml: signedInvoiceXml, sessionToken }),
      });
      const uploadData = await uploadRes.json();
      if (uploadData.error) throw new Error(uploadData.error);

      // Step 6: Close session
      await fetch("/api/esf/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close", sessionToken }),
      }).catch(() => {});

      setResult(uploadData);
      setStep("done");
      toast.success("ЭСФ успешно отправлен!");
    } catch (err) {
      toast.error((err as Error).message);
      setStep("form");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done" && result) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">ЭСФ отправлен!</h2>
        {result.invoiceId && <p className="text-gray-600">ID счёт-фактуры: <strong>{result.invoiceId}</strong></p>}
        {result.regNum && <p className="text-gray-600">Рег. номер: <strong>{result.regNum}</strong></p>}
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => { setStep("form"); setResult(null); setForm({ ...form, num: "" }); }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Создать ещё
          </button>
          <a href="/dashboard/documents" className="px-6 py-2 border rounded-lg">
            К документам
          </a>
        </div>
      </div>
    );
  }

  if (step === "signing") {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="animate-spin text-4xl mb-4">⟳</div>
        <h2 className="text-xl font-semibold mb-2">Подписание через NCALayer</h2>
        <p className="text-gray-500">Подтвердите подпись в диалоге NCALayer на вашем компьютере</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Создать ЭСФ</h1>

      {/* NCALayer status */}
      {ncaAvailable === false && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          NCALayer не обнаружен. Запустите NCALayer перед отправкой ЭСФ.
        </div>
      )}
      {ncaAvailable === true && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          NCALayer запущен ✓
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Invoice info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Номер ЭСФ *</label>
            <input
              type="text"
              value={form.num}
              onChange={(e) => setForm({ ...form, num: e.target.value })}
              placeholder="1"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Дата</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Client */}
        <div>
          <label className="block text-sm font-medium mb-1">Покупатель *</label>
          <select
            value={form.clientId}
            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          >
            <option value="">Выберите клиента</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {selectedClient && !selectedClient.bin && (
            <p className="text-xs text-red-500 mt-1">У этого клиента не указан ИИН/БИН</p>
          )}
        </div>

        {/* Contract */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Номер договора</label>
            <input
              type="text"
              value={form.contractNum}
              onChange={(e) => setForm({ ...form, contractNum: e.target.value })}
              placeholder="№123"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Дата договора</label>
            <input
              type="date"
              value={form.contractDate}
              onChange={(e) => setForm({ ...form, contractDate: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Items */}
        <div>
          <label className="block text-sm font-medium mb-2">Услуги / товары</label>
          <div className="space-y-2">
            {form.items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(i, "name", e.target.value)}
                  placeholder="Название услуги"
                  className="col-span-5 border rounded px-2 py-1.5 text-sm"
                  required
                />
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => updateItem(i, "unit", e.target.value)}
                  placeholder="услуга"
                  className="col-span-2 border rounded px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
                  min={1}
                  className="col-span-1 border rounded px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => updateItem(i, "price", Number(e.target.value))}
                  placeholder="Цена"
                  min={0}
                  className="col-span-3 border rounded px-2 py-1.5 text-sm"
                />
                {form.items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="col-span-1 text-red-400 hover:text-red-600 text-lg">×</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="mt-2 text-sm text-blue-600 hover:underline">
            + Добавить строку
          </button>
        </div>

        {/* Total */}
        <div className="text-right text-lg font-semibold">
          Итого: {totalSum.toLocaleString("ru-KZ")} ₸
        </div>

        {/* Seller info */}
        {!profile.iin && (
          <p className="text-sm text-red-500">Заполните ИИН в <a href="/dashboard/profile" className="underline">профиле</a></p>
        )}

        <button
          type="submit"
          disabled={loading || !ncaAvailable || !profile.iin}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Обработка..." : "Подписать и отправить в ЭСФ"}
        </button>
      </form>
    </div>
  );
}
