import api from '@/lib/api';

import { ApiResponse, extractApiError } from './api-utils';

/** Postman: GET /candidates, PATCH /candidates/:id/status, GET|PATCH /candidates/me */
export type CandidateStatus = 'active' | 'suspended';

export interface CandidateRecord {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  status: CandidateStatus;
  licenseCategory: string;
  testCenter: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  address?: string;
}

export interface ListCandidatesParams {
  search?: string;
  page?: number;
  status?: string;
  gender?: string;
  city?: string;
}

export interface UpdateCandidateStatusResult {
  candidate: CandidateRecord;
  message: string;
}

function extractPhotoUrl(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const data = payload as Record<string, unknown>;
  const rawUrl =
    data.photoUrl ??
    data.photo_url ??
    data.profile_photo ??
    data.avatar ??
    data.avatarUrl ??
    data.avatar_url ??
    data.url ??
    data.image_url;
  return typeof rawUrl === 'string' ? rawUrl : '';
}

/** Admin · SuperAdmin — GET /candidates */
export async function listCandidates(params?: ListCandidatesParams): Promise<CandidateRecord[]> {
  try {
    const response = await api.get<{ success: boolean; data: CandidateRecord[] }>('/candidates', {
      params: params?.search ? { search: params.search } : undefined,
    });
    return response.data?.data ?? [];
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load candidates.'));
  }
}

/** Admin · SuperAdmin — PATCH /candidates/:id/status */
export async function updateCandidateStatus(
  id: string,
  status: CandidateStatus
): Promise<UpdateCandidateStatusResult> {
  try {
    const response = await api.patch<{
      success: boolean;
      message?: string;
      data: CandidateRecord;
    }>(`/candidates/${id}/status`, { status });

    return {
      candidate: response.data.data,
      message: response.data.message ?? 'Candidate status updated successfully.',
    };
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to update candidate status.'));
  }
}

/** Candidate self — GET /candidates/me */
export async function getMyCandidateProfile(): Promise<CandidateRecord | null> {
  try {
    const response = await api.get<{ success: boolean; data: CandidateRecord }>('/candidates/me');
    return response.data?.data ?? null;
  } catch {
    return null;
  }
}

/** Candidate self — PATCH /candidates/me */
export async function updateMyCandidateProfile(
  data: Partial<Pick<CandidateRecord, 'first_name' | 'last_name' | 'phone' | 'licenseCategory' | 'testCenter' | 'birth_date' | 'gender' | 'address'>>
): Promise<CandidateRecord | null> {
  try {
    const response = await api.patch<{ success: boolean; data: CandidateRecord }>('/candidates/me', data);
    return response.data?.data ?? null;
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to update profile.'));
  }
}

export async function uploadMyCandidatePhoto(file: File): Promise<ApiResponse<{ photoUrl: string }>> {
  try {
    const form = new FormData();
    form.append('file', file);

    const response = await api.patch<ApiResponse<unknown>>('/candidates/me/photo', form);
    const payload = response.data?.data ?? response.data;
    const photoUrl = extractPhotoUrl(payload);

    if (!photoUrl) {
      throw new Error('Upload response did not include an image URL.');
    }

    return {
      success: !!response.data?.success,
      data: { photoUrl },
      message: response.data?.message,
    };
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to upload profile photo.'));
  }
}
