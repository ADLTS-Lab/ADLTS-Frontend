import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUser } from '../../../_mock-auth';
import { markNotificationRead } from '../../../_mock-notifications';

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> | { id: string } },
) {
  const resolvedParams = props.params && 'then' in props.params ? await props.params : props.params;
  const id = resolvedParams?.id;

  if (!id) {
    return NextResponse.json({ success: false, message: 'Notification ID is required.' }, { status: 400 });
  }

  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  const result = markNotificationRead(user, id);
  if ('error' in result) {
    return NextResponse.json({ success: false, message: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true, data: result.data, notification: result.data });
}