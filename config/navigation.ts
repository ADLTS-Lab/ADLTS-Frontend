import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  History,
  LayoutDashboard,
  Laptop,
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
  { href: '/candidate/exams', labelKey: 'examHistory', icon: History },
  { href: '/candidate/profile', labelKey: 'profile', icon: UserIcon },
  { href: '#', labelKey: 'settings', icon: Settings, disabled: true },
];

/** Admin portal sidebar — single source of truth */
export const ADMIN_NAV: NavItem[] = [
  { href: '/admin/devices', labelKey: 'dashboard', icon: Laptop },
  { href: '/admin/active-exams', labelKey: 'activeExams', icon: Activity },
  { href: '/admin/candidates', labelKey: 'candidates', icon: Users },
  { href: '#', labelKey: 'settings', icon: Settings, disabled: true },
];

function minimalPortalNav(dashboardHref: string, profileHref: string): NavItem[] {
  return [
    { href: dashboardHref, labelKey: 'dashboard', icon: LayoutDashboard },
    { href: profileHref, labelKey: 'profile', icon: UserIcon },
    { href: '#', labelKey: 'settings', icon: Settings, disabled: true },
  ];
}

export const SUPER_ADMIN_NAV = minimalPortalNav(
  '/super-admin/dashboard',
  '/super-admin/profile'
);
export const EXPERT_NAV = minimalPortalNav('/expert/dashboard', '/expert/profile');
export const INSTITUTE_NAV = minimalPortalNav('/institute/dashboard', '/institute/profile');
export const TRANSPORT_AUTHORITY_NAV = minimalPortalNav(
  '/transport-authority/dashboard',
  '/transport-authority/profile'
);

export const PORTAL_DASHBOARD_HREF: Record<AppRole, string> = ROLE_HOME_ROUTE;
