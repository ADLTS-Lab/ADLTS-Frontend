import api from '@/lib/api';

import { ApiListResponse, ApiResponse, extractApiError, extractData, extractList } from './api-utils';

export type ExamResult = 'Pass' | 'Fail' | 'Pending' | 'Unavailable';

export interface ExamSummary {
  id: string;
  date: string;
  examType: string;
  score: number;
  result: ExamResult;
  center: string;
  visible?: boolean;
}

export interface ExamDetail extends ExamSummary {
  title: string;
  speed: string;
  lane: string;
  braking: string;
  trafficSigns: string;
  notes: string;
  visible: boolean;
  sessionId?: string;
  passThreshold?: number;
  weakestManeuver?: string;
  strengthsNarrative?: string;
  weaknessesNarrative?: string;
  recommendedFocus?: string;
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
  color: 'green' | 'red' | 'amber';
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

export interface ActiveExamMonitorStatus {
  testId: string;
  status: string;
  deviceId?: string;
  startedAt?: string;
  completedAt?: string;
  abortReason?: string;
}

export interface ActiveExamLiveMetrics {
  testId: string;
  status: string;
  currentSession?: number;
  frameCount: number;
  runningAvgIoU: number;
  deviceHealthOK: boolean;
}

export interface UpcomingExam {
  id: string;
  date: string;
  title: string;
  center: string;
  status?: string;
}

export interface CandidatePendingTest {
  id: string;
  bookingId: string;
  candidateId: string;
  testCenterId: string;
  testPlanId: string;
  deviceId?: string;
  testLevelCode: string;
  status: string;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  bookingWindowHours?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
}

export interface DeviceCheckinPayload {
  deviceCode: string;
  password: string;
  testCenterId: string;
}

interface RawEnvelope<T> extends ApiResponse<T> {
  payload?: T;
}

function coerceNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function coerceString(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  return `${value}`;
}

function extractListCandidateData(value: unknown): unknown[] {
  const list = extractList<unknown>(value);
  if (list.length) return list;

  if (!value || typeof value !== 'object') return [];

  const payload = value as Record<string, unknown>;
  const nested =
    payload.data ??
    payload.tests ??
    payload.exams ??
    payload.results ??
    payload.items ??
    payload.payload ??
    (payload.meta && typeof payload.meta === 'object' && 'items' in (payload.meta as Record<string, unknown>)
      ? (payload.meta as Record<string, unknown>).items
      : undefined);

  const nestedItems = extractList<unknown>(nested);
  return nestedItems.length ? nestedItems : [];
}

function normalizeResult(value: unknown): ExamResult {
  const raw = coerceString(value, 'Pending').toLowerCase();
  if (['pass', 'passed', 'passsed', 'success', 'completed', 'approved'].includes(raw)) {
    return 'Pass';
  }

  if (['fail', 'failed', 'faild', 'rejected', 'incomplete', 'no_pass'].includes(raw)) {
    return 'Fail';
  }

  return raw === 'pending' || raw === 'processing' || raw === 'review' || raw === 'unavailable'
    ? 'Pending'
    : 'Unavailable';
}

function normalizeExamSummary(raw: unknown): ExamSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Record<string, unknown>;

  const id = coerceString(candidate.id || candidate.exam_id || candidate.test_id || candidate.testId || candidate._id || '', '').trim();
  if (!id) return null;

  const score = coerceNumber(candidate.score ?? candidate.total_score ?? candidate.result_score);
  const result = normalizeResult(candidate.result ?? candidate.status ?? candidate.outcome ?? candidate.pass);
  const center = coerceString(candidate.center ?? candidate.center_name ?? candidate.location ?? 'Test Center');
  const examType = coerceString(candidate.examType ?? candidate.exam_type ?? candidate.type ?? candidate.title ?? candidate.name ?? 'Exam');
  const date = coerceString(candidate.date ?? candidate.exam_date ?? candidate.completed_at ?? candidate.created_at ?? candidate.updated_at)
    || new Date().toISOString();
  const visible = candidate.visible ?? candidate.is_visible ?? candidate.result_visible ?? candidate.visible_to_candidate;

  return {
    id,
    date,
    examType,
    score,
    result,
    center,
    visible: visible !== false,
  };
}

function normalizeExamDetail(raw: unknown): ExamDetail | null {
  if (!raw || typeof raw !== 'object') return null;

  const base = normalizeExamSummary(raw);
  if (!base) return null;

  const candidate = raw as Record<string, unknown>;
  const maneuverScores = Array.isArray(candidate.maneuver_scores)
    ? (candidate.maneuver_scores as Array<Record<string, unknown>>)
    : [];
  const sessionResults = Array.isArray(candidate.session_results)
    ? (candidate.session_results as Array<Record<string, unknown>>)
    : Array.isArray(candidate.sessions)
      ? (candidate.sessions as Array<Record<string, unknown>>)
      : [];
  const firstSession = sessionResults.find((item) => item?.session_id || item?.sessionId);
  const metrics =
    (candidate.metrics as Record<string, unknown> | undefined) ??
    (candidate.result as Record<string, unknown> | undefined) ??
    {};

  const maneuverValue = (index: number, fallbackLabel: string) => {
    const item = maneuverScores[index];
    if (!item) return fallbackLabel;
    const score = coerceNumber(item.score, Number.NaN);
    return Number.isNaN(score) ? fallbackLabel : `${Math.round(score)}%`;
  };

  const speed = coerceString(
    candidate.speed ??
      metrics.speed ??
      (candidate.performance as Record<string, unknown> | undefined)?.speed,
    maneuverValue(0, 'N/A'),
  );
  const lane = coerceString(
    candidate.lane ??
      metrics.lane ??
      (candidate.performance as Record<string, unknown> | undefined)?.lane,
    maneuverValue(1, 'N/A'),
  );
  const braking = coerceString(
    candidate.braking ??
      metrics.braking ??
      (candidate.performance as Record<string, unknown> | undefined)?.braking,
    maneuverValue(2, 'N/A'),
  );
  const trafficSigns = coerceString(
    candidate.trafficSigns ??
      candidate.traffic_signs ??
      metrics.trafficSigns ??
      (candidate.performance as Record<string, unknown> | undefined)?.trafficSigns,
    maneuverValue(3, 'N/A'),
  );
  const notes = coerceString(candidate.notes ?? candidate.feedback ?? candidate.comment ?? candidate.remark ?? candidate.overall_narrative, 'No notes available.');
  const visibility =
    candidate.visible ??
    candidate.is_visible ??
    candidate.result_visible ??
    candidate.visibility ??
    candidate.can_view;

  return {
    ...base,
    score: coerceNumber(candidate.weighted_total_score ?? candidate.score ?? base.score, base.score),
    result: typeof candidate.passed === 'boolean' ? (candidate.passed ? 'Pass' : 'Fail') : base.result,
    title: coerceString(candidate.title ?? candidate.examType ?? candidate.exam_type ?? candidate.test_level_code ?? base.examType),
    speed,
    lane,
    braking,
    trafficSigns,
    notes,
    visible: visibility !== false,
    sessionId: coerceString(
      candidate.sessionId ??
        candidate.session_id ??
        metrics.sessionId ??
        metrics.session_id ??
        firstSession?.session_id ??
        firstSession?.sessionId,
    ) || undefined,
    passThreshold: coerceNumber(candidate.pass_threshold ?? metrics.pass_threshold, 0) || undefined,
    weakestManeuver: coerceString(candidate.weakest_maneuver ?? metrics.weakest_maneuver) || undefined,
    strengthsNarrative: coerceString(candidate.strengths_narrative ?? metrics.strengths_narrative) || undefined,
    weaknessesNarrative: coerceString(candidate.weaknesses_narrative ?? metrics.weaknesses_narrative) || undefined,
    recommendedFocus: coerceString(candidate.recommended_focus ?? metrics.recommended_focus) || undefined,
  };
}

function normalizeActiveExam(raw: unknown): ActiveExam | null {
  if (!raw || typeof raw !== 'object') return null;

  const candidate = raw as Record<string, unknown>;
  const id = coerceString(candidate.id ?? candidate.test_id ?? candidate.exam_id).trim();
  if (!id) return null;

  const progress = Math.min(100, Math.max(0, coerceNumber(candidate.progress ?? candidate.progress_percent ?? candidate.completion_percent, 0)));
  const liveScore = coerceNumber(candidate.liveScore ?? candidate.score ?? candidate.current_score, 0);
  const violations = Math.max(0, coerceNumber(candidate.violations ?? candidate.flag_count ?? candidate.alerts, 0));
  const statusValue = coerceString(
    candidate.status ?? candidate.exam_status ?? candidate.state ?? candidate.test_status,
    'Stable',
  ).toLowerCase();

  const status: ActiveExamStatus =
    statusValue.includes('excellent') || statusValue === 'pass'
      ? 'Excellent'
      : statusValue.includes('review') || statusValue.includes('manual')
        ? 'Review'
        : statusValue.includes('warn') || statusValue.includes('critical')
          ? 'Warning'
          : 'Stable';

  const nestedCandidate = candidate.candidate;
  const nestedCandidateName = typeof nestedCandidate === 'object' && nestedCandidate !== null
    ? (nestedCandidate as Record<string, unknown>).name
    : undefined;

  return {
    id,
    candidateName: coerceString(
      candidate.candidateName ?? candidate.candidate_name ?? nestedCandidateName ?? candidate.name ?? 'Candidate',
    ),
    center: coerceString(candidate.center ?? candidate.center_name ?? candidate.location ?? 'Test Center'),
    progress,
    liveScore,
    violations,
    status,
  };
}

function normalizePendingTest(raw: unknown): CandidatePendingTest | null {
  if (!raw || typeof raw !== 'object') return null;

  const item = raw as Record<string, unknown>;
  const id = coerceString(item.id ?? item.test_id ?? item.exam_id).trim();
  const testCenterId = coerceString(item.testCenterId ?? item.test_center_id).trim();

  if (!id || !testCenterId) return null;

  return {
    id,
    bookingId: coerceString(item.bookingId ?? item.booking_id),
    candidateId: coerceString(item.candidateId ?? item.candidate_id),
    testCenterId,
    testPlanId: coerceString(item.testPlanId ?? item.test_plan_id),
    deviceId: coerceString(item.deviceId ?? item.device_id) || undefined,
    testLevelCode: coerceString(item.testLevelCode ?? item.test_level_code, 'N/A'),
    status: coerceString(item.status, 'pending'),
    scheduledStartAt: coerceString(item.scheduledStartAt ?? item.scheduled_start_at) || undefined,
    scheduledEndAt: coerceString(item.scheduledEndAt ?? item.scheduled_end_at) || undefined,
    bookingWindowHours: coerceNumber(item.bookingWindowHours ?? item.booking_window_hours, 0) || undefined,
    startedAt: coerceString(item.startedAt ?? item.started_at) || undefined,
    completedAt: coerceString(item.completedAt ?? item.completed_at) || undefined,
    createdAt: coerceString(item.createdAt ?? item.created_at) || undefined,
  };
}

function mapMeta(payload: unknown): ApiListResponse<unknown>['meta'] {
  if (!payload || typeof payload !== 'object') return { page: 1, limit: 20, total: 0, totalPages: 0 };

  const data = payload as Record<string, unknown>;
  return {
    page: coerceNumber(data.page ?? data.current_page, 1),
    limit: coerceNumber(data.limit ?? data.per_page ?? data.page_size, 20),
    total: coerceNumber(data.total ?? data.total_items ?? data.count, 0),
    totalPages: coerceNumber(data.totalPages ?? data.total_pages, 0),
  };
}

/** Candidate pending test — GET /tests/my/pending */
export async function getCandidatePendingTest(): Promise<CandidatePendingTest | null> {
  try {
    const response = await api.get<ApiResponse<unknown>>('/tests/my/pending');
    return normalizePendingTest(extractData<unknown>(response.data) ?? response.data);
  } catch (err) {
    const message = extractApiError(err, 'Unable to load pending test.');
    if (/no pending test/i.test(message)) return null;
    throw new Error(message);
  }
}

/** Candidate device check-in — POST /tests/device-checkin */
export async function checkInCandidateDevice(payload: DeviceCheckinPayload): Promise<CandidatePendingTest | null> {
  try {
    const response = await api.post<ApiResponse<unknown>>('/tests/device-checkin', {
      device_code: payload.deviceCode,
      password: payload.password,
      test_center_id: payload.testCenterId,
    });

    return normalizePendingTest(extractData<unknown>(response.data) ?? response.data);
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to complete device check-in.'));
  }
}

/** Candidate guidelines acknowledgement — POST /tests/{id}/guidelines/acknowledge */
export async function acknowledgeCandidateGuidelines(testId: string): Promise<boolean> {
  try {
    await api.post<ApiResponse<unknown>>(`/tests/${encodeURIComponent(testId)}/guidelines/acknowledge`);
    return true;
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to acknowledge guidelines.'));
  }
}

/** Candidate exam history — GET /tests/my?page=1&limit=20 */
export async function listCandidateExams(): Promise<ExamSummary[]> {
  try {
    const response = await api.get<ApiResponse<unknown>>('/tests/my', {
      params: {
        page: 1,
        limit: 20,
      },
    });

    return extractListCandidateData(response.data).map(normalizeExamSummary).filter(Boolean) as ExamSummary[];
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load exam history.'));
  }
}

/** Candidate exam detail — GET /tests/{id}/result */
export async function fetchCandidateExamById(examId: string): Promise<ExamDetail | null> {
  try {
    const response = await api.get<RawEnvelope<ApiResponse<unknown> | unknown>>(`/tests/${examId}/result`);

    const direct = extractData<unknown>(response.data);
    if (direct !== null) {
      return normalizeExamDetail(direct);
    }

    return null;
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load exam result.'));
  }
}

/** Synchronous helper used by existing fallback UI paths. */
export function getCandidateExamById(_examId: string): ExamDetail | null {
  void _examId;
  return null;
}

/** Candidate aggregate stats — GET /tests/my/stats */
export async function getCandidateExamStats(): Promise<CandidateExamStats> {
  try {
    const response = await api.get<ApiResponse<unknown>>('/tests/my/stats');
    const stats = extractData<Record<string, unknown>>(response.data) ?? {};

    if (!stats || typeof stats !== 'object') {
      throw new Error('Invalid stats payload.');
    }

    const passedExams = coerceNumber(stats.passed ?? stats.passedExams ?? stats.passed_exams, 0);
    const totalExams = coerceNumber(stats.total ?? stats.totalExams ?? stats.total_tests ?? stats.totalExamsCount, 0);
    const averageScore = coerceNumber(stats.average ?? stats.averageScore ?? stats.average_score ?? stats.avgScore, 0);

    return {
      totalExams,
      averageScore,
      passedExams,
      incomplete: Math.max(0, totalExams - passedExams),
    };
  } catch {
    const list = await listCandidateExams().catch(() => []);
    return {
      totalExams: list.length,
      averageScore: list.length ? Math.round(list.reduce((sum, exam) => sum + exam.score, 0) / list.length) : 0,
      passedExams: list.filter((exam) => exam.result === 'Pass').length,
      incomplete: list.filter((exam) => exam.result !== 'Pass').length,
    };
  }
}

/** Recent passed/failed rows for dashboard cards */
export async function getDashboardPastExams(): Promise<DashboardPastExam[]> {
  try {
    const response = await api.get<ApiListResponse<unknown>>('/tests/my', {
      params: { page: 1, limit: 5 },
    });

    const items = extractListCandidateData(response.data).map(normalizeExamSummary).filter(Boolean) as ExamSummary[];

    return items.slice(0, 5).map((exam) => ({
      date: exam.date,
      type: exam.examType,
      score: `${exam.score}/100`,
      status: exam.result,
      color: exam.result === 'Pass' ? 'green' : exam.result === 'Fail' ? 'red' : 'amber',
    }));
  } catch {
    return [];
  }
}

/** Upcoming exam card - returns null when no scheduled exam exists. */
export async function getCandidateUpcomingExam(): Promise<UpcomingExam | null> {
  try {
    const response = await api.get<ApiListResponse<unknown>>('/tests/my', {
      params: { status: 'scheduled', page: 1, limit: 1 },
    });
    const items = extractListCandidateData(response.data);
    const normalized = items.map(normalizeExamSummary).find((item): item is ExamSummary => Boolean(item));

    if (normalized) {
      return {
        id: normalized.id,
        date: normalized.date,
        title: normalized.examType,
        center: normalized.center,
        status: 'Scheduled',
      };
    }
  } catch {
    // ignore
  }

  return null;
}

/** Admin live monitor — GET /tests?status=running&page=1&limit=20 */
export async function listActiveExams(): Promise<ActiveExam[]> {
  const response = await api.get<ApiListResponse<unknown>>('/tests', {
    params: {
      status: 'running',
      page: 1,
      limit: 20,
    },
  });

  const meta = mapMeta(response.data?.meta) || { page: 1, limit: 20, total: 0, totalPages: 0 };
  if (meta.total === 0 && meta.page === 1 && extractListCandidateData(response.data).length === 0) {
    return [];
  }

  return extractListCandidateData(response.data).map(normalizeActiveExam).filter(Boolean) as ActiveExam[];
}

export async function listActiveExamsSafe(): Promise<{ data: ActiveExam[]; error: string | null }> {
  try {
    return { data: await listActiveExams(), error: null };
  } catch (err) {
    return { data: [], error: extractApiError(err, 'Unable to load active exams.') };
  }
}

function normalizeMonitorStatus(raw: unknown): ActiveExamMonitorStatus | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  const testId = coerceString(data.test_id ?? data.testId ?? data.id).trim();
  if (!testId) return null;

  return {
    testId,
    status: coerceString(data.status, 'unknown'),
    deviceId: coerceString(data.device_id ?? data.deviceId) || undefined,
    startedAt: coerceString(data.started_at ?? data.startedAt) || undefined,
    completedAt: coerceString(data.completed_at ?? data.completedAt) || undefined,
    abortReason: coerceString(data.abort_reason ?? data.abortReason) || undefined,
  };
}

function normalizeLiveMetrics(raw: unknown): ActiveExamLiveMetrics | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  const testId = coerceString(data.test_id ?? data.testId ?? data.id).trim();
  if (!testId) return null;

  return {
    testId,
    status: coerceString(data.status, 'unknown'),
    currentSession: coerceNumber(data.current_session ?? data.currentSession, 0) || undefined,
    frameCount: coerceNumber(data.frame_count ?? data.frameCount, 0),
    runningAvgIoU: coerceNumber(data.running_avg_iou ?? data.runningAvgIoU, 0),
    deviceHealthOK: Boolean(data.device_health_ok ?? data.deviceHealthOK),
  };
}

export async function getActiveExamMonitorStatus(testId: string): Promise<ActiveExamMonitorStatus | null> {
  try {
    const response = await api.get<ApiResponse<unknown>>(`/tests/${encodeURIComponent(testId)}/monitor/status`);
    return normalizeMonitorStatus(extractData<unknown>(response.data) ?? response.data);
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load active exam status.'));
  }
}

export async function getActiveExamLiveMetrics(testId: string): Promise<ActiveExamLiveMetrics | null> {
  try {
    const response = await api.get<ApiResponse<unknown>>(`/tests/${encodeURIComponent(testId)}/monitor/live`);
    return normalizeLiveMetrics(extractData<unknown>(response.data) ?? response.data);
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load active exam live metrics.'));
  }
}

export async function abortActiveExam(testId: string): Promise<boolean> {
  try {
    await api.post(`/tests/${encodeURIComponent(testId)}/abort`);
    return true;
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to abort active exam.'));
  }
}
