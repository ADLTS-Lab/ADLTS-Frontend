import api from '@/lib/api';

import { extractApiError } from './api-utils';

/**
 * MOCK-ONLY: Device endpoints are not in the current Postman user-management collection.
 * When the backend adds them (e.g. GET /devices), swap the mock fallback for a real api call.
 */

export type DeviceStatus = 'Online' | 'Warning' | 'Offline';

export interface DeviceRecord {
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

const MOCK_DEVICES: DeviceRecord[] = [
  {
    type: 'Tablet Node',
    name: 'ADLT-ET-001',
    location: 'Addis Ababa Center A',
    utilization: 68,
    battery: 94,
    detailLabel: 'Temp',
    detailValue: '32°C',
    status: 'Online',
  },
  {
    type: 'Server Module',
    name: 'ADLT-ET-042',
    location: 'Dire Dawa Region 02',
    utilization: 92,
    battery: 81,
    detailLabel: 'Latency',
    detailValue: '12ms',
    status: 'Warning',
  },
  {
    type: 'Terminal Unit',
    name: 'ADLT-ET-109',
    location: 'Bahir Dar Hub',
    utilization: 0,
    battery: 0,
    detailLabel: 'Sync',
    detailValue: 'None',
    status: 'Offline',
  },
  {
    type: 'Biometric Scanner',
    name: 'ADLT-ET-004',
    location: 'Addis Ababa Center B',
    utilization: 14,
    battery: 48,
    detailLabel: 'Last Auth',
    detailValue: '2m ago',
    status: 'Online',
  },
  {
    type: 'Mobile Unit',
    name: 'ADLT-ET-221',
    location: 'Hawassa Center Hub',
    utilization: 45,
    battery: 100,
    detailLabel: 'Signal',
    detailValue: '-45dBm',
    status: 'Online',
  },
];

function summarizeDevices(devices: DeviceRecord[]): DeviceSummary {
  return {
    total: devices.length,
    online: devices.filter((d) => d.status === 'Online').length,
    warning: devices.filter((d) => d.status === 'Warning').length,
    offline: devices.filter((d) => d.status === 'Offline').length,
  };
}

/** Admin device grid — MOCK-ONLY until GET /devices exists */
export async function listDevices(): Promise<DeviceRecord[]> {
  try {
    const response = await api.get<{ success: boolean; data: DeviceRecord[] }>('/devices');
    if (response.data?.data?.length) return response.data.data;
  } catch {
    // fall through to mock
  }
  return MOCK_DEVICES;
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
