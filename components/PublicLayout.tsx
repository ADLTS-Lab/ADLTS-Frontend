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

  const dashboardHref = getHomeRouteForRole(user?.role);

  const displayName =
    user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="z-40 w-full border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold text-blue-900">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl leading-none">🏛️</span>
              <span className="hidden sm:inline">ADLTS</span>
            </Link>
          </div>

          {!showAuthed ? (
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/"
                className="rounded-md px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-900"
              >
                {t("home")}
              </Link>
              <Link
                href="/guidelines"
                className="rounded-md px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-900"
              >
                {t("guidelines")}
              </Link>
              <Link
                href="/about"
                className="rounded-md px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-blue-900"
              >
                {t("aboutUs")}
              </Link>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-blue-900 transition-colors hover:bg-slate-50"
              >
                {t("login")}
              </Link>
            </nav>
          ) : (
            <div className="hidden items-center md:flex">
              <Link
                href={dashboardHref}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-blue-900 transition-colors hover:bg-slate-50"
              >
                {t("dashboard")}
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setLang(lang === "en" ? "am" : "en")}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:text-sm"
              aria-label="Toggle language"
            >
              {lang === "en" ? "አማ" : "EN"}
            </button>
            {showAuthed ? (
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 sm:flex">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-900 text-xs font-semibold text-white">
                    {(displayName || "U").charAt(0).toUpperCase()}
                  </span>
                  <div className="leading-tight">
                    <div className="text-xs font-medium text-slate-800">{displayName}</div>
                    <div className="text-[10px] capitalize text-slate-500">{user?.role?.replace("_", " ") || "user"}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">{t("logout")}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-blue-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col bg-white">
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">{children}</div>
        </main>
      </div>

      <footer className="mt-auto border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
          <div>© 2024 ADLTS Ethiopia. All rights reserved.</div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            <Link href="/about" className="transition-colors hover:text-blue-800">
              {t("about")}
            </Link>
            <Link href="/contact" className="transition-colors hover:text-blue-800">
              {t("contact")}
            </Link>
            <Link href="/privacy-policy" className="transition-colors hover:text-blue-800">
              {t("privacy")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
