"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

interface Doc {
  id: string;
  type: "INVOICE" | "AVR" | "ESF";
  number: number;
  serviceName: string;
  total: string;
  date: string;
  createdAt: string;
  client: { name: string; bin: string };
}

const TYPE_LABEL: Record<Doc["type"], string> = {
  INVOICE: "Счет",
  AVR: "АВР",
  ESF: "ЭСФ",
};

const TYPE_COLOR: Record<Doc["type"], string> = {
  INVOICE: "bg-blue-100 text-blue-700",
  AVR: "bg-green-100 text-green-700",
  ESF: "bg-purple-100 text-purple-700",
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then(setDocs)
      .finally(() => setLoading(false));
  }, []);

  async function downloadPdf(doc: Doc) {
    if (doc.type === "ESF") {
      toast.error("Повторное скачивание ЭСФ недоступно");
      return;
    }
    setDownloading(doc.id);
    try {
      const res = await fetch(`/api/documents/${doc.id}/pdf`);
      if (!res.ok) throw new Error("Ошибка");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.type === "INVOICE" ? "schet" : "avr"}-${doc.number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Не удалось скачать PDF");
    } finally {
      setDownloading(null);
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ru-KZ", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мои документы</h1>
          <p className="text-gray-500 mt-1">Все созданные документы</p>
        </div>
        <Link
          href="/dashboard/documents/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition"
        >
          + Создать
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Загрузка...</div>
      ) : docs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-3">Документов пока нет</p>
          <Link href="/dashboard/documents/new" className="text-blue-600 hover:underline text-sm">
            Создать первый документ →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {docs.map((doc) => (
              <div key={doc.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg shrink-0 ${TYPE_COLOR[doc.type]}`}>
                    {TYPE_LABEL[doc.type]} №{doc.number}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{doc.client.name}</p>
                    <p className="text-xs text-gray-500 truncate">{doc.serviceName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="font-semibold text-gray-900 text-sm">
                      {Number(doc.total).toLocaleString("ru-KZ")} тг
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(doc.date)}</p>
                  </div>
                  {doc.type !== "ESF" && (
                    <button
                      onClick={() => downloadPdf(doc)}
                      disabled={downloading === doc.id}
                      className="text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-medium px-3 py-2 rounded-lg transition"
                    >
                      {downloading === doc.id ? "..." : "PDF"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
