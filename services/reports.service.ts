import api from '@/lib/api';

import { ApiSuccess, extractApiError } from './api-utils';

export interface ReportGenerationResponse {
  report_url: string;
}

export interface ReportPdfResponse {
  blob: Blob;
  filename?: string;
}

function isMissingEndpoint(err: unknown): boolean {
  if (typeof err !== 'object' || err === null || !('response' in err)) return false;
  const status = (err as { response?: { status?: number } }).response?.status;
  return status === 404 || status === 405;
}

export async function generateExamReport(testId: string): Promise<ApiSuccess<ReportGenerationResponse> | null> {
  try {
    const response = await api.post<ApiSuccess<ReportGenerationResponse>>(`/reports/${testId}/generate`);
    return response.data ?? null;
  } catch (err) {
    if (isMissingEndpoint(err)) {
      return null;
    }

    throw new Error(extractApiError(err, 'Unable to generate report.'));
  }
}

export async function downloadExamReportPdf(testId: string): Promise<ReportPdfResponse | null> {
  try {
    const response = await api.get<Blob>(`/reports/${testId}/pdf`, {
      responseType: 'blob',
    });

    return {
      blob: response.data,
      filename: `report-${testId}.pdf`,
    };
  } catch (err) {
    if (isMissingEndpoint(err)) {
      return null;
    }

    throw new Error(extractApiError(err, 'Unable to download report PDF.'));
  }
}