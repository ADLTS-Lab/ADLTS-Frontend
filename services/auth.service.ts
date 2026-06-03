import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { extractApiError, shouldUseLocalFallback } from './api-utils';

const LOCAL_REGISTERED_USERS_KEY = 'adlts-registered-users';
const ALLOW_LOCAL_FALLBACK = process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK === 'true';

// ---------- Types ----------
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role: string; // 'candidate', 'admin', 'super_admin', etc.
  institutionId?: string;
  institutionName?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  name?: string; // for admin/super_admin
  phone?: string;
  phone_number?: string;
  // candidate-specific
  licenseCategory?: string;
  testCenter?: string;
  birth_date?: string;
  gender?: string;
  address?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    entity_type: string;
    user: User;
  };
  message?: string;
}

export type LoginResponse = RefreshTokenResponse;

export interface CurrentUserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface CandidateRegistrationRequest {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  password: string;
  phone_number?: string;
  /**
   * Backward-compatible alias used by the current registration form.
   * The service normalizes this to the backend `phone` field before sending.
   */
  phone?: string;
  fayida_id?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface CandidateRegistrationResponse {
  success: boolean;
  message?: string;
  access_token?: string;
  refresh_token?: string;
  entity_type?: string;
  token?: string;
  user?: User;
  data?: {
    candidate?: User;
    user?: User;
    otp_sent?: boolean;
    access_token?: string;
    refresh_token?: string;
    entity_type?: string;
    token?: string;
  };
}

export interface OtpVerificationData {
  email: string;
  code: string;
}

type RawSessionResponse =
  | RefreshTokenResponse
  | {
      success?: boolean;
      message?: string;
      data?: {
        access_token?: string;
        token?: string;
        refresh_token?: string;
        entity_type?: string;
        role?: string;
        user?: User;
      };
      access_token?: string;
      token?: string;
      refresh_token?: string;
      entity_type?: string;
      role?: string;
      user?: User;
    };

type NormalizedSessionPayload = {
  access_token?: string;
  token?: string;
  refresh_token?: string;
  entity_type?: string;
  role?: string;
  user?: User;
};

type JwtSessionClaims = {
  sub?: string;
  sub_id?: string;
  email?: string;
  entity_type?: string;
};

export type CandidateRegistrationData = CandidateRegistrationRequest;

type LocalRegisteredUser = Omit<CandidateRegistrationRequest, 'gender'> & {
  role: 'candidate' | 'institute';
  id: string;
  gender?: string;
  licenseCategory?: string;
  testCenter?: string;
  institutionId?: string;
  institutionName?: string;
  name?: string;
};

function readLocalRegisteredUsers(): LocalRegisteredUser[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(LOCAL_REGISTERED_USERS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as LocalRegisteredUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalRegisteredUser(user: CandidateRegistrationRequest): LocalRegisteredUser {
  const localUser: LocalRegisteredUser = {
    ...user,
    phone_number: user.phone_number ?? user.phone,
    id: `local-${Date.now()}`,
    role: 'candidate',
    licenseCategory: 'B',
    testCenter: 'Bole Test Center',
  };

  if (typeof window !== 'undefined') {
    const users = readLocalRegisteredUsers();
    const nextUsers = [
      ...users.filter((existing) => existing.email !== localUser.email),
      localUser,
    ];
    localStorage.setItem(LOCAL_REGISTERED_USERS_KEY, JSON.stringify(nextUsers));
  }

  return localUser;
}

function findLocalRegisteredUser(email: string, password: string): LocalRegisteredUser | null {
  const users = readLocalRegisteredUsers();
  const match = users.find((user) => user.email === email && user.password === password);
  return match || null;
}

function findLocalRegisteredUserByEmail(email: string): LocalRegisteredUser | null {
  const users = readLocalRegisteredUsers();
  const match = users.find((user) => user.email === email);
  return match || null;
}

function buildLocalSessionResponse(user: LocalRegisteredUser): RefreshTokenResponse {
  const entityType = user.role;

  return {
    success: true,
    data: {
      access_token: `local-token-${user.id}`,
      refresh_token: `local-refresh-${user.id}`,
      entity_type: entityType,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        phone: user.phone,
        phone_number: user.phone_number ?? user.phone,
        licenseCategory: user.licenseCategory,
        testCenter: user.testCenter,
        institutionId: user.institutionId,
        institutionName: user.institutionName,
        name: user.name,
      },
    },
  };
}

function buildLocalRegistrationResponse(user: LocalRegisteredUser): CandidateRegistrationResponse {
  const sessionUser: User = {
    id: user.id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    middle_name: user.middle_name,
    last_name: user.last_name,
    phone: user.phone,
    phone_number: user.phone_number ?? user.phone,
    licenseCategory: user.licenseCategory,
    testCenter: user.testCenter,
  };

  const accessToken = `local-token-${user.id}`;
  const refreshToken = `local-refresh-${user.id}`;

  return {
    success: true,
    message: 'Candidate registration captured locally.',
    access_token: accessToken,
    refresh_token: refreshToken,
    entity_type: 'candidate',
    user: sessionUser,
    data: {
      candidate: sessionUser,
      user: sessionUser,
      access_token: accessToken,
      refresh_token: refreshToken,
      token: accessToken,
      entity_type: 'candidate',
      otp_sent: true,
    },
  };
}

function buildLocalOtpVerificationResponse(user: LocalRegisteredUser): RefreshTokenResponse {
  return buildLocalSessionResponse(user);
}

function decodeJwtClaims(token: string): JwtSessionClaims | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf8');

    return JSON.parse(decoded) as JwtSessionClaims;
  } catch {
    return null;
  }
}

function buildUserFromToken(accessToken: string, entityType: string): User | null {
  const claims = decodeJwtClaims(accessToken);
  if (!claims?.email) return null;

  return {
    id: claims.sub_id || claims.sub || claims.email,
    email: claims.email,
    role: claims.entity_type || entityType,
  };
}

function normalizeSessionResponse(raw: RawSessionResponse): RefreshTokenResponse {
  const payload = ('data' in raw && raw.data ? raw.data : raw) as NormalizedSessionPayload;
  const accessToken = payload.access_token || payload.token;
  const entityType = payload.entity_type || payload.role || payload.user?.role || 'candidate';
  const user = payload.user || (accessToken ? buildUserFromToken(accessToken, entityType) : null);

  if (!user || !accessToken) {
    throw new Error('Login response is missing user or token');
  }

  return {
    success: raw.success ?? true,
    data: {
      access_token: accessToken,
      refresh_token: payload.refresh_token ?? accessToken,
      entity_type: entityType,
      user,
    },
  };
}

// ---------- Login ----------
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[auth:login] request', {
        baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
        endpoint: '/auth/login',
        payload: {
          email: credentials.email,
          password: '<redacted>',
          passwordLength: credentials.password?.length ?? 0,
        },
      });
    }

    const response = await api.post('/auth/login', credentials);
    return normalizeSessionResponse(response.data as RawSessionResponse);
  } catch (error: unknown) {
    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      const localUser = findLocalRegisteredUser(credentials.email, credentials.password);
      if (localUser) {
        return buildLocalSessionResponse(localUser);
      }
    }

    throw new Error(extractApiError(error, 'Login failed. Please check your email and password.', 'auth-login'));
  }
}

// ---------- Refresh ----------
export async function refreshAuthToken(refreshToken?: string): Promise<LoginResponse> {
  const token = refreshToken ?? (typeof window !== 'undefined' ? localStorage.getItem('refresh-token') : null);

  if (!token) {
    throw new Error('Refresh token is required.');
  }

  try {
    const response = await api.post('/auth/token/refresh', {
      refresh_token: token,
    });

    return normalizeSessionResponse(response.data as RawSessionResponse);
  } catch (error) {
    throw new Error(extractApiError(error, 'Your session has expired. Please sign in again.', 'auth-refresh'));
  }
}

// ---------- Logout ----------
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout API error', error);
  }

  useAuthStore.getState().logout();
}

// ---------- Get Current User (by role) ----------
export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('auth-token');
  if (!token) return null;

  const role = localStorage.getItem('user-role');
  // Real API
  try {
    if (role === 'candidate') {
      const res = await api.get<CurrentUserResponse>('/candidates/me');
      return res.data.data;
    } else if (role === 'admin') {
      const res = await api.get<CurrentUserResponse>('/admins/me');
      return res.data.data;
    } else if (role === 'super_admin') {
      const res = await api.get<CurrentUserResponse>('/super-admins/me');
      return res.data.data;
    } else if (role === 'expert') {
      const res = await api.get<CurrentUserResponse>('/experts/me');
      return res.data.data;
    } else if (role === 'institute') {
      const res = await api.get<CurrentUserResponse>('/institutes/me');
      return res.data.data;
    } else if (role === 'transport_authority') {
      const res = await api.get<CurrentUserResponse>('/transport-authorities/me');
      return res.data.data;
    }
    return null;
  } catch (error) {
    throw new Error(extractApiError(error, 'Unable to load your profile.', 'auth-session'));
  }
}

// ---------- Update Profile ----------
export async function updateCandidateProfile(data: Partial<User>): Promise<User | null> {
  const role = typeof window !== 'undefined' ? localStorage.getItem('user-role') : null;
  
  try {
    if (role === 'candidate') {
      const res = await api.patch('/candidates/me', data);
      return res.data.data;
    } else if (role === 'admin') {
      const res = await api.patch('/admins/me', data);
      return res.data.data;
    } else if (role === 'super_admin') {
      const res = await api.patch('/super-admins/me', data);
      return res.data.data;
    }
  } catch (error) {
    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      if (typeof window !== 'undefined') {
        const storedUsers = localStorage.getItem(LOCAL_REGISTERED_USERS_KEY);
        if (storedUsers) {
          const parsed = JSON.parse(storedUsers) as LocalRegisteredUser[];
          const currentToken = localStorage.getItem('auth-token');
          const userIdx = parsed.findIndex((user) => `local-token-${user.id}` === currentToken || user.email?.toLowerCase() === data.email?.toLowerCase());
          if (userIdx > -1) {
            const existingUser = parsed[userIdx];
            parsed[userIdx] = {
              ...existingUser,
              ...data,
              id: existingUser.id,
              email: data.email ?? existingUser.email,
              role: existingUser.role,
            };
            localStorage.setItem(LOCAL_REGISTERED_USERS_KEY, JSON.stringify(parsed));
            return {
              id: parsed[userIdx].id,
              email: parsed[userIdx].email,
              role: parsed[userIdx].role,
              first_name: parsed[userIdx].first_name,
              last_name: parsed[userIdx].last_name,
              phone: parsed[userIdx].phone,
              licenseCategory: parsed[userIdx].licenseCategory,
              testCenter: parsed[userIdx].testCenter,
            };
          }
        }
      }
    }
    throw new Error(extractApiError(error, 'Unable to update profile.', 'auth-session'));
  }
  return null;
}

// ---------- Candidate Registration ----------
export async function registerCandidate(
  data: CandidateRegistrationRequest
): Promise<CandidateRegistrationResponse> {
  const phoneNumber = data.phone_number ?? data.phone;
  const birthDate = data.birth_date ? `${data.birth_date}T00:00:00Z` : undefined;
  const payload = {
    first_name: data.first_name,
    middle_name: data.middle_name,
    last_name: data.last_name,
    email: data.email,
    password: data.password,
    ...(phoneNumber ? { phone: phoneNumber } : {}),
    fayida_id: data.fayida_id,
    birth_date: birthDate,
    gender: data.gender,
  };

  try {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[auth:registerCandidate] request', {
        baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
        endpoint: '/auth/candidates/register',
        payload: {
          ...payload,
          password: '<redacted>',
          passwordLength: payload.password?.length ?? 0,
        },
      });
    }

    const res = await api.post<CandidateRegistrationResponse>('/auth/candidates/register', payload);

    if (typeof window !== 'undefined' && ALLOW_LOCAL_FALLBACK) {
      saveLocalRegisteredUser(data);
    }

    return res.data;
  } catch (error) {
    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      const localUser = saveLocalRegisteredUser(data);
      return buildLocalRegistrationResponse(localUser);
    }

    throw new Error(extractApiError(error, 'Registration failed. Please try again.', 'auth-register'));
  }
}

// ---------- Verify OTP ----------
export async function verifyOtp(data: OtpVerificationData): Promise<RefreshTokenResponse> {
  try {
    const res = await api.post<RefreshTokenResponse>('/auth/candidates/verify-otp', data);
    return normalizeSessionResponse(res.data as RawSessionResponse);
  } catch (error) {
    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      const localUser = findLocalRegisteredUserByEmail(data.email);
      if (localUser) {
        return buildLocalOtpVerificationResponse(localUser);
      }
    }

    throw new Error(extractApiError(error, 'Unable to verify OTP. Please try again.', 'auth-session'));
  }
}

// ---------- Change Password ----------
export async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
  try {
    await api.patch('/auth/password/change', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return true;
  } catch (error) {
    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      if (!currentPassword || !newPassword) {
        throw new Error('Please provide valid passwords.');
      }
      return true;
    }

    throw new Error(extractApiError(error, 'Unable to change password. Please ensure your current password is correct.', 'auth-session'));
  }
}
