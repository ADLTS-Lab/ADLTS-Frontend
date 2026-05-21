import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, listCandidates } from '../_mock-auth';

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;

  const candidatesList = listCandidates(search);
  return NextResponse.json({ success: true, data: candidatesList });
}
