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

  const footerSections = [
    {
      heading: t("public_footer_candidates"),
      links: [
        { label: t("public_footer_register"), href: "/candidate/register" },
        { label: t("public_footer_book_test"), href: "/candidate/booking" },
        { label: t("public_footer_view_results"), href: "/candidate/exams" },
        { label: t("public_footer_candidate_guidelines"), href: "/guidelines" },
      ],
    },
    {
      heading: t("public_footer_staff_access"),
      links: [
        { label: t("public_footer_staff_login"), href: "/login" },
        { label: t("public_footer_institution_support"), href: "/contact" },
        { label: t("public_footer_access_help"), href: "/contact" },
        { label: t("public_footer_candidate_guidelines"), href: "/guidelines" },
      ],
    },
    {
      heading: t("public_footer_support"),
      links: [
        { label: t("public_footer_booking_help"), href: "/contact" },
        { label: t("public_footer_payment_help"), href: "/contact" },
        { label: t("public_footer_result_help"), href: "/contact" },
        { label: t("public_footer_contact_support"), href: "/contact" },
      ],
    },
    {
      heading: t("public_footer_resources"),
      links: [
        { label: t("public_footer_about_adlts"), href: "/about" },
        { label: t("guidelines"), href: "/guidelines" },
        { label: t("public_footer_privacy_security"), href: "/privacy-policy" },
        { label: t("public_footer_contact_support"), href: "/contact" },
      ],
    },
  ];

  const legalLinks = [
    { label: t("privacy"), href: "/privacy-policy" },
    { label: t("public_footer_terms"), href: "/terms" },
    { label: t("public_footer_api_docs"), href: "/docs" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <a href="#main-content" className="skip-link text-sm font-medium text-[var(--text-primary)]">
        {t("public_skip")}
      </a>

      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-16 w-full max-w-container-public items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-secondary)]"
              aria-label={t("public_open_menu")}
            >
              <Menu size={20} />
            </button>
            <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-primary)]">
              <BrandMark label="ADLTS" variant="wordmark" />
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
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--accent)]"
                }`}
              >
                {t(item.labelKey)}
              </Link>
            ))}
            {showAuthed ? (
              <Link
                href={dashboardHref}
                className="font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
              >
                {t("dashboard")}
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "en" ? "am" : "en")}
              className="inline-flex h-9 items-center rounded-md border border-[var(--border)] px-2.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              aria-label={t("selectLanguage")}
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
                className="inline-flex h-9 items-center rounded-md bg-[var(--accent)] px-3 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--accent-hover)]"
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
            className="fixed inset-0 z-50 bg-[var(--overlay)]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed left-0 right-0 top-16 z-50 border-t border-[var(--border)] bg-[var(--surface)]">
            <div className="mx-auto flex w-full max-w-[75rem] flex-col p-4">
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{t("public_menu")}</span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-md p-2 text-[var(--text-secondary)]"
                  aria-label={t("public_close_menu")}
                >
                  <X size={18} />
                </button>
              </div>
            <div className="border-t border-[var(--border)] pt-3">
                {publicNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={`block rounded-md px-2.5 py-2 text-sm transition-colors ${
                      pathname === item.href
                        ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    {t(item.labelKey)}
                  </Link>
                ))}
                {showAuthed ? (
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mt-1 block rounded-md bg-[var(--accent-subtle)] px-2.5 py-2 text-sm font-medium text-[var(--accent)]"
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
        {children}
      </main>

      <footer className="mt-auto bg-[var(--text-primary)] text-[var(--surface)]">
        <div className="mx-auto w-full max-w-container-public px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1fr_1fr_1fr_1fr]">
            <div>
              <BrandMark variant="wordmark" showSubtitle inverse />
              <p className="mt-4 max-w-[15rem] text-sm leading-6 text-[var(--text-tertiary)]">
                {t("public_footer_description")}
              </p>
            </div>

            {footerSections.map((section) => (
              <div key={section.heading}>
                <div className="text-[12px] font-semibold text-[var(--surface)]">
                  {section.heading}
                </div>
                <ul className="mt-4 flex list-none flex-col gap-3 p-0 text-sm">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-[var(--text-tertiary)] transition-colors hover:text-[var(--surface)]">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-[var(--neutral)] pt-6 md:flex-row md:items-center md:justify-between">
            <span className="font-mono text-[11px] text-[var(--text-tertiary)]">
              © {new Date().getFullYear()} {t("public_footer_copyright")}
            </span>
            <div className="flex flex-wrap gap-5 text-xs text-[var(--text-tertiary)]">
              {legalLinks.map((link) => (
                <Link key={link.label} href={link.href} className="transition-colors hover:text-[var(--surface)]">
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
