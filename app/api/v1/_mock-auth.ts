import { randomUUID } from 'crypto';

import type { NextRequest } from 'next/server';

type MockRole = 'candidate' | 'admin' | 'super_admin';

type MockUser = {
  id: string;
  email: string;
  password: string;
  role: MockRole;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  licenseCategory?: string;
  testCenter?: string;
};

type MockState = {
  users: Map<string, MockUser>;
  tokens: Map<string, string>;
};

declare global {
  // eslint-disable-next-line no-var
  var __adltsMockAuthState: MockState | undefined;
}

const state: MockState = globalThis.__adltsMockAuthState ?? {
  users: new Map<string, MockUser>([
    [
      'candidate@adlts.et',
      {
        id: 'candidate-1',
        email: 'candidate@adlts.et',
        password: 'password123',
        role: 'candidate',
        first_name: 'Candidate',
        last_name: 'User',
        phone: '+251900000000',
        licenseCategory: 'B',
        testCenter: 'Bole Test Center',
      },
    ],
    [
      'admin@adlts.et',
      {
        id: 'admin-1',
        email: 'admin@adlts.et',
        password: 'password123',
        role: 'admin',
        name: 'Admin User',
      },
    ],
    [
      'superadmin@adlts.et',
      {
        id: 'super-admin-1',
        email: 'superadmin@adlts.et',
        password: 'password123',
        role: 'super_admin',
        name: 'Super Admin User',
      },
    ],
  ]),
  tokens: new Map<string, string>(),
};

globalThis.__adltsMockAuthState = state;

function sanitizeUser(user: MockUser) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function responseShape(user: MockUser) {
  const token = `mock-token-${user.role}-${user.id}-${randomUUID()}`;
  state.tokens.set(token, user.email);

  return {
    success: true,
    data: {
      access_token: token,
      refresh_token: `mock-refresh-${user.id}`,
      entity_type: user.role,
      user: sanitizeUser(user),
    },
  };
}

function getBearerToken(request: NextRequest) {
  const header = request.headers.get('authorization');
  if (!header) return null;

  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function getAuthenticatedUser(request: NextRequest) {
  const token = getBearerToken(request);
  if (!token) return null;

  const email = state.tokens.get(token);
  if (!email) return null;

  return state.users.get(email) ?? null;
}

function getUserForRole(request: NextRequest, role: MockRole) {
  const user = getAuthenticatedUser(request);
  if (!user || user.role !== role) return null;
  return user;
}

export function loginUser(email: string, password: string) {
  const user = state.users.get(email);
  if (!user || user.password !== password) {
    return null;
  }

  return responseShape(user);
}

export function registerCandidateUser(body: Record<string, unknown>) {
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  const confirmPassword = String(body.confirm_password ?? '');

  if (!email || !password || !confirmPassword) {
    return { error: 'Email, password, and confirm_password are required.', status: 400 };
  }

  if (password !== confirmPassword) {
    return { error: 'Password and confirm password must match.', status: 400 };
  }

  const existing = state.users.get(email);
  if (existing) {
    return { error: 'A user with that email already exists.', status: 409 };
  }

  const firstName = String(body.first_name ?? body.name ?? 'Candidate').trim().split(/\s+/)[0] || 'Candidate';
  const lastName = String(body.last_name ?? 'User').trim().split(/\s+/)[0] || 'User';

  const user: MockUser = {
    id: `candidate-${randomUUID()}`,
    email,
    password,
    role: 'candidate',
    first_name: firstName,
    last_name: lastName,
    phone: String(body.phone ?? '+251900000000'),
    licenseCategory: 'B',
    testCenter: 'Bole Test Center',
  };

  state.users.set(email, user);
  return responseShape(user);
}

export function currentUserResponse(request: NextRequest, role: MockRole) {
  const user = getUserForRole(request, role);
  if (!user) return null;

  return {
    success: true,
    data: sanitizeUser(user),
  };
}

export function logoutUser(request: NextRequest) {
  const token = getBearerToken(request);
  if (token) {
    state.tokens.delete(token);
  }

  return { success: true, message: 'Logged out successfully.' };
}

export function passwordResetResponse() {
  return {
    success: true,
    message: 'Password reset instructions have been queued.',
  };
}
