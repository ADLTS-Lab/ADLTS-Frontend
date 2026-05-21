import { ApiSuccess } from './api-utils';

export type ReviewMetrics = {
  pendingReviews: number;
  completedToday: number;
  flaggedIssues: number;
};

export type ExamReview = {
  id: string;
  candidateName: string;
  examDate: string;
  issueType: 'Identity Mismatch' | 'Suspicious Behavior' | 'Hardware Failure';
  status: 'Pending' | 'In Progress';
};

export async function getReviewMetrics(): Promise<ApiSuccess<ReviewMetrics>> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  return {
    success: true,
    data: {
      pendingReviews: 12,
      completedToday: 28,
      flaggedIssues: 4,
    },
  };
}

export async function getFlaggedCandidates(): Promise<ApiSuccess<ExamReview[]>> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  return {
    success: true,
    data: [
      {
        id: 'rev-1',
        candidateName: 'Abebe Tesfaye',
        examDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        issueType: 'Identity Mismatch',
        status: 'Pending',
      },
      {
        id: 'rev-2',
        candidateName: 'Chala Dinku',
        examDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        issueType: 'Suspicious Behavior',
        status: 'In Progress',
      },
      {
        id: 'rev-3',
        candidateName: 'Sara Alemu',
        examDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        issueType: 'Hardware Failure',
        status: 'Pending',
      },
    ],
  };
}
