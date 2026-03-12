import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [clientCount, docCount] = await Promise.all([
    prisma.client.count({ where: { userId: user.id } }),
    prisma.document.count({ where: { userId: user.id } }),
  ]);

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

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-3xl font-bold text-blue-600">{docCount}</p>
          <p className="text-sm text-gray-500 mt-1">Документов создано</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-3xl font-bold text-green-600">{clientCount}</p>
          <p className="text-sm text-gray-500 mt-1">Клиентов</p>
        </div>
        <Link href="/dashboard/documents/new" className="bg-blue-600 hover:bg-blue-700 rounded-2xl p-5 text-white transition cursor-pointer">
          <p className="text-2xl font-bold">+</p>
          <p className="text-sm font-medium mt-1">Создать счет</p>
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
