import { NextResponse } from 'next/server';

import { logoutUser } from '../../_mock-auth';

export async function POST(request: Request) {
  return NextResponse.json(logoutUser(request as Parameters<typeof logoutUser>[0]));
}
