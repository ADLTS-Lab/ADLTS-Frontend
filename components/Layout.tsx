"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { LogOut } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

type LayoutProps = {
  children: React.ReactNode;
  variant?: "public" | "dashboard";
};

export default function Layout({ children, variant = "public" }: LayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const isDashboard = variant === "dashboard";
  const { t, lang, setLang } = useI18n();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-white/90 backdrop-blur-sm border-b border-slate-100 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-blue-900">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <span className="hidden sm:inline">ADLTS</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <Link href="/" className="hover:text-blue-700">{t('home')}</Link>
            <Link href="/about" className="hover:text-blue-700">{t('about')}</Link>
            <Link href="/contact" className="hover:text-blue-700">{t('contact')}</Link>
            <Link href="/login" className="hover:text-blue-700">{t('login')}</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
              className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg"
              aria-label="Toggle language"
            >
              {lang === 'en' ? 'EN' : 'አማ'}
            </button>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg">
                <LogOut size={16} /> <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            ) : (
              <Link href="/login" className="bg-blue-900 text-white px-4 py-2 rounded-lg">{t('login')}</Link>
            )}
          </div>
        </div>
      </header>

      <div className={`flex flex-1 ${isDashboard ? "bg-[#F8FAFC]" : "bg-white"}`}>
        {isDashboard && (
          <aside className="w-64 bg-white border-r border-slate-100 hidden lg:block sticky top-16 h-[calc(100vh-4rem)]">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center">🏛️</div>
                <div>
                  <div className="font-bold text-slate-800">{user?.name || "User"}</div>
                  <div className="text-[11px] text-slate-400">{user?.role || "Role"}</div>
                </div>
              </div>

              <nav className="space-y-2 text-sm">
                <Link href={user?.role === "admin" ? "/admin/devices" : "/candidate/dashboard"} className="block py-2 px-3 rounded-lg hover:bg-slate-50 font-bold">{t('dashboard')}</Link>
                {user?.role === "admin" ? (
                  <>
                    <Link href="/admin/active-exams" className="block py-2 px-3 rounded-lg hover:bg-slate-50">{t('activeExams')}</Link>
                    <Link href="/admin/candidates" className="block py-2 px-3 rounded-lg hover:bg-slate-50">{t('candidates')}</Link>
                  </>
                ) : (
                  <Link href="/candidate/exams" className="block py-2 px-3 rounded-lg hover:bg-slate-50">{t('examHistory')}</Link>
                )}
                <Link href="#" className="block py-2 px-3 rounded-lg hover:bg-slate-50">{t('profile')}</Link>
                <Link href="#" className="block py-2 px-3 rounded-lg hover:bg-slate-50">{t('settings')}</Link>
                <button onClick={handleLogout} className="block w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-red-600">{t('logout')}</button>
              </nav>
            </div>
          </aside>
        )}

        <main className="flex-1">
          <div className={`max-w-7xl mx-auto ${isDashboard ? "px-6 py-8" : "px-6 py-10"}`}>{children}</div>
        </main>
      </div>

      <footer className="bg-slate-50 border-t mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
          <div>© 2024 ADLTS Ethiopia. All rights reserved.</div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/about" className="hover:text-blue-700">{t('about')}</Link>
            <Link href="/contact" className="hover:text-blue-700">{t('contact')}</Link>
            <Link href="/privacy-policy" className="hover:text-blue-700">{t('privacy')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
