import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/services/auth.service';

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
      setUser: (user, token, role, refreshToken?: string) => {
        if (token) localStorage.setItem('auth-token', token);
        if (refreshToken) localStorage.setItem('refresh-token', refreshToken);
        if (role) localStorage.setItem('user-role', role);
        set({ user, token, role, isAuthenticated: !!user });
      },
      logout: () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
        localStorage.removeItem('user-role');
        set({ user: null, token: null, role: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-storage' }
  )
);