import api from '@/lib/api';

import { ApiListResponse, extractApiError, extractData, extractList } from './api-utils';

export type DeviceStatus = 'Online' | 'Warning' | 'Offline';

export interface DeviceRecord {
  id?: string;
  type: string;
  name: string;
  location: string;
  utilization: number;
  battery: number;
  detailLabel: string;
  detailValue: string;
  status: DeviceStatus;
}

export interface DeviceSummary {
  total: number;
  online: number;
  warning: number;
  offline: number;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeStatus(value: unknown): DeviceStatus {
  const status = String(value ?? '').toLowerCase();
  if (status.includes('warning') || status.includes('low') || status.includes('degraded')) return 'Warning';
  if (status.includes('offline') || status.includes('down') || status.includes('disconnected')) return 'Offline';
  return 'Online';
}

function toStr(value: unknown, fallback = 'N/A'): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function toNum(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizeDevice(raw: unknown): DeviceRecord | null {
  if (!raw || typeof raw !== 'object') return null;

  const data = raw as Record<string, unknown>;

  return {
    id: toStr(data.id ?? data.device_id ?? data.uuid, `${Date.now()}`).trim() || undefined,
    type: toStr(data.type ?? data.category ?? data.model, 'Device'),
    name: toStr(data.name ?? data.serialNumber ?? data.device_name, 'Unknown Device'),
    location: toStr(data.location ?? data.center ?? data.site ?? data.branch, 'Unknown Location'),
    utilization: clampPercent(toNum(data.utilization ?? data.storageUtilization ?? data.utilization_percentage ?? data.storage_percent)),
    battery: clampPercent(toNum(data.battery ?? data.batteryLevel ?? data.battery_level, 0)),
    detailLabel: toStr(data.detailLabel ?? data.metricLabel ?? data.statLabel ?? data.metric_name, 'Metric'),
    detailValue: toStr(data.detailValue ?? data.statValue ?? data.metricValue ?? data.metric, 'N/A'),
    status: normalizeStatus(data.status ?? data.state ?? data.healthStatus),
  };
}

function summarizeDevices(devices: DeviceRecord[]): DeviceSummary {
  return {
    total: devices.length,
    online: devices.filter((d) => d.status === 'Online').length,
    warning: devices.filter((d) => d.status === 'Warning').length,
    offline: devices.filter((d) => d.status === 'Offline').length,
  };
}

/** Admin device list — GET /devices?page=1&limit=20 */
export async function listDevices(): Promise<DeviceRecord[]> {
  try {
    const response = await api.get<ApiListResponse<DeviceRecord>>('/devices', {
      params: {
        page: 1,
        limit: 20,
      },
    });

    return extractList<DeviceRecord>(response.data)
      .map((raw) => normalizeDevice(raw))
      .filter((item): item is DeviceRecord => item !== null);
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load devices.'));
  }
}

/** Summary counts derived from the device list */
export async function getDeviceSummary(): Promise<DeviceSummary> {
  const devices = await listDevices();
  return summarizeDevices(devices);
}

export async function listDevicesSafe(): Promise<{ devices: DeviceRecord[]; summary: DeviceSummary; error: string | null }> {
  try {
    const devices = await listDevices();
    return { devices, summary: summarizeDevices(devices), error: null };
  } catch (err) {
    return {
      devices: [],
      summary: { total: 0, online: 0, warning: 0, offline: 0 },
      error: extractApiError(err, 'Unable to load devices.'),
    };
  }
}
