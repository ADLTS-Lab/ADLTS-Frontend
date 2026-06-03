import api from '@/lib/api';

import { ApiResponse, extractData } from './api-utils';

export type SystemMetrics = {
  totalActiveCandidates: number;
  registeredInstitutes: number;
  activeDevices: number;
  systemHealth: number; // percentage
};

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeMetrics(payload: unknown): SystemMetrics {
  if (!payload || typeof payload !== 'object') {
    return {
      totalActiveCandidates: 0,
      registeredInstitutes: 0,
      activeDevices: 0,
      systemHealth: 0,
    };
  }

  const candidateData = payload as Record<string, unknown>;
  return {
    totalActiveCandidates: toNumber(
      candidateData.totalActiveCandidates ??
        candidateData.total_active_candidates ??
        candidateData.activeCandidates ??
        candidateData.candidates ??
        0,
    ),
    registeredInstitutes: toNumber(
      candidateData.registeredInstitutes ??
        candidateData.registered_institutes ??
        candidateData.institutes ??
        candidateData.institution_count ??
        0,
    ),
    activeDevices: toNumber(
      candidateData.activeDevices ??
        candidateData.active_devices ??
        candidateData.devices ??
        candidateData.device_count ??
        0,
    ),
    systemHealth: toNumber(
      candidateData.systemHealth ?? candidateData.system_health ?? candidateData.health ?? candidateData.health_percentage ?? 0,
    ),
  };
}

/** Super-admin dashboard metrics — GET /super-admin/dashboard */
export async function getSystemMetrics(): Promise<ApiResponse<SystemMetrics>> {
  const response = await api.get<ApiResponse<unknown>>('/super-admin/dashboard');
  const metrics = extractData<SystemMetrics>(response.data);
  return {
    success: !!response.data?.success,
    data: normalizeMetrics((metrics ?? response.data?.data) ?? response.data),
    message: response.data?.message,
  };
}
