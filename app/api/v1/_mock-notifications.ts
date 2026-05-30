import type { NextRequest } from 'next/server';

import type { MockUser } from './_mock-auth';

export type MockNotification = {
  id: string;
  candidateId: string;
  title: string;
  message: string;
  pickupLocation?: string;
  pickupDate?: string;
  pickupTime?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

type MockNotificationState = {
  notifications: Map<string, MockNotification>;
};

declare global {
  // eslint-disable-next-line no-var
  var __adltsMockNotificationState: MockNotificationState | undefined;
}

const state: MockNotificationState = globalThis.__adltsMockNotificationState ?? {
  notifications: new Map<string, MockNotification>([
    [
      'notif-1',
      {
        id: 'notif-1',
        candidateId: 'candidate-1',
        title: 'Congratulations!',
        message: 'Congratulations! You passed your driving test. Collect your license at Bole Transport Authority Office on June 10, 2026 at 10:00 AM.',
        pickupLocation: 'Bole Transport Authority Office',
        pickupDate: 'June 10, 2026',
        pickupTime: '10:00 AM',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
    ],
    [
      'notif-2',
      {
        id: 'notif-2',
        candidateId: 'candidate-1',
        title: 'Booking Approved',
        message: 'Your booking request has been approved by Bole Driving Institute.',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ],
  ]),
};

globalThis.__adltsMockNotificationState = state;

function getCandidateId(user: MockUser) {
  return user.id;
}

function toApiNotification(notification: MockNotification) {
  return {
    ...notification,
    read: notification.read,
    created_at: notification.createdAt,
    updated_at: notification.updatedAt,
  };
}

export function listNotifications(user: MockUser, query: { read?: boolean }) {
  const candidateId = getCandidateId(user);

  const items = Array.from(state.notifications.values()).filter((notification) => notification.candidateId === candidateId)
    .filter((notification) => (typeof query.read === 'boolean' ? notification.read === query.read : true))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  return {
    items: items.map(toApiNotification),
    unreadCount: items.filter((item) => !item.read).length,
  };
}

export function markNotificationRead(user: MockUser, id: string) {
  const notification = state.notifications.get(id);
  if (!notification || notification.candidateId !== getCandidateId(user)) {
    return { error: 'Notification not found.', status: 404 as const };
  }

  notification.read = true;
  notification.updatedAt = new Date().toISOString();
  state.notifications.set(id, notification);

  return { data: toApiNotification(notification) };
}

export function parseNotificationQuery(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const read = searchParams.get('read');

  return {
    read: read === 'true' ? true : read === 'false' ? false : undefined,
  };
}