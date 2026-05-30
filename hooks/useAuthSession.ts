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

  // #region agent log
  useEffect(() => {
    if (!hasHydrated) return;
    fetch('http://127.0.0.1:7485/ingest/750002e8-fc34-4f4c-aec9-03b23cf457b3',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'30f368'},body:JSON.stringify({sessionId:'30f368',location:'hooks/useAuthSession.ts',message:'session evaluated',data:{active,isAuthenticated,hasUser:!!user,hasToken:hasAuthToken()},timestamp:Date.now(),hypothesisId:'B',runId:'post-fix'})}).catch(()=>{});
  }, [hasHydrated, active, isAuthenticated, user]);
  // #endregion

  return {
    user: active ? user : null,
    isAuthenticated: active,
    hasHydrated,
    logout,
  };
}
