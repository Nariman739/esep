import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import LogoutButton from "@/components/logout-button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">Esep</Link>
            <div className="flex gap-4 text-sm">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">Главная</Link>
              <Link href="/dashboard/clients" className="text-gray-600 hover:text-gray-900 font-medium">Клиенты</Link>
              <Link href="/dashboard/documents/new" className="text-gray-600 hover:text-gray-900 font-medium">Создать документ</Link>
              <Link href="/dashboard/documents/esf" className="text-gray-600 hover:text-gray-900 font-medium">ЭСФ</Link>
              <Link href="/dashboard/profile" className="text-gray-600 hover:text-gray-900 font-medium">Мои реквизиты</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user.fullName || user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
