/** Post-login home route per entity_type / role */
export type AppRole =
  | 'candidate'
  | 'admin'
  | 'super_admin'
  | 'expert'
  | 'institute'
  | 'transport_authority';

export const ROLE_HOME_ROUTE: Record<AppRole, string> = {
  candidate: '/candidate/dashboard',
  admin: '/admin/devices',
  super_admin: '/super-admin/dashboard',
  expert: '/expert/dashboard',
  institute: '/institute/dashboard',
  transport_authority: '/transport-authority/dashboard',
};

export function isAppRole(value: string | null | undefined): value is AppRole {
  return !!value && value in ROLE_HOME_ROUTE;
}

export function getHomeRouteForRole(role: string | null | undefined): string {
  if (isAppRole(role)) return ROLE_HOME_ROUTE[role];
  return '/login';
}
