import { NextResponse } from 'next/server';

import { changePassword } from '../../../_mock-auth';

export async function PATCH(request: Request) {
  const result = await changePassword(request as Parameters<typeof changePassword>[0]);
  if (!result) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  if ('error' in result) {
    return NextResponse.json({ success: false, message: result.error }, { status: result.status });
  }

  return NextResponse.json(result);
}