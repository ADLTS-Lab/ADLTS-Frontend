import api from '@/lib/api';

import { ApiListResponse, ApiResponse, extractApiError, extractData, extractList } from './api-utils';

export type SystemMetrics = {
  totalActiveCandidates: number;
  registeredInstitutes: number;
  activeDevices: number;
  systemHealth: number; // percentage
};

export type AuditLog = {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
};

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toStr(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
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

function normalizeStatus(value: unknown): AuditLog['status'] {
  const raw = toStr(value, 'success').toLowerCase();
  if (raw === 'error' || raw === 'danger' || raw === 'failed' || raw === 'warning') {
    return raw === 'error' || raw === 'danger' || raw === 'failed' ? 'error' : 'warning';
  }
  return 'success';
}

function normalizeAudit(raw: unknown): AuditLog | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;

  const id = toStr(data.id ?? data.audit_id ?? data.event_id, `${Date.now()}`);
  return {
    id,
    action: toStr(data.action ?? data.event ?? data.type, 'System event'),
    user: toStr(data.user ?? data.actor ?? data.initiator, 'System'),
    timestamp: toStr(data.timestamp ?? data.created_at ?? data.occurred_at, new Date().toISOString()),
    status: normalizeStatus(data.status ?? data.severity ?? data.level),
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

/** Super-admin audits — GET /super-admin/audits?page=1&limit=20 */
export async function getRecentAudits(): Promise<ApiResponse<AuditLog[]>> {
  try {
    const response = await api.get<ApiListResponse<unknown>>('/super-admin/audits', {
      params: {
        page: 1,
        limit: 20,
      },
    });

    const items = extractList<unknown>(response.data).map(normalizeAudit).filter((audit): audit is AuditLog => Boolean(audit));
    return {
      success: !!response.data?.success,
      data: items,
      message: response.data?.message,
      meta: response.data?.meta,
    };
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load audit events.'));
  }
}

/** Backward-compatible wrapper kept for existing callers */
export async function getRecentAuditsSafe(): Promise<{ logs: AuditLog[]; error: string | null }> {
  try {
    const response = await getRecentAudits();
    return { logs: response.data ?? [], error: response.success ? null : 'Failed to load audit events.' };
  } catch (err) {
    return { logs: [], error: extractApiError(err, 'Unable to load audit events.') };
  }
}
