import api from '@/lib/api';

import { ApiSuccess, extractApiError } from './api-utils';

export type ExamResult = 'Pass' | 'Fail';

export interface ExamSummary {
  id: string;
  date: string;
  examType: string;
  score: number;
  result: ExamResult;
  center: string;
}

export interface ExamDetail extends ExamSummary {
  title: string;
  speed: string;
  lane: string;
  braking: string;
  trafficSigns: string;
  notes: string;
}

export interface CandidateExamStats {
  totalExams: number;
  averageScore: number;
  passedExams: number;
  incomplete: number;
}

export interface DashboardPastExam {
  date: string;
  type: string;
  score: string;
  status: ExamResult;
  color: 'green' | 'red';
}

export type ActiveExamStatus = 'Stable' | 'Warning' | 'Excellent' | 'Review';

export interface ActiveExam {
  id: string;
  candidateName: string;
  center: string;
  progress: number;
  liveScore: number;
  violations: number;
  status: ActiveExamStatus;
}

export interface UpcomingExam {
  id: string;
  date: string;
  title: string;
  center: string;
  status?: string;
}

type ExamEnvelope<T> = ApiSuccess<T>;

const MOCK_EXAM_SUMMARIES: ExamSummary[] = [
  { id: 'exam-001', date: '2026-05-02', examType: 'Theory', score: 88, result: 'Pass', center: 'Bole Test Center' },
  { id: 'exam-002', date: '2026-05-09', examType: 'Road Signs', score: 94, result: 'Pass', center: 'Bole Test Center' },
  { id: 'exam-003', date: '2026-05-14', examType: 'Practical', score: 61, result: 'Fail', center: 'Bole Test Center' },
  { id: 'exam-004', date: '2026-05-18', examType: 'Theory Retake', score: 83, result: 'Pass', center: 'Bole Test Center' },
];

const MOCK_EXAM_DETAILS: ExamDetail[] = [
  {
    id: 'exam-001',
    title: 'Theory Exam',
    date: '2026-05-02',
    examType: 'Theory',
    score: 88,
    result: 'Pass',
    center: 'Bole Test Center',
    speed: 'N/A',
    lane: 'N/A',
    braking: 'N/A',
    trafficSigns: '92%',
    notes: 'Strong understanding of road rules and safe driving principles.',
  },
  {
    id: 'exam-002',
    title: 'Road Signs Exam',
    date: '2026-05-09',
    examType: 'Road Signs',
    score: 94,
    result: 'Pass',
    center: 'Bole Test Center',
    speed: 'N/A',
    lane: 'N/A',
    braking: 'N/A',
    trafficSigns: '98%',
    notes: 'Excellent recognition of signs and signals.',
  },
  {
    id: 'exam-003',
    title: 'Practical Exam',
    date: '2026-05-14',
    examType: 'Practical',
    score: 61,
    result: 'Fail',
    center: 'Bole Test Center',
    speed: '72%',
    lane: '58%',
    braking: '61%',
    trafficSigns: '64%',
    notes: 'Needs improvement in lane discipline and smoother braking.',
  },
  {
    id: 'exam-004',
    title: 'Theory Retake',
    date: '2026-05-18',
    examType: 'Theory Retake',
    score: 83,
    result: 'Pass',
    center: 'Bole Test Center',
    speed: 'N/A',
    lane: 'N/A',
    braking: 'N/A',
    trafficSigns: '89%',
    notes: 'Passed with a stronger grasp of the updated question set.',
  },
];

const MOCK_ACTIVE_EXAMS: ActiveExam[] = [
  {
    id: 'live-001',
    candidateName: 'Abebe Tesfaye',
    center: 'Bole Test Center',
    progress: 72,
    liveScore: 84,
    violations: 1,
    status: 'Stable',
  },
  {
    id: 'live-002',
    candidateName: 'Meklit Abate',
    center: 'Adama Center',
    progress: 48,
    liveScore: 76,
    violations: 2,
    status: 'Warning',
  },
  {
    id: 'live-003',
    candidateName: 'Samuel Desta',
    center: 'Bahir Dar Center',
    progress: 91,
    liveScore: 93,
    violations: 0,
    status: 'Excellent',
  },
  {
    id: 'live-004',
    candidateName: 'Hana Tadesse',
    center: 'Hawassa Center',
    progress: 29,
    liveScore: 68,
    violations: 3,
    status: 'Review',
  },
];

const MOCK_DASHBOARD_PAST_EXAMS: DashboardPastExam[] = [
  { date: 'Sep 15, 2024', type: 'Theory Mock #4', score: '88/100', status: 'Pass', color: 'green' },
  { date: 'Aug 28, 2024', type: 'Traffic Signs Quiz', score: '94/100', status: 'Pass', color: 'green' },
  { date: 'Aug 10, 2024', type: 'Theory Mock #3', score: '42/100', status: 'Fail', color: 'red' },
];

const MOCK_UPCOMING_EXAM: UpcomingExam = {
  id: 'upcoming-001',
  date: 'Oct 24, 2024',
  title: 'Practical Exam',
  center: 'Addis Ababa Center',
  status: 'Scheduled',
};

function isMissingEndpoint(err: unknown): boolean {
  if (typeof err !== 'object' || err === null || !('response' in err)) return false;
  const status = (err as { response?: { status?: number } }).response?.status;
  return status === 404 || status === 405;
}

async function getEnvelope<T>(path: string): Promise<T | null> {
  try {
    const response = await api.get<ExamEnvelope<T>>(path);
    return response.data?.data ?? null;
  } catch (err) {
    if (isMissingEndpoint(err)) {
      return null;
    }

    throw new Error(extractApiError(err, 'Unable to load exam data.'));
  }
}

async function getFromFirstAvailable<T>(paths: string[]): Promise<T | null> {
  for (const path of paths) {
    const data = await getEnvelope<T>(path);
    if (data !== null) {
      return data;
    }
  }
  return null;
}

function buildCandidateStatsFromSummaries(exams: ExamSummary[]): CandidateExamStats {
  if (!exams.length) {
    return {
      totalExams: 0,
      averageScore: 0,
      passedExams: 0,
      incomplete: 0,
    };
  }

  const passedExams = exams.filter((exam) => exam.result === 'Pass').length;
  const averageScore = Math.round(exams.reduce((sum, exam) => sum + exam.score, 0) / exams.length);

  return {
    totalExams: exams.length,
    averageScore,
    passedExams,
    incomplete: exams.length - passedExams,
  };
}

function getMockCandidateExamById(examId: string): ExamDetail | null {
  return MOCK_EXAM_DETAILS.find((exam) => exam.id === examId) ?? null;
}

function normalizeUpcomingExam(data: unknown): UpcomingExam | null {
  if (!data || typeof data !== 'object') return null;

  const exam = data as Partial<UpcomingExam> & {
    examType?: string;
    name?: string;
    center?: string;
    location?: string;
    starts_at?: string;
    date?: string;
  };

  const date = exam.date ?? exam.starts_at?.slice(0, 10);
  if (!date) return null;

  return {
    id: exam.id ?? 'upcoming-exam',
    date,
    title: exam.title ?? exam.examType ?? exam.name ?? 'Upcoming Exam',
    center: exam.center ?? exam.location ?? 'Test Center',
    status: exam.status,
  };
}

/** Candidate exam history — prefers backend data, falls back only when the endpoint is missing. */
export async function listCandidateExams(): Promise<ExamSummary[]> {
  const data = await getFromFirstAvailable<ExamSummary[]>(['/candidates/me/exams', '/exams']);
  return data ?? MOCK_EXAM_SUMMARIES;
}

/** Candidate exam detail — prefers backend data, falls back only when the endpoint is missing. */
export async function fetchCandidateExamById(examId: string): Promise<ExamDetail | null> {
  const data = await getFromFirstAvailable<ExamDetail>([
    `/candidates/me/exams/${examId}`,
    `/exams/${examId}`,
  ]);

  return data ?? getMockCandidateExamById(examId);
}

/** Backward-compatible sync wrapper used by the current detail page. */
export function getCandidateExamById(examId: string): ExamDetail | null {
  return getMockCandidateExamById(examId);
}

/** Dashboard aggregate stats — prefers backend data, falls back only when the endpoint is missing. */
export async function getCandidateExamStats(): Promise<CandidateExamStats> {
  const data = await getFromFirstAvailable<CandidateExamStats>(['/candidates/me/exams/stats', '/exams/stats']);
  return data ?? buildCandidateStatsFromSummaries(MOCK_EXAM_SUMMARIES);
}

/** Dashboard recent rows — prefers backend data, falls back only when the endpoint is missing. */
export async function getDashboardPastExams(): Promise<DashboardPastExam[]> {
  const data = await getFromFirstAvailable<DashboardPastExam[]>(['/candidates/me/exams/recent', '/exams/recent']);
  return data ?? MOCK_DASHBOARD_PAST_EXAMS;
}

/** Upcoming candidate exam — used by the dashboard hero/status card. */
export async function getCandidateUpcomingExam(): Promise<UpcomingExam> {
  const data = await getFromFirstAvailable<UpcomingExam>([
    '/candidates/me/exams/upcoming',
    '/candidates/me/upcoming-exam',
    '/exams/upcoming',
  ]);

  return normalizeUpcomingExam(data) ?? MOCK_UPCOMING_EXAM;
}

/** Admin live monitor — prefers backend data, falls back only when the endpoint is missing. */
export async function listActiveExams(): Promise<ActiveExam[]> {
  const data = await getFromFirstAvailable<ActiveExam[]>(['/admin/exams/active', '/exams/active']);
  return data ?? MOCK_ACTIVE_EXAMS;
}

/** Optional: wrap errors for pages that need explicit failure */
export async function listActiveExamsSafe(): Promise<{ data: ActiveExam[]; error: string | null }> {
  try {
    return { data: await listActiveExams(), error: null };
  } catch (err) {
    return { data: [], error: extractApiError(err, 'Unable to load active exams.') };
  }
}
