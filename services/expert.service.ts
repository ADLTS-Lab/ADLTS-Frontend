import api from '@/lib/api';

import { ApiListResponse, ApiResponse, extractApiError, extractList } from './api-utils';

export type ReviewMetrics = {
  pendingReviews: number;
  completedToday: number;
  flaggedIssues: number;
};

export type ExamReview = {
  id: string;
  candidateName: string;
  examDate: string;
  issueType: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
};

function toStr(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function toDate(value: unknown): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }

  if (typeof value === 'number') {
    return new Date(value).toISOString();
  }

  return new Date().toISOString();
}

function normalizeReview(raw: unknown): ExamReview | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;

  const statusRaw = toStr(data.status ?? data.state ?? 'Pending', 'Pending').toLowerCase();
  const status: ExamReview['status'] = statusRaw.includes('resolved') || statusRaw.includes('completed')
    ? 'Resolved'
    : statusRaw.includes('progress')
      ? 'In Progress'
      : 'Pending';
  const candidate = data.candidate;
  const nestedCandidateName = typeof candidate === 'object' && candidate !== null ? (candidate as Record<string, unknown>).name : undefined;

  return {
    id: toStr(data.id ?? data.appeal_id ?? data.review_id, ''),
    candidateName: toStr(data.candidateName ?? data.candidate_name ?? nestedCandidateName ?? data.name, 'Candidate'),
    examDate: toDate(data.examDate ?? data.exam_date ?? data.created_at ?? data.createdAt),
    issueType: toStr(data.issueType ?? data.issue_type ?? data.reason ?? data.description, 'Potential Integrity Issue'),
    status,
  };
}

function normalizeMetrics(reviews: ExamReview[]): ReviewMetrics {
  const pendingReviews = reviews.filter((review) => review.status === 'Pending').length;
  return {
    pendingReviews,
    completedToday: reviews.filter((review) => review.status === 'Resolved').length,
    flaggedIssues: reviews.length,
  };
}

async function fetchPendingAppeals(): Promise<ExamReview[]> {
  try {
    const response = await api.get<ApiListResponse<unknown>>('/appeals', {
      params: {
        status: 'pending',
        page: 1,
        limit: 20,
      },
    });

    return extractList<unknown>(response.data)
      .map(normalizeReview)
      .filter((review): review is ExamReview => Boolean(review));
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load pending appeals.'));
  }
}

/** Pending appeals — GET /appeals?status=pending&page=1&limit=20 */
export async function getFlaggedCandidates(): Promise<ApiResponse<ExamReview[]>> {
  const data = await fetchPendingAppeals();
  return {
    success: true,
    data,
  };
}

/** Review metrics derived from pending appeals */
export async function getReviewMetrics(): Promise<ApiResponse<ReviewMetrics>> {
  const reviews = await fetchPendingAppeals();
  return {
    success: true,
    data: normalizeMetrics(reviews),
  };
}

/** Resolve appeal — PATCH /appeals/{id}/resolve */
export async function resolveAppeal(appealId: string): Promise<ApiResponse<ExamReview>> {
  try {
    const response = await api.patch<ApiResponse<ExamReview>>(`/appeals/${encodeURIComponent(appealId)}/resolve`, {
      decision: 'accepted',
    });
    return {
      success: !!response.data?.success,
      data: response.data?.data || {
        id: appealId,
        candidateName: 'Unknown',
        examDate: new Date().toISOString(),
        issueType: 'Resolved appeal',
        status: 'Resolved',
      },
      message: response.data?.message,
    };
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to resolve appeal.'));
  }
}

export async function uploadExpertPhoto(file: File): Promise<ApiResponse<{ photoUrl: string }>> {
  try {
    const form = new FormData();
    form.append('file', file);

    const response = await api.patch<ApiResponse<unknown>>('/experts/me/photo', form);
    const payload = response.data?.data ?? response.data;
    const rawUrl =
      payload && typeof payload === 'object'
        ? (payload as Record<string, unknown>).photoUrl ?? (payload as Record<string, unknown>).photo_url ?? (payload as Record<string, unknown>).url
        : undefined;

    const photoUrl = typeof rawUrl === 'string' ? rawUrl : '';

    if (!photoUrl) {
      throw new Error('Upload response did not include an image URL.');
    }

    return {
      success: !!response.data?.success,
      data: { photoUrl },
      message: response.data?.message,
    };
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to upload expert photo.'));
  }
}
