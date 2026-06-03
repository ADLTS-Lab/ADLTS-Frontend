import { afterEach, describe, expect, it, vi } from 'vitest';

describe('smoke test', () => {
  it('adds numbers correctly', () => {
    expect(2 + 2).toBe(4);
  });
});

describe('mock auth route state', () => {
  const originalApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const originalAllowLocalFallback = process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK;

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBaseUrl;
    process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK = originalAllowLocalFallback;
    vi.resetModules();
  });

  it('allows login again after register and logout when using the Next mock API', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = '/api/v1';
    process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK = 'false';

    vi.resetModules();
    const registerRoute = await import('../app/api/v1/_mock-auth');
    const email = `candidate-${Date.now()}@example.com`;
    const password = 'SecurePassword123!';

    registerRoute.registerCandidateUser({
      first_name: 'Test',
      last_name: 'Candidate',
      email,
      password,
      phone_number: '+251900000001',
    });

    vi.resetModules();
    const firstLoginRoute = await import('../app/api/v1/_mock-auth');
    const firstLogin = firstLoginRoute.loginUser(email, password);
    expect(firstLogin).not.toBeNull();

    vi.resetModules();
    const logoutRoute = await import('../app/api/v1/_mock-auth');
    logoutRoute.logoutUser({
      headers: new Headers({
        authorization: `Bearer ${firstLogin?.data.access_token}`,
      }),
    } as Parameters<typeof logoutRoute.logoutUser>[0]);

    vi.resetModules();
    const secondLoginRoute = await import('../app/api/v1/_mock-auth');
    const secondLogin = secondLoginRoute.loginUser(email, password);

    expect(secondLogin).not.toBeNull();
    expect(secondLogin?.data.user.email).toBe(email);
  });
});
