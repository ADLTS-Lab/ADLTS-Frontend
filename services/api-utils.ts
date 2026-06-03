/** Shared helpers for service-layer API calls (contract: `{ success, data?, message?, meta? }`). */

import { isAxiosError } from 'axios';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  message?: string;
};

export type ApiListResponse<T> = ApiResponse<T[]> & {
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    total_items?: number;
    totalPages?: number;
    total_pages?: number;
  };
};

export type ApiSuccess<T> = ApiResponse<T>;

export type ApiErrorContext = 'default' | 'auth-login' | 'auth-register' | 'auth-refresh' | 'auth-session';

export type ApiErrorKind =
  | 'invalid_credentials'
  | 'email_exists'
  | 'expired_session'
  | 'forbidden_access'
  | 'validation_error'
  | 'network_unavailable'
  | 'server_unavailable'
  | 'unknown';

export type NormalizedApiError = {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  details: string[];
};

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function collectStrings(value: unknown, limit = 8): string[] {
  const results: string[] = [];

  const visit = (item: unknown): void => {
    if (results.length >= limit || item == null) return;

    if (typeof item === 'string') {
      const text = item.trim();
      if (text) results.push(text);
      return;
    }

    if (Array.isArray(item)) {
      item.forEach(visit);
      return;
    }

    if (typeof item === 'object') {
      Object.values(item as Record<string, unknown>).forEach(visit);
    }
  };

  visit(value);
  return results;
}

function getResponsePayload(err: unknown): { status?: number; code?: string; data?: unknown; message?: string } {
  if (!isAxiosError(err)) {
    return { message: err instanceof Error ? err.message : undefined };
  }

  const responseData = err.response?.data as
    | { message?: unknown; error?: unknown; errors?: unknown; detail?: unknown }
    | undefined;
  const nestedError = responseData?.error as { message?: unknown; code?: unknown } | undefined;

  return {
    status: err.response?.status,
    code: err.code,
    data: responseData,
    message:
      asText(responseData?.message) ||
      asText(responseData?.error) ||
      asText(nestedError?.message) ||
      asText(responseData?.detail) ||
      asText(err.message),
  };
}

function isFallbackEligible(status?: number, code?: string): boolean {
  return !status || status === 404 || status === 405 || code === 'ERR_NETWORK' || code === 'ECONNABORTED';
}

function classifyApiError(
  status: number | undefined,
  message: string,
  details: string[],
  context: ApiErrorContext,
  code?: string,
): { kind: ApiErrorKind; message: string } {
  const normalizedText = `${message} ${details.join(' ')}`.toLowerCase();

  if (!status && (code === 'ERR_NETWORK' || code === 'ECONNABORTED' || normalizedText.includes('network error') || normalizedText.includes('timeout'))) {
    return {
      kind: 'network_unavailable',
      message: 'Unable to reach the server. Check your connection and try again.',
    };
  }

  if (status === 401) {
    if (context === 'auth-login') {
      return {
        kind: 'invalid_credentials',
        message: 'Invalid email or password.',
      };
    }

    if (context === 'auth-session' && /password|current password|current_password|wrong|incorrect/i.test(normalizedText)) {
      return {
        kind: 'invalid_credentials',
        message: 'Current password is incorrect.',
      };
    }

    return {
      kind: 'expired_session',
      message: 'Your session has expired. Please sign in again.',
    };
  }

  if (context === 'auth-session' && status === 403 && /password|current password|current_password|wrong|incorrect/i.test(normalizedText)) {
    return {
      kind: 'invalid_credentials',
      message: 'Current password is incorrect.',
    };
  }

  if (status === 403 || /forbidden|access denied|not authorized|permission/i.test(normalizedText)) {
    return {
      kind: 'forbidden_access',
      message: 'You do not have permission to perform this action.',
    };
  }

  if (status === 409 || /already exists|already registered|duplicate|email.*exists/i.test(normalizedText)) {
    return {
      kind: 'email_exists',
      message: 'An account with this email already exists.',
    };
  }

  if (status === 422 || /validation|invalid .*field|invalid input|required/i.test(normalizedText) || details.length > 0) {
    const detailText = details.length ? ` ${details.slice(0, 3).join(' ')}` : '';
    return {
      kind: 'validation_error',
      message: `Please check the form and try again.${detailText}`.trim(),
    };
  }

  if (status && status >= 500) {
    return {
      kind: 'server_unavailable',
      message: 'The server is temporarily unavailable. Please try again in a moment.',
    };
  }

  if (message) {
    return {
      kind: 'unknown',
      message,
    };
  }

  return {
    kind: 'unknown',
    message: 'Something went wrong. Please try again.',
  };
}

export function normalizeApiError(err: unknown, fallback: string, context: ApiErrorContext = 'default'): NormalizedApiError {
  const payload = getResponsePayload(err);
  const details = collectStrings(payload.data)
    .filter((value) => value !== payload.message)
    .filter((value, index, array) => array.indexOf(value) === index);

  if (payload.status === 401 && context === 'auth-register') {
    return {
      kind: 'invalid_credentials',
      message: 'Invalid email or password.',
      status: payload.status,
      details,
    };
  }

  const classified = classifyApiError(payload.status, payload.message || '', details, context, payload.code);

  return {
    kind: classified.kind,
    message: classified.message || fallback,
    status: payload.status,
    details,
  };
}

export function extractApiError(err: unknown, fallback: string, context: ApiErrorContext = 'default'): string {
  return normalizeApiError(err, fallback, context).message || fallback;
}

export function extractData<T>(response: unknown): T | null {
  if (!response || typeof response !== 'object') return null;

  const envelope = response as ApiResponse<T>;
  if (envelope.success === false && envelope.data === undefined) return null;

  return (envelope.data as T) ?? null;
}

export function extractList<T>(response: unknown): T[] {
  const data = extractData<unknown>(response);
  return Array.isArray(data) ? (data as T[]) : [];
}

export function shouldUseLocalFallback(err: unknown): boolean {
  const payload = getResponsePayload(err);
  return isFallbackEligible(payload.status, payload.code);
}
