'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getHomeRouteForRole, type AppRole } from '@/config/routes';

export type PortalRole = AppRole;

function hasSessionToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('auth-token');
}

/**
 * Client-side portal guard (middleware deferred).
 */
export function useRequireAuth(allowedRoles: PortalRole[]) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = hasSessionToken();

    if (!isAuthenticated && !token) {
      router.replace('/login');
      return;
    }

    const userRole = user?.role;

    if (userRole && !allowedRoles.includes(userRole as PortalRole)) {
      router.replace(getHomeRouteForRole(userRole));
      return;
    }

    setReady(true);
  }, [isAuthenticated, user, allowedRoles, router]);

  return { ready, user, isAuthenticated };
}
