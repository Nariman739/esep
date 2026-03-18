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

type FilterType = "ALL" | "INVOICE" | "AVR" | "ESF";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then(setDocs)
      .finally(() => setLoading(false));
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function getPdfBlob(docId: string) {
    const res = await fetch(`/api/documents/${docId}/pdf`);
    if (!res.ok) throw new Error("Ошибка загрузки PDF");
    return await res.blob();
  }

  async function downloadPdf(doc: Doc) {
    setDownloading(doc.id);
    try {
      const blob = await getPdfBlob(doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const prefix = doc.type === "INVOICE" ? "schet" : doc.type === "ESF" ? "esf" : "avr";
      a.download = `${prefix}-${doc.number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Не удалось скачать PDF");
    } finally {
      setDownloading(null);
    }
  }

  async function previewPdf(doc: Doc) {
    setDownloading(doc.id);
    try {
      const blob = await getPdfBlob(doc.id);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewTitle(`${TYPE_LABEL[doc.type]} №${doc.number} — ${doc.client.name}`);
    } catch {
      toast.error("Не удалось загрузить PDF");
    } finally {
      setDownloading(null);
    }
  }

  function closePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewTitle("");
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
        <>
        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1.5">
            {(["ALL", "INVOICE", "AVR", "ESF"] as FilterType[]).map((f) => {
              const count = f === "ALL" ? docs.length : docs.filter(d => d.type === f).length;
              const label = f === "ALL" ? "Все" : TYPE_LABEL[f as Doc["type"]];
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по клиенту или услуге..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {docs.filter((doc) => {
            if (filter !== "ALL" && doc.type !== filter) return false;
            if (search) {
              const q = search.toLowerCase();
              return doc.client.name.toLowerCase().includes(q) || doc.serviceName.toLowerCase().includes(q);
            }
            return true;
          }).length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Ничего не найдено</div>
          ) : (
          <div className="divide-y divide-gray-100">
            {docs.filter((doc) => {
              if (filter !== "ALL" && doc.type !== filter) return false;
              if (search) {
                const q = search.toLowerCase();
                return doc.client.name.toLowerCase().includes(q) || doc.serviceName.toLowerCase().includes(q);
              }
              return true;
            }).map((doc) => (
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
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="font-semibold text-gray-900 text-sm">
                      {Number(doc.total).toLocaleString("ru-KZ")} тг
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(doc.date)}</p>
                  </div>
                  <button
                    onClick={() => previewPdf(doc)}
                    disabled={downloading === doc.id}
                    className="text-xs bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 font-medium px-3 py-2 rounded-lg transition"
                  >
                    {downloading === doc.id ? "..." : "Просмотр"}
                  </button>
                  <button
                    onClick={() => downloadPdf(doc)}
                    disabled={downloading === doc.id}
                    className="text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-medium px-3 py-2 rounded-lg transition"
                  >
                    Скачать
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
        </>
      )}

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{previewTitle}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  download={`${previewTitle}.pdf`}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg transition"
                >
                  Скачать
                </a>
                <button
                  onClick={closePreview}
                  className="text-gray-400 hover:text-gray-700 text-xl font-bold px-2 transition"
                >
                  ×
                </button>
              </div>
            </div>
            <iframe
              src={previewUrl}
              className="flex-1 w-full"
              title="PDF Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
