import api from '@/lib/api';

import { extractApiError } from './api-utils';

/** Postman: POST /auth/password/forgot */
export async function requestPasswordReset(email: string): Promise<string> {
  try {
    const response = await api.post<{ success?: boolean; message?: string }>('/auth/password/forgot', {
      email,
    });
    return response.data?.message || 'Check your email for reset link';
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to send reset link. Please try again.'));
  }
}

/** Postman: POST /auth/password/reset */
export async function resetPassword(payload: {
  token: string;
  password: string;
  confirm_password: string;
}): Promise<string> {
  try {
    const response = await api.post<{ success?: boolean; message?: string }>('/auth/password/reset', payload);
    return response.data?.message || 'Password reset successfully. Redirecting to login...';
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to reset password. Please try again.'));
  }
}
