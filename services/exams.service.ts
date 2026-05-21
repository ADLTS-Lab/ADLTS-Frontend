import api from '@/lib/api';

import { extractApiError } from './api-utils';

/**
 * MOCK-ONLY: Exam endpoints are not in the current Postman user-management collection.
 * When the backend adds them (e.g. GET /exams, GET /exams/:id, GET /admin/exams/active),
 * replace the mock fallbacks below with real api calls — pages stay unchanged.
 */

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

/** Candidate exam history — MOCK-ONLY until GET /exams (or /candidates/me/exams) exists */
export async function listCandidateExams(): Promise<ExamSummary[]> {
  try {
    const response = await api.get<{ success: boolean; data: ExamSummary[] }>('/exams');
    if (response.data?.data?.length) return response.data.data;
  } catch {
    // fall through to mock
  }
  return MOCK_EXAM_SUMMARIES;
}

/** Candidate exam detail — MOCK-ONLY until GET /exams/:id exists */
export function getCandidateExamById(examId: string): ExamDetail | null {
  return MOCK_EXAM_DETAILS.find((exam) => exam.id === examId) ?? null;
}

/** Dashboard aggregate stats — MOCK-ONLY until backend exposes stats endpoint */
export async function getCandidateExamStats(): Promise<CandidateExamStats> {
  try {
    const response = await api.get<{ success: boolean; data: CandidateExamStats }>('/exams/stats');
    if (response.data?.data) return response.data.data;
  } catch {
    // fall through
  }

  const exams = MOCK_EXAM_SUMMARIES;
  const passed = exams.filter((e) => e.result === 'Pass').length;
  const avg = exams.reduce((sum, e) => sum + e.score, 0) / exams.length;

  return {
    totalExams: exams.length,
    averageScore: Math.round(avg),
    passedExams: passed,
    incomplete: exams.length - passed,
  };
}

/** Dashboard recent rows — MOCK-ONLY */
export async function getDashboardPastExams(): Promise<DashboardPastExam[]> {
  try {
    const response = await api.get<{ success: boolean; data: DashboardPastExam[] }>('/exams/recent');
    if (response.data?.data?.length) return response.data.data;
  } catch {
    // fall through
  }
  return MOCK_DASHBOARD_PAST_EXAMS;
}

/** Admin live monitor — MOCK-ONLY until GET /admin/exams/active (or similar) exists */
export async function listActiveExams(): Promise<ActiveExam[]> {
  try {
    const response = await api.get<{ success: boolean; data: ActiveExam[] }>('/admin/exams/active');
    if (response.data?.data?.length) return response.data.data;
  } catch {
    // fall through
  }
  return MOCK_ACTIVE_EXAMS;
}

/** Optional: wrap errors for pages that need explicit failure */
export async function listActiveExamsSafe(): Promise<{ data: ActiveExam[]; error: string | null }> {
  try {
    return { data: await listActiveExams(), error: null };
  } catch (err) {
    return { data: [], error: extractApiError(err, 'Unable to load active exams.') };
  }
}
