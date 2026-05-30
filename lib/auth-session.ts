/** Keys used for client auth persistence — keep in sync across store, api, and services. */
export const AUTH_STORAGE_KEY = 'auth-storage';
export const AUTH_TOKEN_KEY = 'auth-token';
export const REFRESH_TOKEN_KEY = 'refresh-token';
export const USER_ROLE_KEY = 'user-role';

export function hasAuthToken(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

/** Remove every client-side auth artifact (Zustand persist + token keys). */
export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isSessionValid(isAuthenticated: boolean, hasUser: boolean): boolean {
  return isAuthenticated && hasUser && hasAuthToken();
}
