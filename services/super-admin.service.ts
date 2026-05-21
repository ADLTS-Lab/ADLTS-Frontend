import { ApiSuccess } from './api-utils';

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

export async function getSystemMetrics(): Promise<ApiSuccess<SystemMetrics>> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    success: true,
    data: {
      totalActiveCandidates: 12450,
      registeredInstitutes: 34,
      activeDevices: 89,
      systemHealth: 99.9,
    },
  };
}

export async function getRecentAudits(): Promise<ApiSuccess<AuditLog[]>> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    data: [
      {
        id: 'aud-1',
        action: 'System Configuration Updated',
        user: 'Root Admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        status: 'success',
      },
      {
        id: 'aud-2',
        action: 'Failed Login Attempt (Brute Force)',
        user: 'Unknown IP',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        status: 'error',
      },
      {
        id: 'aud-3',
        action: 'New Institute Registered',
        user: 'Admin User',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        status: 'success',
      },
      {
        id: 'aud-4',
        action: 'Large Data Export',
        user: 'Admin User',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        status: 'warning',
      },
    ],
  };
}
