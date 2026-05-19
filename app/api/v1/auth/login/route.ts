import { NextResponse } from 'next/server';

import { loginUser } from '../../_mock-auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  const result = loginUser(email, password);
  if (!result) {
    return NextResponse.json(
      { success: false, message: 'Invalid email or password.' },
      { status: 401 }
    );
  }

  return NextResponse.json(result);
}
