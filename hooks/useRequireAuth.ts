'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

type PortalRole = 'candidate' | 'admin' | 'super_admin';

function hasSessionToken() {
  return typeof window !== 'undefined' && !!localStorage.getItem('auth-token');
}

/**
 * Client-side portal guard (middleware deferred).
 * Returns ready=true once auth state is resolved and access is allowed.
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

    if (isAuthenticated && user?.role && !allowedRoles.includes(user.role as PortalRole)) {
      if (user.role === 'admin' || user.role === 'super_admin') {
        router.replace('/admin/devices');
      } else if (user.role === 'candidate') {
        router.replace('/candidate/dashboard');
      } else {
        router.replace('/login');
      }
      return;
    }

    setReady(true);
  }, [isAuthenticated, user, allowedRoles, router]);

  return { ready, user, isAuthenticated };
}
