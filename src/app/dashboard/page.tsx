import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [clientCount, docCount, monthDocs] = await Promise.all([
    prisma.client.count({ where: { userId: user.id } }),
    prisma.document.count({ where: { userId: user.id } }),
    prisma.document.findMany({
      where: { userId: user.id, date: { gte: monthStart } },
      select: { total: true },
    }),
  ]);

  const monthSum = monthDocs.reduce((sum, d) => sum + Number(d.total), 0);

  const recentDocs = await prisma.document.findMany({
    where: { userId: user.id },
    include: { client: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const needsProfile = !user.isProfileComplete;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Привет, {user.fullName?.split(" ")[0] || "друг"} 👋
        </h1>
        <p className="text-gray-500 mt-1">Создавайте счета и документы за 30 секунд</p>
      </div>

      {needsProfile && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-800">Заполните свои реквизиты</p>
            <p className="text-sm text-amber-600 mt-0.5">Нужно один раз — потом в каждом документе автоматически</p>
          </div>
          <Link href="/dashboard/profile" className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
            Заполнить →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-3xl font-bold text-blue-600">{docCount}</p>
          <p className="text-sm text-gray-500 mt-1">Документов</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-3xl font-bold text-green-600">{clientCount}</p>
          <p className="text-sm text-gray-500 mt-1">Клиентов</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-2xl font-bold text-purple-600">{monthSum > 0 ? monthSum.toLocaleString("ru-KZ") : "0"}</p>
          <p className="text-sm text-gray-500 mt-1">тг за месяц</p>
        </div>
        <Link href="/dashboard/documents/new" className="bg-blue-600 hover:bg-blue-700 rounded-2xl p-5 text-white transition cursor-pointer">
          <p className="text-2xl font-bold">+</p>
          <p className="text-sm font-medium mt-1">Создать документ</p>
        </Link>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/dashboard/documents/esf" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition text-center">
          <p className="font-semibold text-gray-900 text-sm">ЭСФ</p>
          <p className="text-xs text-gray-500 mt-0.5">Шпаргалка</p>
        </Link>
        <Link href="/dashboard/documents/eavr" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition text-center">
          <p className="font-semibold text-gray-900 text-sm">Эл. АВР</p>
          <p className="text-xs text-gray-500 mt-0.5">Шпаргалка</p>
        </Link>
        <Link href="/dashboard/helper" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition text-center">
          <p className="font-semibold text-gray-900 text-sm">Помощник</p>
          <p className="text-xs text-gray-500 mt-0.5">Налоги и FAQ</p>
        </Link>
      </div>

      {recentDocs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Последние документы</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentDocs.map((doc) => (
              <div key={doc.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {doc.type === "AVR" ? "АВР" : doc.type === "ESF" ? "ЭСФ" : "Счет"} №{doc.number} — {doc.client.name}
                  </p>
                  <p className="text-xs text-gray-500">{doc.serviceName}</p>
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  {Number(doc.total).toLocaleString("ru-KZ")} тг
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
