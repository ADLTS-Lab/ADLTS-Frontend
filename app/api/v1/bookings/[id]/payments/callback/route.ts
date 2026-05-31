import { NextRequest, NextResponse } from 'next/server';
import { handleProviderCallback } from '../../../../_mock-payments';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const headers = request.headers;
  const updated = handleProviderCallback(body, headers);
  if (!updated) return NextResponse.json({ success: false, message: 'Payment not found.' }, { status: 404 });

  return NextResponse.json({ success: true, data: updated, payment: updated });
}
