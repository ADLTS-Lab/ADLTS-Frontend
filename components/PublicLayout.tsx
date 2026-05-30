"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { logout as logoutService } from "@/services/auth.service";
import { useI18n } from "@/i18n/useI18n";
import { getHomeRouteForRole } from "@/config/routes";

type PublicLayoutProps = {
  children: React.ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthSession();
  const { t, lang, setLang } = useI18n();

  const handleLogout = async () => {
    await logoutService();
    router.push("/");
  };

  const showAuthed = hasHydrated && isAuthenticated && !!user;

  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7485/ingest/750002e8-fc34-4f4c-aec9-03b23cf457b3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'30f368'},body:JSON.stringify({sessionId:'30f368',location:'components/PublicLayout.tsx',message:'header auth state',data:{showAuthed,hasHydrated,isAuthenticated,hasUser:!!user},timestamp:Date.now(),hypothesisId:'E',runId:'post-fix'})}).catch(()=>{});
  }, [showAuthed, hasHydrated, isAuthenticated, user]);
  // #endregion

  const dashboardHref = getHomeRouteForRole(user?.role);

  const displayName =
    user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full bg-white/90 backdrop-blur-sm border-b border-slate-100 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-blue-900">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <span className="hidden sm:inline">ADLTS</span>
            </Link>
          </div>

          {!showAuthed ? (
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
              <Link href="/" className="hover:text-blue-700">
                {t("home")}
              </Link>
              <Link href="/guidelines" className="hover:text-blue-700">
                {t("guidelines")}
              </Link>
              <Link href="/about" className="hover:text-blue-700">
                {t("aboutUs")}
              </Link>
              <Link href="/login" className="hover:text-blue-700 font-semibold">
                {t("login")}
              </Link>
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
              <Link href={dashboardHref} className="hover:text-blue-700 font-semibold">
                {t("dashboard")}
              </Link>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(lang === "en" ? "am" : "en")}
              className="flex items-center gap-2 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-800 hover:bg-slate-50 transition text-xs md:text-sm font-semibold"
              aria-label="Toggle language"
            >
              {lang === "en" ? "አማ" : "EN"}
            </button>
            {showAuthed ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-black">
                    {(displayName || "U").charAt(0).toUpperCase()}
                  </span>
                  <div className="leading-tight">
                    <div className="text-xs font-bold text-slate-800">{displayName}</div>
                    <div className="text-[10px] text-slate-500">{user?.role || "user"}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
                >
                  <LogOut size={16} /> <span className="hidden sm:inline">{t("logout")}</span>
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 bg-white">
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">{children}</div>
        </main>
      </div>

      <footer className="bg-slate-50 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
          <div>© 2024 ADLTS Ethiopia. All rights reserved.</div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/about" className="hover:text-blue-700">
              {t("about")}
            </Link>
            <Link href="/contact" className="hover:text-blue-700">
              {t("contact")}
            </Link>
            <Link href="/privacy-policy" className="hover:text-blue-700">
              {t("privacy")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
