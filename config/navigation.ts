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

export const PORTAL_DASHBOARD_HREF: Record<'candidate' | 'admin' | 'super_admin', string> = {
  candidate: '/candidate/dashboard',
  admin: '/admin/devices',
  super_admin: '/super-admin/dashboard',
};
