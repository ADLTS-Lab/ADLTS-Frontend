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
  first_name: string;
  last_name: string;
  status?: InvitationStatus;
  invited_at?: string;
  expires_at?: string;
  accepted_at?: string | null;
}

export interface CreateInvitationRequest {
  email: string;
  entity_type: InvitationEntityType;
  first_name: string;
  last_name: string;
}

export interface CreateInvitationResponse extends ApiSuccess<InvitationRecord> {}

export interface ListInvitationsResponse extends ApiSuccess<InvitationRecord[]> {}

export interface GetInvitationResponse extends ApiSuccess<InvitationRecord> {}

function isMissingEndpoint(err: unknown): boolean {
  if (typeof err !== 'object' || err === null || !('response' in err)) return false;
  const status = (err as { response?: { status?: number } }).response?.status;
  return status === 404 || status === 405;
}

export async function createInvitation(
  data: CreateInvitationRequest
): Promise<CreateInvitationResponse> {
  try {
    const response = await api.post<CreateInvitationResponse>('/invitations', data);
    return response.data;
  } catch (err) {
    if (isMissingEndpoint(err)) {
      return {
        success: false,
        message: 'Invitation endpoint is not available yet.',
        data: {
          id: '',
          email: data.email,
          entity_type: data.entity_type,
          first_name: data.first_name,
          last_name: data.last_name,
          status: 'missing-endpoint',
        },
      };
    }

    throw new Error(extractApiError(err, 'Unable to create invitation.'));
  }
}

export async function listInvitations(): Promise<InvitationRecord[]> {
  try {
    const response = await api.get<ListInvitationsResponse>('/invitations');
    return response.data?.data ?? [];
  } catch (err) {
    if (isMissingEndpoint(err)) {
      return [];
    }

    throw new Error(extractApiError(err, 'Unable to load invitations.'));
  }
}

export async function getInvitationById(invitationId: string): Promise<InvitationRecord | null> {
  try {
    const response = await api.get<GetInvitationResponse>(`/invitations/${invitationId}`);
    return response.data?.data ?? null;
  } catch (err) {
    if (isMissingEndpoint(err)) {
      return null;
    }

    throw new Error(extractApiError(err, 'Unable to load invitation.'));
  }
}

export async function resendInvitation(invitationId: string): Promise<InvitationRecord | null> {
  try {
    const response = await api.post<GetInvitationResponse>(`/invitations/${invitationId}/resend`);
    return response.data?.data ?? null;
  } catch (err) {
    if (isMissingEndpoint(err)) {
      return null;
    }

    throw new Error(extractApiError(err, 'Unable to resend invitation.'));
  }
}

export async function deleteInvitation(invitationId: string): Promise<boolean> {
  try {
    await api.delete(`/invitations/${invitationId}`);
    return true;
  } catch (err) {
    if (isMissingEndpoint(err)) {
      return false;
    }

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