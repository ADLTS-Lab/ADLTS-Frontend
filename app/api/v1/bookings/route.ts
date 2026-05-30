import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUser } from '../_mock-auth';
import { createBooking, listBookings, parseBookingListQuery } from '../_mock-bookings';

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  if (!['candidate', 'institute', 'admin', 'super_admin'].includes(user.role)) {
    return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
  }

  const result = listBookings(user, parseBookingListQuery(request));
  return NextResponse.json({ success: true, data: result.items, ...result });
}

export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const result = createBooking(user, body);
  if ('error' in result) {
    return NextResponse.json({ success: false, message: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true, data: result.data, booking: result.data });
}
