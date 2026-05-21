import { ApiSuccess } from './api-utils';

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

export async function getRegionalAnalytics(): Promise<ApiSuccess<RegionalAnalytics>> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    success: true,
    data: {
      licensedDrivers: 45200,
      regionalPassRate: 78.4,
      activeCenters: 12,
      pendingViolations: 3,
    },
  };
}

export async function getComplianceAlerts(): Promise<ApiSuccess<ComplianceAlert[]>> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    data: [
      {
        id: 'ca-1',
        centerName: 'Addis Driving School',
        issue: 'Expired instructor licenses detected.',
        severity: 'High',
        dateReported: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: 'ca-2',
        centerName: 'Bole Test Center',
        issue: 'Biometric device offline for 48 hours.',
        severity: 'Medium',
        dateReported: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
      {
        id: 'ca-3',
        centerName: 'Adama Auto Academy',
        issue: 'Low pass rate flagged for review.',
        severity: 'Low',
        dateReported: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
    ],
  };
}
