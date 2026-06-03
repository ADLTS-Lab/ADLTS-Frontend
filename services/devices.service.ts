import api from '@/lib/api';

import { ApiListResponse, ApiResponse, extractApiError, extractList } from './api-utils';

export type DeviceStatus = 'Online' | 'Warning' | 'Offline' | 'Maintenance' | 'In Use';

export interface DeviceRecord {
  id?: string;
  deviceCode?: string;
  testCenterId?: string;
  allowedLevels?: string[];
  streamUrl?: string;
  currentTestId?: string;
  lastSeenAt?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface CreateDeviceRequest {
  deviceCode: string;
  password: string;
  testCenterId: string;
  allowedLevels: string[];
  streamUrl: string;
}

export interface UpdateDeviceRequest {
  streamUrl?: string;
  allowedLevels?: string[];
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeStatus(value: unknown): DeviceStatus {
  const status = String(value ?? '').toLowerCase();
  if (status.includes('maintenance')) return 'Maintenance';
  if (status.includes('in_use') || status.includes('in use')) return 'In Use';
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
  const allowedRaw = data.allowedLevels ?? data.allowed_levels;
  const allowedLevels = Array.isArray(allowedRaw)
    ? allowedRaw.map((item) => String(item))
    : typeof allowedRaw === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(allowedRaw);
            return Array.isArray(parsed) ? parsed.map((item) => String(item)) : allowedRaw.split(',').map((item) => item.trim()).filter(Boolean);
          } catch {
            return allowedRaw.split(',').map((item) => item.trim()).filter(Boolean);
          }
        })()
      : [];
  const deviceCode = toStr(data.device_code ?? data.deviceCode ?? data.code ?? data.serialNumber, '');
  const testCenterId = toStr(data.test_center_id ?? data.testCenterId, '');
  const streamUrl = toStr(data.stream_url ?? data.streamUrl, '');

  return {
    id: toStr(data.id ?? data.device_id ?? data.uuid, `${Date.now()}`).trim() || undefined,
    deviceCode,
    testCenterId,
    allowedLevels,
    streamUrl,
    currentTestId: toStr(data.current_test_id ?? data.currentTestId, '') || undefined,
    lastSeenAt: toStr(data.last_seen_at ?? data.lastSeenAt, '') || undefined,
    createdAt: toStr(data.created_at ?? data.createdAt, '') || undefined,
    updatedAt: toStr(data.updated_at ?? data.updatedAt, '') || undefined,
    type: toStr(data.type ?? data.category ?? data.model, 'ADLTS Device'),
    name: toStr(data.name ?? data.device_name ?? deviceCode, 'Unknown Device'),
    location: toStr(data.location ?? data.center ?? data.site ?? data.branch ?? testCenterId, 'Unknown Location'),
    utilization: clampPercent(toNum(data.utilization ?? data.storageUtilization ?? data.utilization_percentage ?? data.storage_percent)),
    battery: clampPercent(toNum(data.battery ?? data.batteryLevel ?? data.battery_level, 0)),
    detailLabel: toStr(data.detailLabel ?? data.metricLabel ?? data.statLabel ?? data.metric_name, streamUrl ? 'Stream' : 'Metric'),
    detailValue: toStr(data.detailValue ?? data.statValue ?? data.metricValue ?? data.metric ?? streamUrl, 'N/A'),
    status: normalizeStatus(data.status ?? data.state ?? data.healthStatus),
  };
}

function summarizeDevices(devices: DeviceRecord[]): DeviceSummary {
  return {
    total: devices.length,
    online: devices.filter((d) => d.status === 'Online').length,
    warning: devices.filter((d) => d.status === 'Warning' || d.status === 'Maintenance' || d.status === 'In Use').length,
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

export async function getDevice(deviceId: string): Promise<DeviceRecord | null> {
  try {
    const response = await api.get<ApiResponse<unknown>>(`/devices/${encodeURIComponent(deviceId)}`);
    const payload = response.data?.data ?? response.data;
    return normalizeDevice(payload);
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load device.'));
  }
}

export async function createDevice(payload: CreateDeviceRequest): Promise<DeviceRecord | null> {
  try {
    const response = await api.post<ApiResponse<unknown>>('/devices', {
      device_code: payload.deviceCode,
      password: payload.password,
      test_center_id: payload.testCenterId,
      allowed_levels: payload.allowedLevels,
      stream_url: payload.streamUrl,
    });

    return normalizeDevice(response.data?.data ?? response.data);
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to register device.'));
  }
}

export async function updateDevice(deviceId: string, payload: UpdateDeviceRequest): Promise<boolean> {
  try {
    await api.patch(`/devices/${encodeURIComponent(deviceId)}`, {
      stream_url: payload.streamUrl,
      allowed_levels: payload.allowedLevels,
    });
    return true;
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to update device.'));
  }
}

export async function updateDeviceStatus(deviceId: string, status: 'active' | 'inactive' | 'maintenance'): Promise<boolean> {
  try {
    await api.patch(`/devices/${encodeURIComponent(deviceId)}/status`, { status });
    return true;
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to update device status.'));
  }
}

export async function downloadDeviceQr(deviceId: string, password: string): Promise<Blob> {
  try {
    const response = await api.get<Blob>(`/devices/${encodeURIComponent(deviceId)}/qr-code`, {
      params: { password },
      responseType: 'blob',
    });
    return response.data;
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to download device QR code.'));
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
