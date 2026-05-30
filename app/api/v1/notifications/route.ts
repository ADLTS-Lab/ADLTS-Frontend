import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUser } from '../_mock-auth';
import { listNotifications, parseNotificationQuery } from '../_mock-notifications';

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  const result = listNotifications(user, parseNotificationQuery(request));
  return NextResponse.json({ success: true, data: result.items, unreadCount: result.unreadCount });
}