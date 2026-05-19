import { NextResponse } from 'next/server';

import { passwordResetResponse } from '../../../_mock-auth';

export async function POST() {
  return NextResponse.json(passwordResetResponse());
}
