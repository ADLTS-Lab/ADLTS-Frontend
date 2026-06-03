import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Calendar,
  Bell,
  CreditCard,
  History,
  LayoutDashboard,
  Laptop,
  FileText,
  Mail,
  Building2,
  ClipboardList,
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
  { href: '/candidate/payments', labelKey: 'payments', icon: CreditCard },
  { href: '/candidate/exams', labelKey: 'examHistory', icon: History },
  { href: '/candidate/notifications', labelKey: 'notifications', icon: Bell },
  { href: '/candidate/profile', labelKey: 'profile', icon: UserIcon },
  { href: '/candidate/settings', labelKey: 'settings', icon: Settings },
];

/** Admin portal sidebar — single source of truth */
export const ADMIN_NAV: NavItem[] = [
  { href: '/admin/devices', labelKey: 'dashboard', icon: Laptop },
  { href: '/admin/active-exams', labelKey: 'activeExams', icon: Activity },
  { href: '/admin/test-plans', labelKey: 'testPlans', icon: ClipboardList },
  { href: '/admin/slots', labelKey: 'slots', icon: Calendar },
  { href: '/admin/candidates', labelKey: 'candidates', icon: Users },
  { href: '/admin/invitations', labelKey: 'invitations', icon: Mail },
  { href: '/admin/notifications', labelKey: 'notifications', icon: Bell },
  { href: '/admin/reports', labelKey: 'reports', icon: FileText },
  { href: '/admin/settings', labelKey: 'settings', icon: Settings },
];

export const SUPER_ADMIN_NAV: NavItem[] = [
  { href: '/super-admin/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/super-admin/institutions', labelKey: 'institutions', icon: Building2 },
  { href: '/super-admin/profile', labelKey: 'profile', icon: UserIcon },
  { href: '/super-admin/notifications', labelKey: 'notifications', icon: Bell },
  { href: '/super-admin/audits', labelKey: 'auditLogs', icon: ScrollText },
  { href: '/super-admin/settings', labelKey: 'settings', icon: Settings },
];
export const INSTITUTE_NAV = [
  { href: '/institute/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/institute/requests', labelKey: 'requests', icon: FileText },
  { href: '/institute/notifications', labelKey: 'notifications', icon: Bell },
  { href: '/institute/profile', labelKey: 'profile', icon: UserIcon },
  { href: '/institute/settings', labelKey: 'settings', icon: Settings },
];
export const TRANSPORT_AUTHORITY_NAV: NavItem[] = [
  { href: '/transport-authority/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/transport-authority/notifications', labelKey: 'notifications', icon: Bell },
  { href: '/transport-authority/profile', labelKey: 'profile', icon: UserIcon },
  { href: '/transport-authority/settings', labelKey: 'settings', icon: Settings },
];
export const EXPERT_NAV: NavItem[] = [
  { href: '/expert/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/expert/notifications', labelKey: 'notifications', icon: Bell },
  { href: '/expert/profile', labelKey: 'profile', icon: UserIcon },
  { href: '/expert/settings', labelKey: 'settings', icon: Settings },
];

export const PORTAL_DASHBOARD_HREF: Record<AppRole, string> = ROLE_HOME_ROUTE;
