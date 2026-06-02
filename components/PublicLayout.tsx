"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { logout as logoutService } from "@/services/auth.service";
import { useI18n } from "@/i18n/useI18n";
import { usePathname } from "next/navigation";
import { getHomeRouteForRole } from "@/config/routes";
import { ui } from "@/app/components/ui/design-tokens";
import UserMenu from "@/components/UserMenu";
import { BrandMark } from "./BrandMark";

type PublicLayoutProps = {
  children: React.ReactNode;
};

const publicNav = [
  { href: "/", labelKey: "home" },
  { href: "/guidelines", labelKey: "guidelines" },
  { href: "/about", labelKey: "aboutUs" },
  { href: "/contact", labelKey: "contact" },
];

export default function PublicLayout({ children }: PublicLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthSession();
  const { t, lang, setLang } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutService();
    router.push("/");
  };

  const showAuthed = hasHydrated && isAuthenticated && !!user;

  const dashboardHref = getHomeRouteForRole(user?.role);
  const rolePrefix = user?.role ? `/${user.role.replace("_", "-")}` : "";
  const profileHref = `${rolePrefix}/profile`;
  const settingsHref = `${rolePrefix}/settings`;

  const displayName =
    user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--adlts-page)]">
      <a href="#main-content" className="skip-link text-sm font-medium text-[var(--adlts-ink-900)]">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-[var(--adlts-divider)] bg-[color:rgba(255,255,255,.92)] backdrop-blur">
        <div className={`${ui.shellPanelPublic} h-16 items-center justify-between`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--adlts-border)] text-[var(--adlts-ink-700)] lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <Link href="/" className="inline-flex items-center gap-2 text-[var(--adlts-ink-950)]">
              <BrandMark label="ADLTS" />
              <span className="hidden sm:inline text-base font-semibold tracking-tight">ADLTS</span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-sm" aria-label="Primary">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`font-medium transition-colors ${
                  pathname === item.href
                    ? "text-[var(--adlts-blue-700)]"
                    : "text-[var(--adlts-ink-700)] hover:text-[var(--adlts-blue-700)]"
                }`}
              >
                {t(item.labelKey)}
              </Link>
            ))}
            {showAuthed ? (
              <Link
                href={dashboardHref}
                className="font-semibold text-[var(--adlts-blue-700)] transition-colors hover:text-[var(--adlts-blue-800)]"
              >
                {t("dashboard")}
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "en" ? "am" : "en")}
              className="inline-flex h-9 items-center rounded-md border border-[var(--adlts-border)] px-2.5 text-xs font-semibold text-[var(--adlts-ink-700)] transition-colors hover:border-[var(--adlts-blue-600)] hover:text-[var(--adlts-blue-700)]"
              aria-label="Toggle language"
            >
              {lang === "en" ? "አማ" : "EN"}
            </button>
            {showAuthed ? (
              <UserMenu
                displayName={displayName || "User"}
                profileHref={profileHref}
                settingsHref={settingsHref}
                onSignOut={handleLogout}
              />
            ) : (
              <Link
                href="/login"
                className="inline-flex h-9 items-center rounded-md bg-[var(--adlts-blue-600)] px-3 text-sm font-medium text-white transition-colors hover:bg-[var(--adlts-blue-700)]"
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <>
          <div
            className="fixed inset-0 z-50 bg-[var(--adlts-navy-950)]/40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 right-0 top-16 z-50 border-t border-[var(--adlts-border)] bg-[var(--adlts-surface)]">
            <div className="mx-auto flex w-full max-w-[75rem] flex-col p-4">
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm font-semibold text-[var(--adlts-ink-950)]">{t("menu") || "Menu"}</span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-md p-2 text-[var(--adlts-ink-700)]"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>
            <div className="border-t border-[var(--adlts-divider)] pt-3">
                {publicNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={`block rounded-md px-2.5 py-2 text-sm transition-colors ${
                      pathname === item.href
                        ? "bg-[var(--adlts-blue-50)] text-[var(--adlts-blue-700)]"
                        : "text-[var(--adlts-ink-700)] hover:bg-[var(--adlts-surface-soft)]"
                    }`}
                  >
                    {t(item.labelKey)}
                  </Link>
                ))}
                {showAuthed ? (
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mt-1 block rounded-md bg-[var(--adlts-blue-50)] px-2.5 py-2 text-sm font-medium text-[var(--adlts-blue-700)]"
                  >
                    {t("dashboard")}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : null}

      <main id="main-content" className="flex-1">
        <div className={`${ui.shellPanelPublic} py-8 md:py-10`}>{children}</div>
      </main>

      <footer className="mt-auto bg-[var(--adlts-navy-900)] text-white">
        <div className="mx-auto w-full max-w-container-public px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1fr_1fr_1fr]">
            <div>
              <div className="font-mono text-sm font-bold tracking-[0.16em] text-white">ADLTS</div>
              <p className="mt-3 max-w-[15rem] text-sm leading-6 text-white/45">
                Automated Driving License Testing System. Official digital platform for Ethiopia's transport testing operations.
              </p>
            </div>

            {[
              {
                heading: "Candidates",
                links: [
                  { label: "Register", href: "/candidate/register" },
                  { label: "Book a test", href: "/candidate/booking" },
                  { label: "View results", href: "/candidate/exams" },
                  { label: "Submit appeal", href: "/candidate/dashboard" },
                ],
              },
              {
                heading: "Institutions",
                links: [
                  { label: "Institute login", href: "/login" },
                  { label: "Admin login", href: "/login" },
                  { label: "Request access", href: "/contact" },
                  { label: "Guidelines", href: "/guidelines" },
                ],
              },
              {
                heading: "Resources",
                links: [
                  { label: "About ADLTS", href: "/about" },
                  { label: "Privacy policy", href: "/privacy-policy" },
                  { label: "Terms of service", href: "/terms" },
                  { label: "Contact support", href: "/contact" },
                ],
              },
            ].map((section) => (
              <div key={section.heading}>
                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-white/35">
                  {section.heading}
                </div>
                <ul className="mt-4 flex list-none flex-col gap-3 p-0 text-sm">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-white/50 transition-colors hover:text-white/85">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
            <span className="font-mono text-[11px] tracking-[0.08em] text-white/30">
              © {new Date().getFullYear()} ADLTS Core Engine — Automated Driving License Testing System
            </span>
            <div className="flex flex-wrap gap-5 text-xs text-white/35">
              {[
                { label: "Privacy", href: "/privacy-policy" },
                { label: "Terms", href: "/terms" },
                { label: "API Docs", href: "/docs" },
              ].map((link) => (
                <Link key={link.label} href={link.href} className="transition-colors hover:text-white/75">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
