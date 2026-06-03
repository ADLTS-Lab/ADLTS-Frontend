import api from '@/lib/api';

import { ApiResponse, extractApiError, extractData } from './api-utils';

export interface CandidateAppealRequest {
  testId: string;
  sessionId: string;
  reason: string;
}

export interface CandidateAppealResponse {
  id: string;
}

export async function createCandidateAppeal(payload: CandidateAppealRequest): Promise<CandidateAppealResponse> {
  try {
    const response = await api.post<ApiResponse<unknown>>('/appeals', {
      test_id: payload.testId,
      session_id: payload.sessionId,
      reason: payload.reason,
    });
    const data = extractData<Record<string, unknown>>(response.data) ?? response.data;
    const id = data && typeof data === 'object' ? String((data as Record<string, unknown>).id ?? '') : '';

    return { id };
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to submit appeal.'));
  }
}
