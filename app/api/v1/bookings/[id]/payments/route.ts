import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../_mock-auth';
import { createPaymentForBooking, listPaymentsForBooking } from '../../../_mock-payments';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> | { id: string } },
) {
  const resolvedParams = props.params && 'then' in props.params ? await props.params : props.params;
  const bookingId = resolvedParams?.id;

  if (!bookingId) return NextResponse.json({ success: false, message: 'Booking ID is required.' }, { status: 400 });

  const user = getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });

  const items = listPaymentsForBooking(bookingId);
  return NextResponse.json({ success: true, data: items, payments: items });
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> | { id: string } },
) {
  const resolvedParams = props.params && 'then' in props.params ? await props.params : props.params;
  const bookingId = resolvedParams?.id;

  if (!bookingId) return NextResponse.json({ success: false, message: 'Booking ID is required.' }, { status: 400 });

  const user = getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
  }

  // Candidate-only per backend contract.
  if (user.role !== 'candidate') {
    return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 });
  }

  const payment = createPaymentForBooking(bookingId, body);
  return NextResponse.json({
    success: true,
    data: payment,
    payment,
    checkout_url: payment.checkout_url,
  });
}
