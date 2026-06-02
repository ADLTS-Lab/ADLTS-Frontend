"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { logout as logoutService } from "@/services/auth.service";
import { useI18n } from "@/i18n/useI18n";
import {
  ADMIN_NAV,
  CANDIDATE_NAV,
  EXPERT_NAV,
  INSTITUTE_NAV,
  PORTAL_DASHBOARD_HREF,
  SUPER_ADMIN_NAV,
  TRANSPORT_AUTHORITY_NAV,
  type NavItem,
} from "@/config/navigation";
import UserMenu from "@/components/UserMenu";

type PortalShellProps = {
  children: React.ReactNode;
  navItems: NavItem[];
  dashboardHref: string;
};

export default function PortalShell({ children, navItems, dashboardHref }: PortalShellProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { user } = useAuthSession();
  const { t, lang, setLang } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const hideTopDashboardLink = dashboardHref === PORTAL_DASHBOARD_HREF.candidate;
  const rolePrefix = user?.role ? `/${user.role.replace("_", "-")}` : "";
  const profileHref = rolePrefix ? `${rolePrefix}/profile` : "#";
  const settingsHref = rolePrefix ? `${rolePrefix}/settings` : "#";

  const handleLogout = async () => {
    await logoutService();
    router.push("/");
  };

  const displayName =
    user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email || "User";

  return (
    <div className="min-h-screen flex flex-col">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl flex flex-col z-50 border-r border-slate-100">
            <div className="p-6 h-16 border-b border-slate-100 flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-blue-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
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
                <Link
                  href={profileHref}
                  className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition -ml-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center font-black">
                    {(user?.name || user?.first_name || user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm truncate max-w-35">{displayName}</div>
                  </div>
                </Link>
                <nav className="space-y-1 text-sm">
                  {navItems.map((item) => {
                    const isActive = !item.disabled && item.href !== "#" && pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href + item.labelKey}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={[
                          "flex items-center gap-3 py-2.5 px-3 rounded-xl transition",
                          isActive
                            ? "bg-blue-50 text-blue-900 font-bold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                          item.disabled ? "opacity-60 pointer-events-none" : "",
                        ].join(" ")}
                      >
                        <Icon size={18} className={isActive ? "text-blue-700" : "text-slate-400"} />
                        <span>{t(item.labelKey)}</span>
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
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-blue-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <span className="hidden sm:inline">ADLTS</span>
            </Link>
          </div>

          {!hideTopDashboardLink && (
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
            <UserMenu
              displayName={displayName}
              profileHref={profileHref}
              settingsHref={settingsHref}
              onSignOut={handleLogout}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 bg-[#F8FAFC]">
        <aside className="w-64 bg-white border-r border-slate-100 hidden lg:block sticky top-16 h-[calc(100vh-4rem)]">
          <div className="p-6">
            <Link
              href={profileHref}
              className="flex items-center gap-3 mb-6 hover:bg-slate-50 p-2 rounded-xl transition -ml-2"
            >
              <div className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center font-black">
                {(user?.name || user?.first_name || user?.email || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-slate-800">{displayName}</div>
              </div>
            </Link>
            <nav className="space-y-1 text-sm">
              {navItems.map((item) => {
                const isActive = !item.disabled && item.href !== "#" && pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href + item.labelKey}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "flex items-center gap-3 py-2.5 px-3 rounded-xl transition",
                      isActive
                        ? "bg-blue-50 text-blue-900 font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                      item.disabled ? "opacity-60 pointer-events-none" : "",
                    ].join(" ")}
                  >
                    <Icon
                      size={18}
                      className={isActive ? "text-blue-700" : "text-slate-400"}
                      aria-hidden="true"
                    />
                    <span>{t(item.labelKey)}</span>
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

        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">{children}</div>
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

export function CandidatePortalShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell navItems={CANDIDATE_NAV} dashboardHref={PORTAL_DASHBOARD_HREF.candidate}>
      {children}
    </PortalShell>
  );
}

export function AdminPortalShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell navItems={ADMIN_NAV} dashboardHref={PORTAL_DASHBOARD_HREF.admin}>
      {children}
    </PortalShell>
  );
}

export function SuperAdminPortalShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell navItems={SUPER_ADMIN_NAV} dashboardHref={PORTAL_DASHBOARD_HREF.super_admin}>
      {children}
    </PortalShell>
  );
}

export function ExpertPortalShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell navItems={EXPERT_NAV} dashboardHref={PORTAL_DASHBOARD_HREF.expert}>
      {children}
    </PortalShell>
  );
}

export function InstitutePortalShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell navItems={INSTITUTE_NAV} dashboardHref={PORTAL_DASHBOARD_HREF.institute}>
      {children}
    </PortalShell>
  );
}

export function TransportAuthorityPortalShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      navItems={TRANSPORT_AUTHORITY_NAV}
      dashboardHref={PORTAL_DASHBOARD_HREF.transport_authority}
    >
      {children}
    </PortalShell>
  );
}
