import api from '@/lib/api';

import { ApiListResponse, ApiResponse, extractApiError, extractList } from './api-utils';

export interface ManeuverConfig {
  id: string;
  maneuverType: string;
  displayName: string;
  sequenceNumber: number;
  weight: number;
  passThreshold: number;
  tolerancePx: number;
  minFramesRequired: number;
  qrStartValue?: string;
  qrEndValue?: string;
}

export interface TestPlan {
  id: string;
  testCenterId?: string;
  name: string;
  description: string;
  passThreshold: number;
  status: string;
  publishedAt?: string;
  createdAt?: string;
  maneuvers: ManeuverConfig[];
}

export interface CreateTestPlanRequest {
  name: string;
  description: string;
  passThreshold: number;
}

export interface CreateManeuverRequest {
  maneuverType: string;
  displayName: string;
  sequenceNumber: number;
  weight: number;
  passThreshold: number;
  tolerancePx: number;
  minFramesRequired: number;
}

function toStr(value: unknown, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function toNum(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizeManeuver(raw: unknown): ManeuverConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const id = toStr(item.id ?? item.maneuver_id).trim();
  if (!id) return null;

  return {
    id,
    maneuverType: toStr(item.maneuver_type ?? item.maneuverType),
    displayName: toStr(item.display_name ?? item.displayName ?? item.name, 'Maneuver'),
    sequenceNumber: toNum(item.sequence_number ?? item.sequenceNumber),
    weight: toNum(item.weight),
    passThreshold: toNum(item.pass_threshold ?? item.passThreshold),
    tolerancePx: toNum(item.tolerance_px ?? item.tolerancePx),
    minFramesRequired: toNum(item.min_frames_required ?? item.minFramesRequired),
    qrStartValue: toStr(item.qr_start_value ?? item.qrStartValue) || undefined,
    qrEndValue: toStr(item.qr_end_value ?? item.qrEndValue) || undefined,
  };
}

function normalizePlan(raw: unknown): TestPlan | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const id = toStr(item.id ?? item.plan_id).trim();
  if (!id) return null;

  const maneuversRaw = Array.isArray(item.maneuvers) ? item.maneuvers : [];

  return {
    id,
    testCenterId: toStr(item.test_center_id ?? item.testCenterId) || undefined,
    name: toStr(item.name, 'Test plan'),
    description: toStr(item.description),
    passThreshold: toNum(item.pass_threshold ?? item.passThreshold),
    status: toStr(item.status, 'draft'),
    publishedAt: toStr(item.published_at ?? item.publishedAt) || undefined,
    createdAt: toStr(item.created_at ?? item.createdAt) || undefined,
    maneuvers: maneuversRaw.map(normalizeManeuver).filter((entry): entry is ManeuverConfig => Boolean(entry)),
  };
}

export async function listTestPlans(): Promise<TestPlan[]> {
  try {
    const response = await api.get<ApiListResponse<unknown>>('/test-plans', { params: { page: 1, limit: 20 } });
    return extractList<unknown>(response.data).map(normalizePlan).filter((item): item is TestPlan => Boolean(item));
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load test plans.'));
  }
}

export async function getTestPlan(planId: string): Promise<TestPlan | null> {
  try {
    const response = await api.get<ApiResponse<unknown>>(`/test-plans/${encodeURIComponent(planId)}`);
    return normalizePlan(response.data?.data ?? response.data);
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load test plan.'));
  }
}

export async function createTestPlan(payload: CreateTestPlanRequest): Promise<TestPlan | null> {
  try {
    const response = await api.post<ApiResponse<unknown>>('/test-plans', {
      name: payload.name,
      description: payload.description,
      pass_threshold: payload.passThreshold,
    });
    return normalizePlan(response.data?.data ?? response.data);
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to create test plan.'));
  }
}

export async function publishTestPlan(planId: string): Promise<boolean> {
  try {
    await api.post(`/test-plans/${encodeURIComponent(planId)}/publish`);
    return true;
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to publish test plan.'));
  }
}

export async function createManeuverConfig(planId: string, payload: CreateManeuverRequest): Promise<ManeuverConfig | null> {
  try {
    const response = await api.post<ApiResponse<unknown>>(`/test-plans/${encodeURIComponent(planId)}/maneuvers`, {
      maneuver_type: payload.maneuverType,
      display_name: payload.displayName,
      sequence_number: payload.sequenceNumber,
      weight: payload.weight,
      pass_threshold: payload.passThreshold,
      tolerance_px: payload.tolerancePx,
      min_frames_required: payload.minFramesRequired,
    });
    return normalizeManeuver(response.data?.data ?? response.data);
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to add maneuver.'));
  }
}
