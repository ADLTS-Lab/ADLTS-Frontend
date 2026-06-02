/** Post-login home route per entity_type / role */
export type AppRole =
  | 'candidate'
  | 'admin'
  | 'super_admin'
  | 'expert'
  | 'institute'
  | 'transport_authority';

function normalizeRole(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '');
}

export const ROLE_HOME_ROUTE: Record<AppRole, string> = {
  candidate: '/candidate/dashboard',
  admin: '/admin/devices',
  super_admin: '/super-admin/dashboard',
  expert: '/expert/dashboard',
  institute: '/institute/dashboard',
  transport_authority: '/transport-authority/dashboard',
};

export function isAppRole(value: string | null | undefined): value is AppRole {
  if (!value) return false;
  return normalizeRole(value) in ROLE_HOME_ROUTE;
}

export function getHomeRouteForRole(role: string | null | undefined): string {
  const normalizedRole = normalizeRole(role ?? '');
  if (isAppRole(normalizedRole)) return ROLE_HOME_ROUTE[normalizedRole as AppRole];
  return '/login';
}
