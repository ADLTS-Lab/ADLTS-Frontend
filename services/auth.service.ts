import api from '@/lib/api';

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
  first_name?: string;
  last_name?: string;
  name?: string; // for admin/super_admin
  phone?: string;
  // candidate-specific
  licenseCategory?: string;
  testCenter?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token?: string;
    entity_type: string;
    user: User;
  };
}

type RawLoginResponse =
  | LoginResponse
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

// Registration types for candidate
export interface CandidateRegistrationData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  fayida_id?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface OtpVerificationData {
  email: string;
  code: string;
}

type LocalRegisteredUser = CandidateRegistrationData & {
  role: 'candidate';
  id: string;
  licenseCategory?: string;
  testCenter?: string;
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

function saveLocalRegisteredUser(user: CandidateRegistrationData): LocalRegisteredUser {
  const localUser: LocalRegisteredUser = {
    ...user,
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

function buildLocalLoginResponse(user: LocalRegisteredUser): LoginResponse {
  return {
    success: true,
    data: {
      access_token: `local-token-${user.id}`,
      refresh_token: `local-refresh-${user.id}`,
      entity_type: 'candidate',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        licenseCategory: user.licenseCategory,
        testCenter: user.testCenter,
      },
    },
  };
}

function normalizeLoginResponse(raw: RawLoginResponse): LoginResponse {
  const payload: any = 'data' in raw && raw.data ? raw.data : raw;
  const user = payload.user;
  const accessToken = payload.access_token || payload.token;
  const entityType = payload.entity_type || payload.role || user?.role || 'candidate';

  if (!user || !accessToken) {
    throw new Error('Login response is missing user or token');
  }

  return {
    success: raw.success ?? true,
    data: {
      access_token: accessToken,
      refresh_token: payload.refresh_token,
      entity_type: entityType,
      user,
    },
  };
}

// ---------- Login ----------
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await api.post('/auth/login', credentials);
    return normalizeLoginResponse(response.data as RawLoginResponse);
  } catch (error: any) {
    if (ALLOW_LOCAL_FALLBACK) {
      const localUser = findLocalRegisteredUser(credentials.email, credentials.password);
      if (localUser) {
        return buildLocalLoginResponse(localUser);
      }
    }

    throw error;
  }
}

// ---------- Logout ----------
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout API error', error);
  }
  localStorage.removeItem('auth-token');
  localStorage.removeItem('user-role');
}

// ---------- Get Current User (by role) ----------
export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('auth-token');
  if (!token) return null;

  const role = localStorage.getItem('user-role');
  // Real API
  try {
    if (role === 'candidate') {
      const res = await api.get('/candidates/me');
      return res.data.data;
    } else if (role === 'admin') {
      const res = await api.get('/admins/me');
      return res.data.data;
    } else if (role === 'super_admin') {
      const res = await api.get('/super-admins/me');
      return res.data.data;
    }
    return null;
  } catch {
    return null;
  }
}

// ---------- Candidate Registration ----------
export async function registerCandidate(data: CandidateRegistrationData): Promise<any> {
  const payload = {
    name: `${data.first_name} ${data.last_name}`.trim(),
    email: data.email,
    phone: data.phone,
    password: data.password,
    confirm_password: data.password,
    fayda_id: data.fayida_id,
    birth_date: data.birth_date,
    gender: data.gender,
    role: 'candidate',
  };

  const res = await api.post('/auth/register', payload);

  if (typeof window !== 'undefined' && ALLOW_LOCAL_FALLBACK) {
    saveLocalRegisteredUser(data);
  }

  return res.data;
}

// ---------- Verify OTP ----------
export async function verifyOtp(data: OtpVerificationData): Promise<any> {
  throw new Error('OTP verification is not available in the current mock collection.');
}