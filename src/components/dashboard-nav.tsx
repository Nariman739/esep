"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./logout-button";

const LINKS = [
  { href: "/dashboard", label: "Главная" },
  { href: "/dashboard/clients", label: "Клиенты" },
  { href: "/dashboard/documents", label: "Документы" },
  { href: "/dashboard/documents/new", label: "Создать" },
  { href: "/dashboard/documents/esf", label: "ЭСФ" },
  { href: "/dashboard/documents/eavr", label: "Эл. АВР" },
  { href: "/dashboard/helper", label: "Помощник" },
  { href: "/dashboard/profile", label: "Мои реквизиты" },
];

export default function DashboardNav({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">Esep</Link>
          {/* Desktop nav */}
          <div className="hidden lg:flex gap-4 text-sm">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`font-medium transition ${
                  pathname === l.href ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">{userName}</span>
          <LogoutButton />
          {/* Burger button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition"
            aria-label="Меню"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </>
              ) : (
                <>
                  <line x1="3" y1="5" x2="17" y2="5" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="15" x2="17" y2="15" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden mt-3 pb-2 border-t border-gray-100 pt-3">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  pathname === l.href
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
