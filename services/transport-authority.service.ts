import api from '@/lib/api';

import { ApiResponse, extractApiError, extractData, extractList } from './api-utils';

export type RegionalAnalytics = {
  licensedDrivers: number;
  regionalPassRate: number; // percentage
  activeCenters: number;
  pendingViolations: number;
};

export type ComplianceAlert = {
  id: string;
  centerName: string;
  issue: string;
  severity: 'High' | 'Medium' | 'Low';
  dateReported: string;
};

function toNum(value: unknown): number {
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

function normalizeAnalytics(payload: unknown): RegionalAnalytics | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, unknown>;

  const resolved = {
    licensedDrivers: toNum(data.licensedDrivers ?? data.licensed_drivers ?? data.total_drivers ?? data.drivers),
    regionalPassRate: toNum(data.regionalPassRate ?? data.pass_rate ?? data.passRate ?? data.pass_percentage ?? 0),
    activeCenters: toNum(data.activeCenters ?? data.active_centers ?? data.centers),
    pendingViolations: toNum(data.pendingViolations ?? data.pending_violations ?? data.violations ?? data.issues),
  };

  if (resolved.licensedDrivers || resolved.regionalPassRate || resolved.activeCenters || resolved.pendingViolations) {
    return resolved;
  }

  return null;
}

function normalizeSeverity(value: unknown): ComplianceAlert['severity'] {
  const raw = toStr(value, 'low').toLowerCase();
  if (raw.includes('high')) return 'High';
  if (raw.includes('medium')) return 'Medium';
  return 'Low';
}

function normalizeAlert(raw: unknown): ComplianceAlert | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;

  return {
    id: toStr(data.id ?? data.alert_id ?? data._id, `${Date.now()}`),
    centerName: toStr(data.centerName ?? data.center_name ?? data.testCenter ?? data.center, 'Unknown Center'),
    issue: toStr(data.issue ?? data.message ?? data.description ?? 'No issue details'),
    severity: normalizeSeverity(data.severity ?? data.riskLevel ?? data.level),
    dateReported: toStr(data.dateReported ?? data.reported_at ?? data.created_at, new Date().toISOString()),
  };
}

function isAxios404(err: unknown): boolean {
  if (typeof err !== 'object' || err === null || !('response' in err)) return false;
  const status = (err as { response?: { status?: number } }).response?.status;
  return status === 404 || status === 405;
}

async function loadRegionalPayload(): Promise<ApiResponse<RegionalAnalytics> | null> {
  const candidates = ['/transport-authorities/dashboard', '/transport-authority/dashboard'];

  for (const path of candidates) {
    try {
      const response = await api.get<ApiResponse<unknown>>(path);
      const payload = extractData<unknown>(response.data) ?? response.data;
      const normalized = normalizeAnalytics(payload);

      if (normalized) {
        return { success: true, data: normalized, message: response.data?.message };
      }
    } catch (err) {
      if (!isAxios404(err)) {
        throw err;
      }
      // try next endpoint
    }
  }

  return null;
}

async function loadAlertsPayload(): Promise<ApiResponse<ComplianceAlert[]> | null> {
  const candidates = ['/transport-authorities/alerts', '/transport-authority/compliance-alerts', '/transport-authority/alerts'];

  for (const path of candidates) {
    try {
      const response = await api.get<ApiResponse<unknown>>(path, {
        params: {
          page: 1,
          limit: 20,
        },
      });

      const payload = extractData<unknown>(response.data) ?? response.data;
      const normalized = extractList<unknown>(payload).map(normalizeAlert).filter((item): item is ComplianceAlert => item !== null);

      if (normalized.length > 0) {
        return { success: true, data: normalized, message: response.data?.message };
      }
    } catch (err) {
      if (!isAxios404(err)) {
        throw err;
      }
      // try next endpoint
    }
  }

  return null;
}

/** Regional analytics for transport authority */
export async function getRegionalAnalytics(): Promise<ApiResponse<RegionalAnalytics | null>> {
  const response = await loadRegionalPayload();

  if (response) {
    return response;
  }

  return {
    success: false,
    data: null,
    message: 'Transport authority analytics endpoint is unavailable.',
  };
}

/** Transport compliance alerts */
export async function getComplianceAlerts(): Promise<ApiResponse<ComplianceAlert[] | null>> {
  try {
    const response = await loadAlertsPayload();

    if (response) return response;

    return {
      success: false,
      data: null,
      message: 'Transport authority compliance endpoint is unavailable.',
    };
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load compliance alerts.'));
  }
}
