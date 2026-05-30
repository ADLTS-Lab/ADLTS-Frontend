import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Calendar,
  History,
  LayoutDashboard,
  Laptop,
  FileText,
  Mail,
  ScrollText,
  Settings,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { ROLE_HOME_ROUTE, type AppRole } from './routes';

export type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  disabled?: boolean;
};

/** Candidate portal sidebar — single source of truth */
export const CANDIDATE_NAV: NavItem[] = [
  { href: '/candidate/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/candidate/booking', labelKey: 'booking', icon: Calendar },
  { href: '/candidate/exams', labelKey: 'examHistory', icon: History },
  { href: '/candidate/profile', labelKey: 'profile', icon: UserIcon },
  { href: '/candidate/settings', labelKey: 'settings', icon: Settings },
];

/** Admin portal sidebar — single source of truth */
export const ADMIN_NAV: NavItem[] = [
  { href: '/admin/devices', labelKey: 'dashboard', icon: Laptop },
  { href: '/admin/active-exams', labelKey: 'activeExams', icon: Activity },
  { href: '/admin/candidates', labelKey: 'candidates', icon: Users },
  { href: '/admin/invitations', labelKey: 'invitations', icon: Mail },
  { href: '/admin/reports', labelKey: 'reports', icon: FileText },
  { href: '#', labelKey: 'settings', icon: Settings, disabled: true },
];

function minimalPortalNav(dashboardHref: string, profileHref: string): NavItem[] {
  return [
    { href: dashboardHref, labelKey: 'dashboard', icon: LayoutDashboard },
    { href: profileHref, labelKey: 'profile', icon: UserIcon },
    { href: '#', labelKey: 'settings', icon: Settings, disabled: true },
  ];
}

export const SUPER_ADMIN_NAV: NavItem[] = [
  { href: '/super-admin/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/super-admin/profile', labelKey: 'profile', icon: UserIcon },
  { href: '/super-admin/audits', labelKey: 'auditLogs', icon: ScrollText },
  { href: '#', labelKey: 'settings', icon: Settings, disabled: true },
];
export const EXPERT_NAV = minimalPortalNav('/expert/dashboard', '/expert/profile');
export const INSTITUTE_NAV = [
  { href: '/institute/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/institute/requests', labelKey: 'requests', icon: FileText },
  { href: '/institute/profile', labelKey: 'profile', icon: UserIcon },
  { href: '/institute/settings', labelKey: 'settings', icon: Settings },
];
export const TRANSPORT_AUTHORITY_NAV = minimalPortalNav(
  '/transport-authority/dashboard',
  '/transport-authority/profile'
);

export const PORTAL_DASHBOARD_HREF: Record<AppRole, string> = ROLE_HOME_ROUTE;
