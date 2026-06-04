import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Calendar,
  CreditCard,
  History,
  LayoutDashboard,
  Laptop,
  FileText,
  Mail,
  Building2,
  ClipboardList,
  Scale,
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
  { href: '/candidate/profile', labelKey: 'profile', icon: UserIcon },
  { href: '/candidate/settings', labelKey: 'settings', icon: Settings },
];

/** Admin portal sidebar — single source of truth */
export const ADMIN_NAV: NavItem[] = [
  { href: '/admin/devices', labelKey: 'devices', icon: Laptop },
  { href: '/admin/active-exams', labelKey: 'activeExams', icon: Activity },
  { href: '/admin/test-plans', labelKey: 'testPlans', icon: ClipboardList },
  { href: '/admin/slots', labelKey: 'slots', icon: Calendar },
  { href: '/admin/candidates', labelKey: 'candidates', icon: Users },
  { href: '/admin/invitations', labelKey: 'invitations', icon: Mail },
  { href: '/admin/reports', labelKey: 'reports', icon: FileText },
  { href: '/admin/settings', labelKey: 'settings', icon: Settings },
];

export const SUPER_ADMIN_NAV: NavItem[] = [
  { href: '/super-admin/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/super-admin/institutions', labelKey: 'institutions', icon: Building2 },
  { href: '/super-admin/candidates', labelKey: 'candidates', icon: Users },
  { href: '/super-admin/experts', labelKey: 'experts', icon: Scale },
  { href: '/super-admin/invitations', labelKey: 'invitations', icon: Mail },
  { href: '/super-admin/reports', labelKey: 'reports', icon: FileText },
  { href: '/super-admin/profile', labelKey: 'profile', icon: UserIcon },
  { href: '/super-admin/settings', labelKey: 'settings', icon: Settings },
];
export const INSTITUTE_NAV = [
  { href: '/institute/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/institute/requests', labelKey: 'requests', icon: FileText },
  { href: '/institute/reports', labelKey: 'reports', icon: FileText },
  { href: '/institute/profile', labelKey: 'profile', icon: UserIcon },
  { href: '/institute/settings', labelKey: 'settings', icon: Settings },
];
export const TRANSPORT_AUTHORITY_NAV: NavItem[] = [
  { href: '/transport-authority/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/transport-authority/profile', labelKey: 'profile', icon: UserIcon },
  { href: '/transport-authority/settings', labelKey: 'settings', icon: Settings },
];
export const EXPERT_NAV: NavItem[] = [
  { href: '/expert/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/expert/appeals', labelKey: 'appeals', icon: Scale },
  { href: '/expert/reports', labelKey: 'reports', icon: FileText },
  { href: '/expert/profile', labelKey: 'profile', icon: UserIcon },
  { href: '/expert/settings', labelKey: 'settings', icon: Settings },
];

export const PORTAL_DASHBOARD_HREF: Record<AppRole, string> = ROLE_HOME_ROUTE;
