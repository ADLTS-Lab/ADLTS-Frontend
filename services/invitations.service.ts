import api from '@/lib/api';

import { ApiSuccess, extractApiError } from './api-utils';

export type InvitationEntityType =
  | 'candidate'
  | 'admin'
  | 'super_admin'
  | 'expert'
  | 'institute'
  | 'transport_authority';

export type InvitationStatus = 'pending' | 'sent' | 'accepted' | 'expired' | 'revoked' | string;

export interface InvitationRecord {
  id: string;
  email: string;
  entity_type: InvitationEntityType;
  first_name?: string;
  last_name?: string;
  status?: InvitationStatus;
  token?: string;
  invited_at?: string;
  created_at?: string;
  expires_at?: string;
  accepted_at?: string | null;
  used_at?: string | null;
}

export interface CreateInvitationRequest {
  email: string;
  entity_type: InvitationEntityType;
  test_center_id?: string;
}

export interface CreateInvitationResponse extends ApiSuccess<InvitationRecord> {}

export interface ListInvitationsResponse extends ApiSuccess<InvitationRecord[]> {}

export interface GetInvitationResponse extends ApiSuccess<InvitationRecord> {}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  fayida_id?: string;
  employee_id?: string;
}

export async function createInvitation(
  data: CreateInvitationRequest
): Promise<CreateInvitationResponse> {
  try {
    const response = await api.post<CreateInvitationResponse>('/invitations', data);
    return response.data;
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to create invitation.'));
  }
}

export async function listInvitations(): Promise<InvitationRecord[]> {
  try {
    const response = await api.get<ListInvitationsResponse>('/invitations');
    return response.data?.data ?? [];
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load invitations.'));
  }
}

export async function getInvitationById(invitationId: string): Promise<InvitationRecord | null> {
  try {
    const response = await api.get<GetInvitationResponse>(`/invitations/${invitationId}`);
    return response.data?.data ?? null;
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load invitation.'));
  }
}

export async function resendInvitation(invitationId: string): Promise<InvitationRecord | null> {
  try {
    const response = await api.post<GetInvitationResponse>(`/invitations/${invitationId}/resend`);
    return response.data?.data ?? null;
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to resend invitation.'));
  }
}

export async function deleteInvitation(invitationId: string): Promise<boolean> {
  try {
    await api.delete(`/invitations/${invitationId}`);
    return true;
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to delete invitation.'));
  }
}

export async function listInvitationsSafe(): Promise<{ data: InvitationRecord[]; error: string | null }> {
  try {
    return { data: await listInvitations(), error: null };
  } catch (err) {
    return { data: [], error: extractApiError(err, 'Unable to load invitations.') };
  }
}

export async function acceptInvitation(data: AcceptInvitationRequest): Promise<ApiSuccess<unknown>> {
  try {
    const response = await api.post<ApiSuccess<unknown>>('/auth/invitations/accept', data);
    return response.data;
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to accept invitation.'));
  }
}
