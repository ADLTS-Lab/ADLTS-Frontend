import api from '@/lib/api';
import { extractApiError, type ApiSuccess } from './api-utils';

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
  invitationToken?: string;
  invitationLink?: string;
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

function buildAcceptLink(token?: string): string {
  return token ? `/accept-invitation?token=${encodeURIComponent(token)}` : '';
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
    return await listBackendInstitutions();
  } catch (err) {
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
    });

    const invitation: BackendInvitationRecord = response.data.data || {};
    const token = invitation.token;
    const institution = toInstitutionFromInvitation({ ...invitation, email, name, institution_name: name });
    return {
      institution,
      invitationToken: token,
      invitationLink: buildAcceptLink(token),
      message: response.data.message ?? 'Institution invitation sent.',
    };
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to invite institution.'));
  }
}

export async function resendInstitutionInvitation(institutionId: string): Promise<InviteInstitutionResult> {
  try {
    const response = await api.post<ApiSuccess<BackendInvitationRecord>>(`/invitations/${institutionId}/resend`);
    const invitation = response.data.data;
    const token = invitation?.token;
    return {
      institution: toInstitutionFromInvitation({ ...invitation, id: institutionId, email: invitation?.email }),
      invitationToken: token,
      invitationLink: buildAcceptLink(token),
      message: response.data.message ?? 'Institution invitation resent.',
    };
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to resend invitation.'));
  }
}

export async function disableInstitution(institutionId: string): Promise<InstitutionAccount> {
  try {
    await api.patch(`/institutes/${institutionId}/status`, { status: 'disabled' });
    return {
      id: institutionId,
      name: 'Institution',
      email: '',
      status: 'Disabled',
      disabledAt: new Date().toISOString(),
    };
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to disable institution.'));
  }
}

export async function getInstitutionInvitationByToken(token: string): Promise<InstitutionInvitationDetails | null> {
  void token;
  return null;
}

export async function acceptInstitutionInvitation(
  data: AcceptInstitutionInvitationRequest
): Promise<ApiSuccess<InstitutionAccount>> {
  if (data.password !== data.confirmPassword) {
    throw new Error('Password and confirm password must match.');
  }

  try {
    const response = await api.post<ApiSuccess<BackendInstituteRecord>>('/auth/invitations/accept', {
      token: data.token,
      password: data.password,
      name: 'Institution',
    });

    const institutionRecord: BackendInstituteRecord = response.data.data || {};
    const institution = toInstitutionFromInstitute(institutionRecord);
    return {
      success: true,
      message: response.data.message ?? 'Institution account activated.',
      data: institution,
    };
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to accept invitation.'));
  }
}
