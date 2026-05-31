"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BadgeCheck, Bell, Building2, CheckCheck, ChevronDown, GraduationCap, Landmark, LogOut, Menu, Shield, User, X } from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { logout as logoutService } from "@/services/auth.service";
import { useI18n } from "@/i18n/useI18n";
import {
  getNotificationsPage,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotificationChanges,
  type AppNotification,
} from "@/services/notification.service";
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

type PortalShellProps = {
  children: React.ReactNode;
  navItems: NavItem[];
  dashboardHref: string;
};

type AvatarConfig = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  wrapperClassName: string;
  iconClassName: string;
  label: string;
};

function getAvatarConfig(role?: string): AvatarConfig {
  switch (role) {
    case 'candidate':
      return {
        icon: User,
        wrapperClassName: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
        iconClassName: 'text-sky-700',
        label: 'Candidate avatar',
      };
    case 'institute':
      return {
        icon: Building2,
        wrapperClassName: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
        iconClassName: 'text-emerald-700',
        label: 'Institute avatar',
      };
    case 'expert':
      return {
        icon: GraduationCap,
        wrapperClassName: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200',
        iconClassName: 'text-violet-700',
        label: 'Expert avatar',
      };
    case 'admin':
      return {
        icon: Shield,
        wrapperClassName: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
        iconClassName: 'text-amber-700',
        label: 'Admin avatar',
      };
    case 'super_admin':
      return {
        icon: BadgeCheck,
        wrapperClassName: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
        iconClassName: 'text-rose-700',
        label: 'Super admin avatar',
      };
    case 'transport_authority':
      return {
        icon: Landmark,
        wrapperClassName: 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200',
        iconClassName: 'text-cyan-700',
        label: 'Transport authority avatar',
      };
    default:
      return {
        icon: User,
        wrapperClassName: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
        iconClassName: 'text-slate-700',
        label: 'User avatar',
      };
  }
}

export default function PortalShell({ children, navItems, dashboardHref }: PortalShellProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { user } = useAuthSession();
  const { t, lang, setLang } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notificationLoading, setNotificationLoading] = React.useState(false);
  const notificationPanelRef = React.useRef<HTMLDivElement | null>(null);
  const profileMenuRef = React.useRef<HTMLDivElement | null>(null);
  const hideTopDashboardLink = dashboardHref === PORTAL_DASHBOARD_HREF.candidate;

  const handleLogout = async () => {
    await logoutService();
    router.push("/");
  };

  const avatarConfig = getAvatarConfig(user?.role);
  const AvatarIcon = avatarConfig.icon;

  const displayName =
    user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email || "User";

  const loadNotifications = React.useCallback(async () => {
    setNotificationLoading(true);
    try {
      const result = await getNotificationsPage({ page: 1, pageSize: 5 });
      setNotifications(result.items);
      setUnreadCount(result.unreadCount);
    } finally {
      setNotificationLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    void loadNotifications();
    const unsubscribe = subscribeToNotificationChanges(() => {
      void loadNotifications();
    });

    return unsubscribe;
  }, [loadNotifications, user]);

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleMarkNotificationRead = async (id: string) => {
    const updated = await markNotificationAsRead(id);
    if (updated) {
      setNotifications((current) => current.map((item) => (item.id === id ? updated : item)));
      setUnreadCount((current) => Math.max(0, current - 1));
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
  };

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
                  href={user?.role ? `/${user.role.replace('_', '-')}/profile` : "#"}
                  className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition -ml-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${avatarConfig.wrapperClassName}`} aria-label={avatarConfig.label}>
                    <AvatarIcon size={18} className={avatarConfig.iconClassName} />
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
            <div className="relative" ref={notificationPanelRef}>
              <button
                onClick={() => setIsNotificationsOpen((current) => !current)}
                className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                aria-label={t('notifications')}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 w-88 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t('notifications')}</p>
                      <p className="text-xs text-slate-500">{unreadCount} unread</p>
                    </div>
                    <button
                      onClick={() => void handleMarkAllRead()}
                      disabled={unreadCount === 0}
                      className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-40"
                    >
                      <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                      {t('markAllAsRead')}
                    </button>
                  </div>

                  <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
                    {notificationLoading ? (
                      <div className="p-4 text-sm text-slate-500">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">{t('notificationsEmpty')}</div>
                    ) : (
                      notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 ${notification.read ? 'bg-white' : 'bg-blue-50/40'}`}>
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.read ? 'bg-slate-300' : 'bg-blue-600'}`} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-bold text-slate-900">{notification.title}</p>
                                  <p className="mt-1 text-xs leading-5 text-slate-600">{notification.message}</p>
                                  <p className="mt-1 text-[11px] text-slate-400">
                                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(notification.createdAt))}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <button
                                    onClick={() => void handleMarkNotificationRead(notification.id)}
                                    className="inline-flex shrink-0 items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50"
                                  >
                                    {t('markAsRead')}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                    <Link
                      href={user?.role ? `/${user.role.replace('_', '-')}/notifications` : '#'}
                      onClick={() => setIsNotificationsOpen(false)}
                      className="inline-flex items-center text-sm font-semibold text-blue-700 hover:text-blue-900"
                    >
                      {t('notifications')} {user?.role ? 'page' : ''}
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setLang(lang === "en" ? "am" : "en")}
              className="flex items-center gap-2 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-800 hover:bg-slate-50 transition text-xs md:text-sm font-semibold"
              aria-label="Toggle language"
            >
              {lang === "en" ? "አማ" : "EN"}
            </button>
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((current) => !current)}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full ${avatarConfig.wrapperClassName}`} aria-hidden="true">
                    <AvatarIcon size={18} className={avatarConfig.iconClassName} />
                  </span>
                  <div className="leading-tight text-left">
                    <div className="text-xs font-bold text-slate-800">{displayName}</div>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <Link
                      href={user?.role ? `/${user.role.replace('_', '-')}/profile` : "#"}
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <User size={16} className="text-slate-400" />
                      {t("profile")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      <LogOut size={16} className="text-rose-500" />
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="sm:hidden flex items-center gap-2 rounded-full bg-blue-900 px-4 py-2 text-white transition hover:bg-blue-800"
              >
                <LogOut size={16} /> <span className="hidden sm:inline">{t("logout")}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 bg-[#F8FAFC]">
        <aside className="w-64 bg-white border-r border-slate-100 hidden lg:block sticky top-16 h-[calc(100vh-4rem)]">
          <div className="p-6">
            <Link 
              href={user?.role ? `/${user.role.replace('_', '-')}/profile` : "#"}
              className="mb-6 flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50 -ml-2"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${avatarConfig.wrapperClassName}`} aria-hidden="true">
                <AvatarIcon size={18} className={avatarConfig.iconClassName} />
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
