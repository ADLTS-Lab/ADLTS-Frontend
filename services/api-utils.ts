/** Shared helpers for service-layer API calls (Postman contract: `{ success, data?, message? }`). */

export type ApiSuccess<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export function extractApiError(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (message) return message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
