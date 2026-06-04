import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/services/auth.service';
import {
  AUTH_STORAGE_KEY,
  AUTH_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_ROLE_KEY,
  clearAuthStorage,
  hasAuthToken,
} from '@/lib/auth-session';

interface AuthState {
  user: User | null;
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null, token?: string, role?: string, refreshToken?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      setUser: (user, token, roleOrEntityType, refreshToken?: string) => {
        const normalizedRole = roleOrEntityType ?? user?.role ?? null;
        const userWithRole =
          user && normalizedRole ? { ...user, role: normalizedRole } : user;

        if (typeof window !== 'undefined') {
          if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
          else localStorage.removeItem(AUTH_TOKEN_KEY);

          if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

          if (normalizedRole) localStorage.setItem(USER_ROLE_KEY, normalizedRole);
          else localStorage.removeItem(USER_ROLE_KEY);
        }

        set({
          user: userWithRole,
          token: token ?? null,
          role: normalizedRole,
          isAuthenticated: !!userWithRole && !!token,
        });
      },
      logout: () => {
        set({ user: null, token: null, role: null, isAuthenticated: false });
        clearAuthStorage();
        useAuthStore.persist?.clearStorage?.();
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (typeof window === 'undefined') return;

        const tokenPresent = hasAuthToken();

        if (!tokenPresent) {
          clearAuthStorage();
          useAuthStore.setState({
            user: null,
            token: null,
            role: null,
            isAuthenticated: false,
          });
          return;
        }

        if (state?.user && state.role) {
          const token = localStorage.getItem(AUTH_TOKEN_KEY);
          useAuthStore.setState({
            user: state.user,
            token: token ?? state.token,
            role: state.role,
            isAuthenticated: true,
          });
        }
      },
    }
  )
);
