"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Activity,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  User as UserIcon,
  Users,
  Laptop,
  Menu,
  X,
} from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

type LayoutProps = {
  children: React.ReactNode;
  variant?: "public" | "dashboard";
};

export default function Layout({ children, variant = "public" }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { user, isAuthenticated, logout } = useAuthStore();
  const isDashboard = variant === "dashboard";
  const { t, lang, setLang } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const dashboardHref =
    user?.role === "admin"
      ? "/admin/devices"
      : user?.role === "super_admin"
        ? "/super-admin/dashboard"
        : "/candidate/dashboard";

  const sidebarItems =
    user?.role === "admin"
      ? ([
          { href: "/admin/devices", label: t("dashboard"), icon: Laptop },
          { href: "/admin/active-exams", label: t("activeExams"), icon: Activity },
          { href: "/admin/candidates", label: t("candidates"), icon: Users },
          { href: "#", label: t("settings"), icon: Settings },
        ] as const)
      : ([
          { href: "/candidate/dashboard", label: t("dashboard"), icon: LayoutDashboard },
          { href: "/candidate/exams", label: t("examHistory"), icon: History },
          { href: "/candidate/profile", label: t("profile"), icon: UserIcon },
          { href: "#", label: t("settings"), icon: Settings },
        ] as const);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile sidebar drawer */}
      {isDashboard && isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* drawer content */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl flex flex-col z-50 border-r border-slate-100">
            <div className="p-6 h-16 border-b border-slate-100 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-bold text-blue-900" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="text-2xl">🏛️</span>
                <span>ADLTS</span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center">🏛️</div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm truncate max-w-[140px]">
                      {user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "User"}
                    </div>
                    <div className="text-[11px] text-slate-400">{user?.role || "Role"}</div>
                  </div>
                </div>

                <nav className="space-y-1 text-sm">
                  {sidebarItems.map((item) => {
                    const isActive = item.href !== "#" && pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href + item.label}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={[
                          "flex items-center gap-3 py-2.5 px-3 rounded-xl transition",
                          isActive
                            ? "bg-blue-50 text-blue-900 font-bold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                          item.href === "#" ? "opacity-60 pointer-events-none" : "",
                        ].join(" ")}
                      >
                        <Icon size={18} className={isActive ? "text-blue-700" : "text-slate-400"} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="mt-6 flex w-full items-center gap-3 py-2.5 px-3 rounded-xl transition text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-t border-slate-100 pt-6"
              >
                <LogOut size={18} className="text-slate-400" />
                <span className="font-semibold text-red-600">{t("logout")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="w-full bg-white/90 backdrop-blur-sm border-b border-slate-100 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-blue-900">
            {isDashboard && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-blue-900 focus:outline-none"
                aria-label="Toggle menu"
              >
                <Menu size={22} />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <span className="hidden sm:inline">ADLTS</span>
            </Link>
          </div>

          {!isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
              <Link href="/" className="hover:text-blue-700">
                {t("home")}
              </Link>
              <Link href="/about" className="hover:text-blue-700">
                {t("about")}
              </Link>
              <Link href="/contact" className="hover:text-blue-700">
                {t("contact")}
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
              onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
              className="flex items-center gap-2 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-800 hover:bg-slate-50 transition text-xs md:text-sm font-semibold"
              aria-label="Toggle language"
            >
              {lang === 'en' ? 'አማ' : 'EN'}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-black">
                    {(user?.name || user?.first_name || user?.email || "U").charAt(0).toUpperCase()}
                  </span>
                  <div className="leading-tight">
                    <div className="text-xs font-bold text-slate-800">
                      {user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email}
                    </div>
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

              <nav className="space-y-1 text-sm">
                {sidebarItems.map((item) => {
                  const isActive = item.href !== "#" && pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "flex items-center gap-3 py-2.5 px-3 rounded-xl transition",
                        isActive
                          ? "bg-blue-50 text-blue-900 font-bold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                        item.href === "#" ? "opacity-60 pointer-events-none" : "",
                      ].join(" ")}
                    >
                      <Icon size={18} className={isActive ? "text-blue-700" : "text-slate-400"} aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="mt-3 flex w-full items-center gap-3 py-2.5 px-3 rounded-xl transition text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <LogOut size={18} className="text-slate-400" aria-hidden="true" />
                  <span className="font-semibold text-red-600">{t("logout")}</span>
                </button>
              </nav>
            </div>
          </aside>
        )}

        <main className="flex-1 min-w-0">
          <div className={`max-w-7xl mx-auto ${isDashboard ? "px-4 sm:px-6 py-6 md:py-8" : "px-4 sm:px-6 py-8 md:py-10"}`}>{children}</div>
        </main>
      </div>

      <footer className="bg-slate-50 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center">
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
