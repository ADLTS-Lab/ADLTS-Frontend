"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { logout as logoutService } from "@/services/auth.service";
import { useI18n } from "@/i18n/useI18n";
import { ui } from "@/app/components/ui/design-tokens";
import { BrandMark } from "./BrandMark";
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
import UserMenu from "./UserMenu";

type PortalShellProps = {
  children: React.ReactNode;
  navItems: NavItem[];
  dashboardHref: string;
};

function initialsFor(displayName: string) {
  const tokens = displayName.trim().split(/\s+/).filter(Boolean);
  const head = tokens[0]?.charAt(0) ?? "U";
  const tail = tokens.length > 1 ? tokens[tokens.length - 1].charAt(0) : null;
  return tail ? `${head}${tail}` : head;
}

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

  const renderNavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={mobile ? "space-y-1.5" : "space-y-1.5 px-1"} aria-label="Portal navigation">
      {navItems.map((item) => {
        const isActive = !item.disabled && item.href !== "#" && pathname.startsWith(item.href);
        const Icon = item.icon;
        const navClass = `group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${
          isActive
            ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
        } ${item.disabled ? "pointer-events-none opacity-55" : ""}`;

        return (
          <Link
            key={`${item.href}-${item.labelKey}`}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            role="menuitem"
            onClick={() => {
              if (mobile) {
                setIsMobileMenuOpen(false);
              }
            }}
            className={navClass}
          >
            {isActive ? (
              <span className="absolute left-0 top-0 h-full w-1 rounded-r-[4px] bg-[var(--accent)]" />
            ) : null}
            <Icon size={18} className={isActive ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"} />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => {
          setIsMobileMenuOpen(false);
          handleLogout();
        }}
        className="mt-3 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
      >
        <LogOut size={18} className="text-[var(--danger)]" />
        <span className="font-medium text-[var(--danger)]">{t("logout")}</span>
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      {isMobileMenuOpen ? (
        <>
          <div
            className="fixed inset-0 z-50 bg-[var(--overlay)] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-80 border-r border-[var(--border)] bg-[var(--surface)] lg:hidden">
            <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4">
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <BrandMark />
                <span className="font-semibold">ADLTS</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--text-secondary)]"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 px-3 py-4">
              <Link
                href={profileHref}
                onClick={() => setIsMobileMenuOpen(false)}
                className="mb-2 flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-2 transition-colors hover:bg-[var(--surface)]"
              >
                <div className="grid h-9 w-9 place-items-center rounded-[50%] bg-[var(--accent)] text-xs font-bold text-[var(--surface)]">
                  {initialsFor(displayName)}
                </div>
                <span className="max-w-52 truncate text-sm font-medium text-[var(--text-primary)]">{displayName}</span>
              </Link>
              {renderNavItems({ mobile: true })}
            </div>
          </div>
        </>
      ) : null}

      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className={`${ui.shellPanel} h-16 items-center justify-between`}>
          <div className="flex items-center gap-3 text-[var(--text-primary)]">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-secondary)]"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <Link href="/" className="inline-flex items-center gap-2">
              <BrandMark />
              <span className="hidden md:inline text-sm font-semibold">ADLTS</span>
            </Link>
            {!hideTopDashboardLink ? (
              <Link
                href={dashboardHref}
                className="ml-3 hidden text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)] md:inline-flex"
              >
                {t("dashboard")}
              </Link>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "am" : "en")}
              className="inline-flex h-9 items-center rounded-md border border-[var(--border)] px-2.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
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

      <div className="flex flex-1">
        <aside className="hidden w-[248px] border-r border-[var(--border)] bg-[var(--surface)] lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-5 py-4">
              <Link
                href={profileHref}
                className="mb-5 flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-2 transition-colors hover:bg-[var(--surface)]"
              >
                <div className="grid h-10 w-10 place-items-center rounded-[50%] bg-[var(--accent)] text-sm font-semibold text-[var(--surface)]">
                  {initialsFor(displayName)}
                </div>
                <span className="max-w-52 truncate text-sm font-medium text-[var(--text-primary)]">{displayName}</span>
              </Link>
              {renderNavItems({ mobile: false })}
            </div>
          </div>
        </aside>

        <main id="portal-main" className="flex-1 min-w-0">
          <div className="p-6">{children}</div>
        </main>
      </div>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className={`${ui.shellPanel} py-5 text-xs text-[var(--text-secondary)]`}>
          <p className="text-center text-[0.75rem] md:text-left">© {new Date().getFullYear()} ADLTS Ethiopia.</p>
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
