import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../../_mock-auth';
import { retryPaymentForBooking } from '../../../../_mock-payments';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> | { id: string } },
) {
  const resolvedParams = props.params && 'then' in props.params ? await props.params : props.params;
  const bookingId = resolvedParams?.id;

  if (!bookingId) return NextResponse.json({ success: false, message: 'Booking ID is required.' }, { status: 400 });

  const user = getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });

  if (user.role !== 'candidate') {
    return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
  }

  const result = retryPaymentForBooking(bookingId);
  if ('error' in result) {
    return NextResponse.json({ success: false, message: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true, data: result.data, payment: result.data });
}
