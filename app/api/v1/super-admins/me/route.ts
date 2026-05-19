import { NextResponse } from 'next/server';

import { currentUserResponse } from '../../_mock-auth';

export async function GET(request: Request) {
  const result = currentUserResponse(request as Parameters<typeof currentUserResponse>[0], 'super_admin');
  if (!result) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  return NextResponse.json(result);
}
