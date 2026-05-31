import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUser } from '../../../_mock-auth';
import { deleteBooking } from '../../../_mock-bookings';

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> | { id: string } },
) {
  const resolvedParams = props.params && 'then' in props.params ? await props.params : props.params;
  const id = resolvedParams?.id;

  if (!id) {
    return NextResponse.json({ success: false, message: 'Booking ID is required.' }, { status: 400 });
  }

  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  const result = deleteBooking(user, id);
  if ('error' in result) {
    return NextResponse.json({ success: false, message: result.error }, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    message: 'Booking request deleted successfully.',
    data: result.data,
    booking: result.data,
  });
}