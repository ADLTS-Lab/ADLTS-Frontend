import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUser } from '../../_mock-auth';
import { markAllNotificationsRead } from '../../_mock-notifications';

export async function PATCH(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  const result = markAllNotificationsRead(user);
  return NextResponse.json({ success: true, data: result.data, notifications: result.data });
}