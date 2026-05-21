import { NextResponse } from 'next/server';
import { refreshUserTokens } from '../../_mock-auth';

export async function POST(request: Request) {
  let refreshToken = '';

  // Try to parse from request body first
  try {
    const body = await request.json();
    refreshToken = body?.refresh_token || '';
  } catch (e) {
    // Ignore, might be in header or empty body
  }

  // If not found in body, check Authorization header
  if (!refreshToken) {
    const authHeader = request.headers.get('authorization') || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) {
      refreshToken = match[1];
    }
  }

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, message: 'Refresh token is required.' },
      { status: 400 }
    );
  }

  const result = refreshUserTokens(refreshToken);
  if (!result) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired refresh token.' },
      { status: 401 }
    );
  }

  return NextResponse.json(result);
}
