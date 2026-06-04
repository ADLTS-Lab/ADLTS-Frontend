'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { hasAuthToken, isSessionValid } from '@/lib/auth-session';
import type { User } from '@/services/auth.service';

type AuthSession = {
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  logout: () => void;
};

/**
 * Single source for UI auth state: requires Zustand auth + live access token.
 * Purges stale persisted user when tokens are missing.
 */
export function useAuthSession(): AuthSession {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const persist = useAuthStore.persist;
    if (!persist) {
      setHasHydrated(true);
      return;
    }

    if (persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }

    const unsub = persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    void persist.rehydrate();
    return unsub;
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    const tokenPresent = hasAuthToken();
    if (!tokenPresent && (isAuthenticated || user)) {
      logout();
    }
  }, [hasHydrated, isAuthenticated, user, logout]);

  const active = hasHydrated && isSessionValid(isAuthenticated, !!user);

  return {
    user: active ? user : null,
    isAuthenticated: active,
    hasHydrated,
    logout,
  };
}
