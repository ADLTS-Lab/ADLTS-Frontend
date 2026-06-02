import { randomUUID } from 'crypto';

import type { NextRequest } from 'next/server';

const ALLOW_LOCAL_FALLBACK = process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK === 'true';

type MockRole =
  | 'candidate'
  | 'admin'
  | 'super_admin'
  | 'expert'
  | 'institute'
  | 'transport_authority';

export type MockUser = {
  id: string;
  email: string;
  password: string;
  role: MockRole;
  institutionId?: string;
  institutionName?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  phone_number?: string;
  licenseCategory?: string;
  testCenter?: string;
  status?: string;
  birth_date?: string;
  gender?: string;
  address?: string;
};

type MockState = {
  users: Map<string, MockUser>;
  tokens: Map<string, string>;
  refreshTokens: Map<string, string>;
};

declare global {
  // eslint-disable-next-line no-var
  var __adltsMockAuthState: MockState | undefined;
}

const state: MockState = globalThis.__adltsMockAuthState ?? {
  users: new Map<string, MockUser>([
    [
      'root@adlts.et',
      {
        id: 'super-admin-1',
        email: 'root@adlts.et',
        password: 'SuperSecure123!',
        role: 'super_admin',
        name: 'Root Admin',
      },
    ],
    [
      'admin@adlts.gov.et',
      {
        id: 'admin-1',
        email: 'admin@adlts.gov.et',
        password: 'admin123',
        role: 'admin',
        name: 'Admin User',
      },
    ],
    [
      'admin@adlts.et',
      {
        id: 'admin-2',
        email: 'admin@adlts.et',
        password: 'AdminSecure123!',
        role: 'admin',
        name: 'Admin User',
      },
    ],
    [
      'candidate@adlts.et',
      {
        id: 'candidate-1',
        email: 'candidate@adlts.et',
        password: 'password123',
        role: 'candidate',
        first_name: 'Candidate',
        middle_name: 'A.',
        last_name: 'User',
        phone: '+251900000000',
        phone_number: '+251900000000',
        licenseCategory: 'B',
        testCenter: 'Bole Test Center',
        status: 'active',
      },
    ],
    [
      'abebe.tesfaye@example.com',
      {
        id: 'candidate-2',
        email: 'abebe.tesfaye@example.com',
        password: 'SecurePassword123!',
        role: 'candidate',
        first_name: 'Abebe',
        middle_name: 'Tesfaye',
        last_name: 'Tesfaye',
        phone: '+251912345678',
        phone_number: '+251912345678',
        licenseCategory: 'C',
        testCenter: 'Bahir Dar Center',
        status: 'active',
      },
    ],
    [
      'expert.john@example.com',
      {
        id: 'expert-1',
        email: 'expert.john@example.com',
        password: 'ExpertSecure123!',
        role: 'expert',
        first_name: 'Expert',
        last_name: 'John',
        name: 'Expert John',
        phone: '+251911111111',
      },
    ],
    [
      'institute.jane@example.com',
      {
        id: 'institute-1',
        email: 'institute.jane@example.com',
        password: 'InstituteSecure123!',
        role: 'institute',
        name: 'Bole Driving Institute',
        institutionId: 'bole-driving-institute',
        institutionName: 'Bole Driving Institute',
        phone: '+251922222222',
      },
    ],
    [
      'kality@institution.et',
      {
        id: 'institute-2',
        email: 'kality@institution.et',
        password: 'InstituteSecure123!',
        role: 'institute',
        name: 'Kality Driving School',
        institutionId: 'kality-driving-school',
        institutionName: 'Kality Driving School',
        phone: '+251922222223',
      },
    ],
    [
      'adey-ababa@institution.et',
      {
        id: 'institute-3',
        email: 'adey-ababa@institution.et',
        password: 'InstituteSecure123!',
        role: 'institute',
        name: 'Adey Ababa Driving Center',
        institutionId: 'adey-ababa-driving-center',
        institutionName: 'Adey Ababa Driving Center',
        phone: '+251922222224',
      },
    ],
    [
      'lideta@institution.et',
      {
        id: 'institute-4',
        email: 'lideta@institution.et',
        password: 'InstituteSecure123!',
        role: 'institute',
        name: 'Lideta Driving School',
        institutionId: 'lideta-driving-school',
        institutionName: 'Lideta Driving School',
        phone: '+251922222225',
      },
    ],
    [
      'yeka@institution.et',
      {
        id: 'institute-5',
        email: 'yeka@institution.et',
        password: 'InstituteSecure123!',
        role: 'institute',
        name: 'Yeka Driving Academy',
        institutionId: 'yeka-driving-academy',
        institutionName: 'Yeka Driving Academy',
        phone: '+251922222226',
      },
    ],
    [
      'nifas-silk@institution.et',
      {
        id: 'institute-6',
        email: 'nifas-silk@institution.et',
        password: 'InstituteSecure123!',
        role: 'institute',
        name: 'Nifas Silk Driving Center',
        institutionId: 'nifas-silk-driving-center',
        institutionName: 'Nifas Silk Driving Center',
        phone: '+251922222227',
      },
    ],
    [
      'aau@institution.et',
      {
        id: 'institute-7',
        email: 'aau@institution.et',
        password: 'InstituteSecure123!',
        role: 'institute',
        name: 'AAU Driving School',
        institutionId: 'aau-driving-school',
        institutionName: 'AAU Driving School',
        phone: '+251922222228',
      },
    ],
    [
      'authority.jane@example.com',
      {
        id: 'authority-1',
        email: 'authority.jane@example.com',
        password: 'AuthoritySecure123!',
        role: 'transport_authority',
        name: 'Authority Jane',
        phone: '+251933333333',
      },
    ],
    [
      'suspended.mary@example.com',
      {
        id: 'candidate-3',
        email: 'suspended.mary@example.com',
        password: 'password123',
        role: 'candidate',
        first_name: 'Mary',
        middle_name: 'K.',
        last_name: 'Kebede',
        phone: '+251911223344',
        phone_number: '+251911223344',
        licenseCategory: 'A',
        testCenter: 'Adama Center',
        status: 'suspended',
      },
    ],
    [
      'marta@example.com',
      {
        id: 'candidate-4',
        email: 'marta@example.com',
        password: 'SecurePassword123!',
        role: 'candidate',
        first_name: 'Marta',
        middle_name: 'Girma',
        last_name: 'Tekle',
        phone: '+251913456789',
        phone_number: '+251913456789',
        licenseCategory: 'B',
        testCenter: 'Bole Test Center',
        status: 'active',
      },
    ],
    [
      'john@example.com',
      {
        id: 'candidate-5',
        email: 'john@example.com',
        password: 'SecurePassword123!',
        role: 'candidate',
        first_name: 'John',
        middle_name: 'Smith',
        last_name: 'Johnson',
        phone: '+251914567890',
        phone_number: '+251914567890',
        licenseCategory: 'C',
        testCenter: 'Bole Test Center',
        status: 'active',
      },
    ],
    [
      'kebebew@example.com',
      {
        id: 'candidate-6',
        email: 'kebebew@example.com',
        password: 'SecurePassword123!',
        role: 'candidate',
        first_name: 'Kebebew',
        middle_name: 'Assefa',
        last_name: 'Kebede',
        phone: '+251915678901',
        phone_number: '+251915678901',
        licenseCategory: 'B',
        testCenter: 'AAU Test Center',
        status: 'active',
      },
    ],
    [
      'liya@example.com',
      {
        id: 'candidate-7',
        email: 'liya@example.com',
        password: 'SecurePassword123!',
        role: 'candidate',
        first_name: 'Liya',
        middle_name: 'Getnet',
        last_name: 'Hailu',
        phone: '+251916789012',
        phone_number: '+251916789012',
        licenseCategory: 'A',
        testCenter: 'Kality Test Center',
        status: 'active',
      },
    ],
  ]),
  tokens: new Map<string, string>(),
  refreshTokens: new Map<string, string>(),
};

globalThis.__adltsMockAuthState = state;

if (!ALLOW_LOCAL_FALLBACK) {
  state.users.clear();
  state.tokens.clear();
  state.refreshTokens.clear();
}

// Ensure state always has refreshTokens mapped (for backward compatibility during fast refreshes)
if (!state.refreshTokens) {
  state.refreshTokens = new Map<string, string>();
}

function sanitizeUser(user: MockUser) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function responseShape(user: MockUser) {
  const token = `mock-token-${user.role}-${user.id}-${randomUUID()}`;
  const refreshToken = `mock-refresh-${user.role}-${user.id}-${randomUUID()}`;
  
  state.tokens.set(token, user.email);
  state.refreshTokens.set(refreshToken, user.email);

  return {
    success: true,
    data: {
      access_token: token,
      refresh_token: refreshToken,
      entity_type: user.role,
      user: sanitizeUser(user),
    },
  };
}

function registrationResponse(user: MockUser) {
  const session = responseShape(user);
  return {
    ...session,
    access_token: session.data.access_token,
    refresh_token: session.data.refresh_token,
    entity_type: session.data.entity_type,
    user: session.data.user,
    data: {
      ...session.data,
      candidate: session.data.user,
      otp_sent: true,
      token: session.data.access_token,
    },
  };
}

function getBearerToken(request: NextRequest) {
  const header = request.headers.get('authorization');
  if (!header) return null;

  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export function getAuthenticatedUser(request: NextRequest) {
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
  const confirmPassword = String(body.confirm_password ?? password);

  if (!email || !password) {
    return { error: 'Email and password are required.', status: 400 };
  }

  if (password !== confirmPassword) {
    return { error: 'Password and confirm password must match.', status: 400 };
  }

  const existing = state.users.get(email);
  if (existing) {
    return { error: 'A user with that email already exists.', status: 409 };
  }

  const firstName = String(body.first_name ?? body.name ?? 'Candidate').trim().split(/\s+/)[0] || 'Candidate';
  const middleName = String(body.middle_name ?? '').trim() || undefined;
  const lastName = String(body.last_name ?? 'User').trim().split(/\s+/)[0] || 'User';
  const phoneNumber = String(body.phone_number ?? body.phone ?? '+251900000000');

  const user: MockUser = {
    id: `candidate-${randomUUID()}`,
    email,
    password,
    role: 'candidate',
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    phone: phoneNumber,
    phone_number: phoneNumber,
    licenseCategory: 'B',
    testCenter: 'Bole Test Center',
    status: 'active',
  };

  state.users.set(email, user);
  return registrationResponse(user);
}

export function verifyCandidateOtpUser(body: Record<string, unknown>) {
  const email = String(body.email ?? '').trim().toLowerCase();
  const user = state.users.get(email);

  if (!email) {
    return { error: 'Email is required.', status: 400 };
  }

  if (!user || user.role !== 'candidate') {
    return { error: 'Candidate not found.', status: 404 };
  }

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

export async function changePassword(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) return null;

  try {
    const body = await request.json();
    const currentPassword = String(body.current_password ?? body.currentPassword ?? '').trim();
    const newPassword = String(body.new_password ?? body.newPassword ?? '').trim();

    if (!currentPassword || !newPassword) {
      return { error: 'Current password and new password are required.', status: 400 };
    }

    if (user.password !== currentPassword) {
      return { error: 'Current password is incorrect.', status: 403 };
    }

    user.password = newPassword;
    state.users.set(user.email, user);

    return {
      success: true,
      message: 'Password changed successfully.',
    };
  } catch (err) {
    return { error: 'Unable to change password.', status: 400 };
  }
}

export function refreshUserTokens(refreshToken: string) {
  const email = state.refreshTokens.get(refreshToken);
  if (!email) return null;

  const user = state.users.get(email);
  if (!user) return null;

  return responseShape(user);
}

export function listCandidates(search?: string) {
  const candidatesList = Array.from(state.users.values())
    .filter((user) => user.role === 'candidate')
    .map((user) => ({
      id: user.id,
      email: user.email,
      first_name: user.first_name ?? 'Candidate',
      last_name: user.last_name ?? 'User',
      name: user.name ?? `${user.first_name ?? 'Candidate'} ${user.last_name ?? 'User'}`.trim(),
      status: user.status ?? 'active',
      licenseCategory: user.licenseCategory ?? 'B',
      testCenter: user.testCenter ?? 'Bole Test Center',
    }));

  if (!search) {
    return candidatesList;
  }

  const term = search.toLowerCase();
  return candidatesList.filter((candidate) => {
    const haystack = [
      candidate.name,
      candidate.email,
      candidate.status,
      candidate.first_name,
      candidate.last_name,
    ].join(' ').toLowerCase();
    return haystack.includes(term);
  });
}

export function updateCandidateStatus(id: string, status: 'active' | 'suspended') {
  const user = Array.from(state.users.values()).find((u) => u.id === id);
  if (!user || user.role !== 'candidate') return null;

  user.status = status;
  state.users.set(user.email, user);

  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name ?? 'Candidate',
    last_name: user.last_name ?? 'User',
    name: user.name ?? `${user.first_name ?? 'Candidate'} ${user.last_name ?? 'User'}`.trim(),
    status: user.status,
    licenseCategory: user.licenseCategory ?? 'B',
    testCenter: user.testCenter ?? 'Bole Test Center',
  };
}

export async function updateCandidateProfile(request: NextRequest) {
  const user = getUserForRole(request, 'candidate');
  if (!user) return null;

  try {
    const body = await request.json();
    if (body.first_name !== undefined) user.first_name = body.first_name;
    if (body.last_name !== undefined) user.last_name = body.last_name;
    if (body.phone !== undefined) user.phone = body.phone;
    if (body.phone_number !== undefined) user.phone_number = body.phone_number;
    if (body.birth_date !== undefined) user.birth_date = body.birth_date;
    if (body.gender !== undefined) user.gender = body.gender;
    if (body.address !== undefined) user.address = body.address;

    state.users.set(user.email, user);

    return {
      success: true,
      data: sanitizeUser(user),
    };
  } catch (err) {
    return null;
  }
}
