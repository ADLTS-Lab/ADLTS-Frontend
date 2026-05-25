import { NextResponse } from 'next/server';

import { verifyCandidateOtpUser } from '../../../_mock-auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = verifyCandidateOtpUser(body as Record<string, unknown>);

  if ('error' in result) {
    return NextResponse.json(
      { success: false, message: result.error },
      { status: result.status }
    );
  }

  return NextResponse.json(result);
}
