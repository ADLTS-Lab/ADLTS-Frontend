import api from '@/lib/api';
import { extractApiError, shouldUseLocalFallback, type ApiSuccess } from './api-utils';

export type InstitutionAccountStatus = 'Invited' | 'Active' | 'Disabled';

export interface InstitutionAccount {
  id: string;
  name: string;
  email: string;
  status: InstitutionAccountStatus;
  invitationId?: string;
  invitationToken?: string;
  invitedAt?: string;
  acceptedAt?: string | null;
  disabledAt?: string | null;
}

export interface InviteInstitutionRequest {
  institutionName: string;
  email: string;
}

export interface InviteInstitutionResult {
  institution: InstitutionAccount;
  invitationToken: string;
  mockEmailLink: string;
  message: string;
}

export interface AcceptInstitutionInvitationRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface InstitutionInvitationDetails {
  token: string;
  institutionName: string;
  email: string;
  status: InstitutionAccountStatus;
  acceptedAt?: string | null;
}

interface BackendInvitationRecord {
  id?: string;
  email?: string;
  entity_type?: string;
  role?: string;
  name?: string;
  institution_name?: string;
  first_name?: string;
  last_name?: string;
  status?: string;
  token?: string;
  invited_at?: string;
  accepted_at?: string | null;
}

interface BackendInstituteRecord {
  id?: string;
  _id?: string;
  email?: string;
  name?: string;
  institution_name?: string;
  status?: string;
  created_at?: string;
  accepted_at?: string | null;
}

type BackendListResponse<T> = {
  success?: boolean;
  data?: { items?: T[]; data?: T[] } | T[];
  items?: T[];
  message?: string;
};

const MOCK_STORAGE_KEY = 'adlts-institution-invitations';
const LOCAL_REGISTERED_USERS_KEY = 'adlts-registered-users';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isInstitutionInvitation(record: BackendInvitationRecord): boolean {
  const entityType = record.entity_type ?? record.role;
  return entityType === 'institute' || entityType === 'institution';
}

function normalizeStatus(status: string | undefined): InstitutionAccountStatus {
  const normalized = (status ?? '').toLowerCase();
  if (normalized === 'active' || normalized === 'accepted') return 'Active';
  if (normalized === 'disabled' || normalized === 'suspended') return 'Disabled';
  return 'Invited';
}

function normalizeName(record: BackendInvitationRecord | BackendInstituteRecord): string {
  const name = record.name ?? record.institution_name;
  if (name) return name;

  if ('first_name' in record) {
    return [record.first_name, record.last_name].filter(Boolean).join(' ').trim() || 'Institution';
  }

  return 'Institution';
}

function getArrayPayload<T>(response: BackendListResponse<T>): T[] {
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  if (response.data && !Array.isArray(response.data)) {
    if (Array.isArray(response.data.items)) return response.data.items;
    if (Array.isArray(response.data.data)) return response.data.data;
  }
  return [];
}

function readMockInstitutions(): InstitutionAccount[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InstitutionAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMockInstitutions(institutions: InstitutionAccount[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(institutions));
}

function writeMockInstitutionUser(institution: InstitutionAccount, password: string): void {
  if (!isBrowser()) return;

  const raw = window.localStorage.getItem(LOCAL_REGISTERED_USERS_KEY);
  const existingUsers = raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : [];
  const nextUser = {
    id: institution.id,
    email: institution.email,
    password,
    role: 'institute',
    name: institution.name,
    institutionId: institution.id,
    institutionName: institution.name,
  };

  window.localStorage.setItem(
    LOCAL_REGISTERED_USERS_KEY,
    JSON.stringify([...existingUsers.filter((user) => user.email !== institution.email), nextUser])
  );
}

function createMockToken(): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `inst_${Date.now().toString(36)}_${randomPart}`;
}

function buildMockLink(token: string): string {
  return `/institution/accept-invitation?token=${encodeURIComponent(token)}`;
}

function toInstitutionFromInvitation(record: BackendInvitationRecord): InstitutionAccount {
  return {
    id: record.id ?? record.email ?? crypto.randomUUID(),
    name: normalizeName(record),
    email: record.email ?? '',
    status: normalizeStatus(record.status),
    invitationId: record.id,
    invitationToken: record.token,
    invitedAt: record.invited_at,
    acceptedAt: record.accepted_at,
  };
}

function toInstitutionFromInstitute(record: BackendInstituteRecord): InstitutionAccount {
  return {
    id: record.id ?? record._id ?? record.email ?? crypto.randomUUID(),
    name: normalizeName(record),
    email: record.email ?? '',
    status: normalizeStatus(record.status),
    invitedAt: record.created_at,
    acceptedAt: record.accepted_at,
  };
}

async function listBackendInstitutions(): Promise<InstitutionAccount[]> {
  const [institutesResponse, invitationsResponse] = await Promise.allSettled([
    api.get<BackendListResponse<BackendInstituteRecord>>('/institutes'),
    api.get<BackendListResponse<BackendInvitationRecord>>('/invitations'),
  ]);

  const institutions =
    institutesResponse.status === 'fulfilled'
      ? getArrayPayload(institutesResponse.value.data).map(toInstitutionFromInstitute)
      : [];

  const invitedInstitutions =
    invitationsResponse.status === 'fulfilled'
      ? getArrayPayload(invitationsResponse.value.data)
          .filter(isInstitutionInvitation)
          .map(toInstitutionFromInvitation)
      : [];

  if (institutesResponse.status === 'rejected' && invitationsResponse.status === 'rejected') {
    throw institutesResponse.reason;
  }

  const byEmail = new Map<string, InstitutionAccount>();
  [...institutions, ...invitedInstitutions].forEach((institution) => {
    const key = institution.email || institution.id;
    const existing = byEmail.get(key);
    byEmail.set(key, { ...existing, ...institution });
  });

  return Array.from(byEmail.values());
}

export async function listInstitutions(): Promise<InstitutionAccount[]> {
  try {
    const backendInstitutions = await listBackendInstitutions();
    if (backendInstitutions.length > 0) return backendInstitutions;
    return readMockInstitutions();
  } catch (err) {
    if (shouldUseLocalFallback(err)) return readMockInstitutions();
    throw new Error(extractApiError(err, 'Unable to load institutions.'));
  }
}

export async function inviteInstitution(data: InviteInstitutionRequest): Promise<InviteInstitutionResult> {
  const name = data.institutionName.trim();
  const email = data.email.trim().toLowerCase();

  try {
    const response = await api.post<ApiSuccess<BackendInvitationRecord>>('/invitations', {
      email,
      entity_type: 'institute',
      role: 'institute',
      name,
      institution_name: name,
      first_name: name,
      last_name: 'Institution',
    });

    const invitation = response.data.data;
    const token = invitation.token ?? createMockToken();
    const institution = toInstitutionFromInvitation({ ...invitation, email, name, institution_name: name });
    return {
      institution,
      invitationToken: token,
      mockEmailLink: buildMockLink(token),
      message: response.data.message ?? 'Institution invitation sent.',
    };
  } catch (err) {
    if (!shouldUseLocalFallback(err)) {
      throw new Error(extractApiError(err, 'Unable to invite institution.'));
    }

    const now = new Date().toISOString();
    const token = createMockToken();
    const invitationId = `mock-inv-${token}`;
    const institution: InstitutionAccount = {
      id: `mock-inst-${token}`,
      name,
      email,
      status: 'Invited',
      invitationId,
      invitationToken: token,
      invitedAt: now,
      acceptedAt: null,
      disabledAt: null,
    };

    const institutions = readMockInstitutions().filter((item) => item.email !== email);
    writeMockInstitutions([institution, ...institutions]);

    return {
      institution,
      invitationToken: token,
      mockEmailLink: buildMockLink(token),
      message: 'Mock invitation created. Use the invitation link to activate the institution account.',
    };
  }
}

export async function resendInstitutionInvitation(institutionId: string): Promise<InviteInstitutionResult> {
  const institutions = readMockInstitutions();
  const current = institutions.find((item) => item.id === institutionId || item.invitationId === institutionId);

  if (!current) {
    throw new Error('Institution invitation was not found.');
  }

  if (current.invitationId && !current.invitationId.startsWith('mock-inv-')) {
    try {
      const response = await api.post<ApiSuccess<BackendInvitationRecord>>(`/invitations/${current.invitationId}/resend`);
      const invitation = response.data.data;
      const token = invitation.token ?? current.invitationToken ?? createMockToken();
      const institution = { ...current, ...toInstitutionFromInvitation(invitation), invitationToken: token };
      return {
        institution,
        invitationToken: token,
        mockEmailLink: buildMockLink(token),
        message: response.data.message ?? 'Institution invitation resent.',
      };
    } catch (err) {
      if (!shouldUseLocalFallback(err)) {
        throw new Error(extractApiError(err, 'Unable to resend invitation.'));
      }
    }
  }

  const token = createMockToken();
  const updated: InstitutionAccount = {
    ...current,
    status: 'Invited',
    invitationToken: token,
    invitedAt: new Date().toISOString(),
  };
  writeMockInstitutions(institutions.map((item) => (item.id === current.id ? updated : item)));

  return {
    institution: updated,
    invitationToken: token,
    mockEmailLink: buildMockLink(token),
    message: 'Mock invitation resent. Use the new invitation link to activate the account.',
  };
}

export async function disableInstitution(institutionId: string): Promise<InstitutionAccount> {
  try {
    await api.patch(`/institutes/${institutionId}/status`, { status: 'disabled' });
  } catch (err) {
    if (!shouldUseLocalFallback(err)) {
      throw new Error(extractApiError(err, 'Unable to disable institution.'));
    }
  }

  const institutions = readMockInstitutions();
  const updated = institutions.map((institution) =>
    institution.id === institutionId
      ? { ...institution, status: 'Disabled' as const, disabledAt: new Date().toISOString() }
      : institution
  );
  writeMockInstitutions(updated);

  const disabled = updated.find((institution) => institution.id === institutionId);
  if (disabled) return disabled;

  return {
    id: institutionId,
    name: 'Institution',
    email: '',
    status: 'Disabled',
    disabledAt: new Date().toISOString(),
  };
}

export async function getInstitutionInvitationByToken(token: string): Promise<InstitutionInvitationDetails | null> {
  const invitation = readMockInstitutions().find((item) => item.invitationToken === token);
  if (!invitation) return null;

  return {
    token,
    institutionName: invitation.name,
    email: invitation.email,
    status: invitation.status,
    acceptedAt: invitation.acceptedAt,
  };
}

export async function acceptInstitutionInvitation(
  data: AcceptInstitutionInvitationRequest
): Promise<ApiSuccess<InstitutionAccount>> {
  if (data.password !== data.confirmPassword) {
    throw new Error('Password and confirm password must match.');
  }

  const invitation = readMockInstitutions().find((item) => item.invitationToken === data.token);
  const institutionName = invitation?.name ?? 'Institution';

  try {
    const response = await api.post<ApiSuccess<BackendInstituteRecord>>('/auth/invitations/accept', {
      token: data.token,
      password: data.password,
      name: institutionName,
    });

    const institution = toInstitutionFromInstitute(response.data.data);
    return {
      success: true,
      message: response.data.message ?? 'Institution account activated.',
      data: institution,
    };
  } catch (err) {
    if (!shouldUseLocalFallback(err)) {
      throw new Error(extractApiError(err, 'Unable to accept invitation.'));
    }

    if (!invitation) {
      throw new Error('Invitation link is invalid or expired.');
    }

    if (invitation.status === 'Active') {
      throw new Error('This invitation has already been accepted.');
    }

    const activated: InstitutionAccount = {
      ...invitation,
      status: 'Active',
      acceptedAt: new Date().toISOString(),
    };

    writeMockInstitutions(readMockInstitutions().map((item) => (item.id === activated.id ? activated : item)));
    writeMockInstitutionUser(activated, data.password);

    return {
      success: true,
      message: 'Institution account activated.',
      data: activated,
    };
  }
}
