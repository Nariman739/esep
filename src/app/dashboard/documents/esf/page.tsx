"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  bin?: string;
}

interface AvrDocument {
  id: string;
  type: string;
  number: number;
  serviceName: string;
  total: string;
  date: string;
  client: Client;
  contractNumber?: string;
  contractDate?: string;
}

interface Profile {
  fullName?: string;
  iin?: string;
  address?: string;
  iban?: string;
  bik?: string;
  bankName?: string;
  kbe?: string;
}

export default function EsfPage() {
  const [avrList, setAvrList] = useState<AvrDocument[]>([]);
  const [profile, setProfile] = useState<Profile>({});
  const [selectedAvrId, setSelectedAvrId] = useState("");
  const [turnoverDate, setTurnoverDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then(setProfile);
    fetch("/api/documents")
      .then((r) => r.json())
      .then((docs: AvrDocument[]) => setAvrList(docs.filter((d: { type: string }) => d.type === "AVR")));
  }, []);

  const selectedAvr = avrList.find((a) => a.id === selectedAvrId);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();

    if (!profile.iin) {
      toast.error("Заполните ИИН в профиле");
      return;
    }
    if (!selectedAvrId) {
      toast.error("Выберите АВР");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/documents/esf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avrId: selectedAvrId, turnoverDate }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка генерации");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `esf-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      setDone(true);
      toast.success("ЭСФ-шпаргалка скачана!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="text-5xl mb-4 text-green-500">&#10003;</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">PDF готов!</h2>
        <p className="text-gray-600 mb-2">Шпаргалка для заполнения ЭСФ на портале esf.gov.kz скачана.</p>
        <p className="text-sm text-gray-500 mb-6">
          Откройте портал esf.gov.kz и перенесите данные из PDF в соответствующие поля.
          Номера полей в PDF совпадают с порталом.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { setDone(false); setSelectedAvrId(""); }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Создать ещё
          </button>
          <a href="/dashboard/documents" className="px-6 py-2 border rounded-lg hover:bg-gray-50">
            К документам
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">Создать ЭСФ</h1>
      <p className="text-sm text-gray-500 mb-6">
        Выберите АВР — система сформирует PDF-шпаргалку со всеми данными для заполнения ЭСФ на портале esf.gov.kz
      </p>

      <form onSubmit={handleGenerate} className="space-y-5">
        {/* AVR selection */}
        <div>
          <label className="block text-sm font-medium mb-1">АВР-основание *</label>
          {avrList.length === 0 ? (
            <div className="border border-dashed rounded-lg p-4 text-center text-sm text-gray-500">
              Нет созданных АВР.{" "}
              <a href="/dashboard/documents/new" className="text-blue-600 underline">Создайте АВР</a> сначала.
            </div>
          ) : (
            <select
              value={selectedAvrId}
              onChange={(e) => setSelectedAvrId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            >
              <option value="">Выберите АВР</option>
              {avrList.map((avr) => (
                <option key={avr.id} value={avr.id}>
                  АВР №{avr.number} — {avr.client.name} — {Number(avr.total).toLocaleString("ru-KZ")} ₸ ({new Date(avr.date).toLocaleDateString("ru-KZ")})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Turnover date */}
        <div>
          <label className="block text-sm font-medium mb-1">Дата совершения оборота</label>
          <input
            type="date"
            value={turnoverDate}
            onChange={(e) => setTurnoverDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Обычно совпадает с датой АВР</p>
        </div>

        {/* Preview of selected AVR */}
        {selectedAvr && (
          <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
            <p className="text-sm font-medium text-gray-700">Данные из АВР:</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-gray-600">Поставщик (вы)</p>
                <p>{profile.fullName}</p>
                <p className="text-gray-500">ИИН: {profile.iin}</p>
                {profile.address && <p className="text-gray-500">{profile.address}</p>}
                {profile.bankName && <p className="text-gray-500">{profile.bankName}</p>}
                {profile.iban && <p className="text-gray-500">ИИК: {profile.iban}</p>}
                {profile.bik && <p className="text-gray-500">БИК: {profile.bik}</p>}
                {profile.kbe && <p className="text-gray-500">КБе: {profile.kbe}</p>}
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-gray-600">Получатель</p>
                <p>{selectedAvr.client.name}</p>
                <p className="text-gray-500">БИН: {selectedAvr.client.bin}</p>
              </div>
            </div>
            <div className="border-t pt-2 text-xs space-y-1">
              <p><span className="text-gray-500">Услуга:</span> {selectedAvr.serviceName}</p>
              <p><span className="text-gray-500">Сумма:</span> <span className="font-semibold">{Number(selectedAvr.total).toLocaleString("ru-KZ")} ₸</span></p>
              {selectedAvr.contractNumber && (
                <p><span className="text-gray-500">Договор:</span> {selectedAvr.contractNumber}</p>
              )}
            </div>
          </div>
        )}

        {!profile.iin && (
          <p className="text-sm text-red-500">
            Заполните ИИН в <a href="/dashboard/profile" className="underline">профиле</a>
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !profile.iin || !selectedAvrId}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700"
        >
          {loading ? "Генерация PDF..." : "Скачать ЭСФ-шпаргалку (PDF)"}
        </button>

        <p className="text-xs text-gray-400 text-center">
          PDF будет содержать все разделы A-G с номерами полей как на портале esf.gov.kz
        </p>
      </form>
    </div>
  );
}
