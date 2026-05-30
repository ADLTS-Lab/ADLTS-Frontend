import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { currentUserResponse, updateCandidateProfile } from '../../_mock-auth';

export async function GET(request: Request) {
  const result = currentUserResponse(request as Parameters<typeof currentUserResponse>[0], 'candidate');
  if (!result) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  return NextResponse.json(result);
}

export async function PATCH(request: NextRequest) {
  const result = await updateCandidateProfile(request);
  if (!result) {
    return NextResponse.json({ success: false, message: 'Update failed or Unauthorized.' }, { status: 400 });
  }

  return NextResponse.json(result);
}
