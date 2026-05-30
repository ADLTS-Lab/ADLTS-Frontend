import type { NextRequest } from 'next/server';

import type { MockUser } from './_mock-auth';

export type MockNotification = {
  id: string;
  recipientRole: string;
  recipientUserId?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
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
      'notif-candidate-approved',
      {
        id: 'notif-candidate-approved',
        recipientRole: 'candidate',
        type: 'booking_approved',
        title: 'Booking Approved',
        message: 'Your booking request has been approved.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      },
    ],
    [
      'notif-candidate-rejected',
      {
        id: 'notif-candidate-rejected',
        recipientRole: 'candidate',
        type: 'booking_rejected',
        title: 'Booking Rejected',
        message: 'Your booking request has been rejected.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
    ],
    [
      'notif-candidate-exam',
      {
        id: 'notif-candidate-exam',
        recipientRole: 'candidate',
        type: 'exam_scheduled',
        title: 'Exam Scheduled',
        message: 'Your exam is scheduled for June 15, 2026.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      },
    ],
    [
      'notif-candidate-pass',
      {
        id: 'notif-candidate-pass',
        recipientRole: 'candidate',
        type: 'test_passed',
        title: 'Test Passed',
        message: 'Congratulations! You passed your driving test.',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ],
    [
      'notif-candidate-license',
      {
        id: 'notif-candidate-license',
        recipientRole: 'candidate',
        type: 'license_pickup',
        title: 'License Pickup Notification',
        message: 'Collect your license from Bole Transport Authority Office on June 20, 2026 at 10:00 AM.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
    ],
    [
      'notif-institute-booking',
      {
        id: 'notif-institute-booking',
        recipientRole: 'institute',
        type: 'booking_received',
        title: 'New Booking Request',
        message: 'A new candidate booking request is waiting for review.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
    [
      'notif-admin-alert',
      {
        id: 'notif-admin-alert',
        recipientRole: 'admin',
        type: 'system_alert',
        title: 'System Alert',
        message: 'A new report has been generated for review.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
    ],
    [
      'notif-super-admin-alert',
      {
        id: 'notif-super-admin-alert',
        recipientRole: 'super_admin',
        type: 'system_alert',
        title: 'Platform Alert',
        message: 'A transport authority workflow requires attention.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
    ],
    [
      'notif-transport-license',
      {
        id: 'notif-transport-license',
        recipientRole: 'transport_authority',
        type: 'license_pickup',
        title: 'Pickup Ready',
        message: 'A license pickup notification is ready to be issued.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
    ],
    [
      'notif-expert-review',
      {
        id: 'notif-expert-review',
        recipientRole: 'expert',
        type: 'review_assigned',
        title: 'Review Assigned',
        message: 'A candidate assessment is pending expert review.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      },
    ],
  ]),
};

globalThis.__adltsMockNotificationState = state;

function matchesRecipient(notification: MockNotification, user: MockUser) {
  return notification.recipientRole === 'all' || notification.recipientRole === user.role;
}

function toApiNotification(notification: MockNotification) {
  return {
    ...notification,
    created_at: notification.createdAt,
    updated_at: notification.updatedAt,
    recipient_role: notification.recipientRole,
    recipient_user_id: notification.recipientUserId,
  };
}

export function listNotifications(user: MockUser, query: { read?: boolean }) {
  const items = Array.from(state.notifications.values())
    .filter((notification) => matchesRecipient(notification, user))
    .filter((notification) => (typeof query.read === 'boolean' ? notification.read === query.read : true))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  return {
    items: items.map(toApiNotification),
    unreadCount: items.filter((item) => !item.read).length,
  };
}

export function markNotificationRead(user: MockUser, id: string) {
  const notification = state.notifications.get(id);
  if (!notification || !matchesRecipient(notification, user)) {
    return { error: 'Notification not found.', status: 404 as const };
  }

  notification.read = true;
  notification.updatedAt = new Date().toISOString();
  state.notifications.set(id, notification);

  return { data: toApiNotification(notification) };
}

export function markAllNotificationsRead(user: MockUser) {
  const updated: MockNotification[] = [];
  for (const [id, notification] of state.notifications.entries()) {
    if (!matchesRecipient(notification, user)) continue;
    const next = { ...notification, read: true, updatedAt: new Date().toISOString() };
    state.notifications.set(id, next);
    updated.push(next);
  }

  return { data: updated.map(toApiNotification) };
}

export function parseNotificationQuery(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const read = searchParams.get('read');

  return {
    read: read === 'true' ? true : read === 'false' ? false : undefined,
  };
}