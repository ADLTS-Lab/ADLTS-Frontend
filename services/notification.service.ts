import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

import { extractApiError, shouldUseLocalFallback } from './api-utils';

export type NotificationRole = 'all' | 'candidate' | 'admin' | 'expert' | 'institute' | 'super_admin' | 'transport_authority';

export type NotificationType =
  | 'booking_approved'
  | 'booking_rejected'
  | 'exam_scheduled'
  | 'test_passed'
  | 'license_pickup'
  | 'booking_received'
  | 'system_alert'
  | 'review_assigned';

export type NotificationMetadata = {
  bookingId?: string;
  institutionName?: string;
  candidateName?: string;
  examDate?: string;
  pickupLocation?: string;
  pickupDate?: string;
  pickupTime?: string;
  session?: string;
};

export type AppNotification = {
  id: string;
  recipientRole: NotificationRole;
  recipientUserId?: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: NotificationMetadata;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface NotificationQueryParams {
  recipientRole?: NotificationRole;
  recipientUserId?: string;
  read?: boolean;
  page?: number;
  pageSize?: number;
}

export interface NotificationPageResult {
  items: AppNotification[];
  unreadCount: number;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const NOTIFICATION_STORAGE_KEY = 'adlts-notifications';
const ALLOW_LOCAL_FALLBACK =
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK !== 'false' : true;

const NOTIFICATION_SEEDS: AppNotification[] = [
  {
    id: 'notif-candidate-approved',
    recipientRole: 'candidate',
    type: 'booking_approved',
    title: 'Booking Approved',
    message: 'Your booking request has been approved.',
    metadata: { institutionName: 'Bole Driving Institute' },
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'notif-candidate-rejected',
    recipientRole: 'candidate',
    type: 'booking_rejected',
    title: 'Booking Rejected',
    message: 'Your booking request has been rejected.',
    metadata: { institutionName: 'Bole Driving Institute' },
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'notif-candidate-exam',
    recipientRole: 'candidate',
    type: 'exam_scheduled',
    title: 'Exam Scheduled',
    message: 'Your exam is scheduled for June 15, 2026.',
    metadata: { examDate: 'June 15, 2026', session: 'Morning' },
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
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
  {
    id: 'notif-candidate-license',
    recipientRole: 'candidate',
    type: 'license_pickup',
    title: 'License Pickup Notification',
    message: 'Collect your license from Bole Transport Authority Office on June 20, 2026 at 10:00 AM.',
    metadata: {
      pickupLocation: 'Bole Transport Authority Office',
      pickupDate: 'June 20, 2026',
      pickupTime: '10:00 AM',
    },
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
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
  {
    id: 'notif-institute-review',
    recipientRole: 'institute',
    type: 'review_assigned',
    title: 'Candidate Review Assigned',
    message: 'You have been assigned to review a candidate enrollment.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
  },
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
];

type NotificationContext = {
  userId?: string;
  role?: NotificationRole;
};

let storageListenerAttached = false;
const notificationListeners = new Set<() => void>();

function getNotificationContext(): NotificationContext {
  const user = useAuthStore.getState().user;
  return {
    userId: user?.id,
    role: (user?.role as NotificationRole | undefined) ?? undefined,
  };
}

function normalizeNotification(raw: unknown): AppNotification | null {
  if (!raw || typeof raw !== 'object') return null;

  const value = raw as Record<string, unknown>;
  const title = String(value.title ?? '').trim();
  const message = String(value.message ?? '').trim();
  if (!title && !message) return null;

  const recipientRole = String(value.recipientRole ?? value.recipient_role ?? 'candidate') as NotificationRole;

  return {
    id: String(value.id ?? `notif-${Date.now()}`),
    recipientRole,
    recipientUserId: typeof value.recipientUserId === 'string' ? value.recipientUserId : typeof value.recipient_user_id === 'string' ? value.recipient_user_id : undefined,
    type: (String(value.type ?? 'system_alert') as NotificationType),
    title: title || 'Notification',
    message: message || title || 'Notification',
    metadata: typeof value.metadata === 'object' && value.metadata ? (value.metadata as NotificationMetadata) : undefined,
    read: Boolean(value.read),
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : typeof value.created_at === 'string' ? value.created_at : new Date().toISOString(),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : typeof value.updated_at === 'string' ? value.updated_at : new Date().toISOString(),
  };
}

function sortNotifications(items: AppNotification[]): AppNotification[] {
  return [...items].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function paginateNotifications(items: AppNotification[], page = 1, pageSize = 10): NotificationPageResult {
  const safePageSize = Math.max(1, pageSize || 10);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, page || 1), totalPages);
  const start = (safePage - 1) * safePageSize;
  const unreadCount = items.filter((item) => !item.read).length;

  return {
    items: items.slice(start, start + safePageSize),
    unreadCount,
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}

function matchesContext(notification: AppNotification, context: NotificationContext, query: NotificationQueryParams): boolean {
  const targetRole = query.recipientRole ?? context.role;
  if (targetRole && notification.recipientRole !== 'all' && notification.recipientRole !== targetRole) return false;

  if (query.recipientUserId && notification.recipientUserId && notification.recipientUserId !== query.recipientUserId) return false;
  if (context.userId && notification.recipientUserId && notification.recipientUserId !== context.userId) return false;

  if (typeof query.read === 'boolean' && notification.read !== query.read) return false;
  return true;
}

function readStoredNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return sortNotifications(parsed.map(normalizeNotification).filter((item): item is AppNotification => !!item));
  } catch {
    return [];
  }
}

function writeStoredNotifications(items: AppNotification[]): AppNotification[] {
  const normalized = sortNotifications(items);
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(normalized));
  }
  notificationListeners.forEach((listener) => listener());
  return normalized;
}

function ensureStorageListener() {
  if (typeof window === 'undefined' || storageListenerAttached) return;

  window.addEventListener('storage', (event) => {
    if (event.key === NOTIFICATION_STORAGE_KEY) {
      notificationListeners.forEach((listener) => listener());
    }
  });

  storageListenerAttached = true;
}

function emitNotificationChange() {
  notificationListeners.forEach((listener) => listener());
}

function getSeedNotifications(context: NotificationContext): AppNotification[] {
  return NOTIFICATION_SEEDS.filter((item) => matchesContext(item, context, {}));
}

function filterNotifications(items: AppNotification[], context: NotificationContext, query: NotificationQueryParams): AppNotification[] {
  return items.filter((item) => matchesContext(item, context, query));
}

function backendParams(query: NotificationQueryParams): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (typeof query.read === 'boolean') params.read = query.read ? 'true' : 'false';
  if (query.page) params.page = query.page;
  if (query.pageSize) params.page_size = query.pageSize;
  return params;
}

async function loadNotificationsFromApi(query: NotificationQueryParams): Promise<AppNotification[]> {
  const response = await api.get('/notifications', { params: backendParams(query) });
  const data = response.data?.data ?? response.data?.notifications ?? response.data;
  const collection = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return collection.map(normalizeNotification).filter((item): item is AppNotification => !!item);
}

function getCurrentPageSize(query: NotificationQueryParams): number {
  return query.pageSize ?? 10;
}

export async function getNotificationsPage(query: NotificationQueryParams = {}): Promise<NotificationPageResult> {
  const context = getNotificationContext();
  const page = query.page ?? 1;
  const pageSize = getCurrentPageSize(query);

  try {
    const notifications = sortNotifications(await loadNotificationsFromApi(query));
    return paginateNotifications(filterNotifications(notifications, context, query), page, pageSize);
  } catch (error) {
    const stored = readStoredNotifications();
    const scopedStored = filterNotifications(stored, context, query);
    if (scopedStored.length > 0) {
      return paginateNotifications(scopedStored, page, pageSize);
    }

    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      const seeded = writeStoredNotifications(getSeedNotifications(context));
      return paginateNotifications(filterNotifications(seeded, context, query), page, pageSize);
    }

    const seed = getSeedNotifications(context);
    return paginateNotifications(filterNotifications(seed, context, query), page, pageSize);
  }
}

export async function getUnreadNotificationCount(query: Omit<NotificationQueryParams, 'read' | 'page' | 'pageSize'> = {}): Promise<number> {
  const result = await getNotificationsPage({ ...query, read: false, page: 1, pageSize: 1 });
  return result.unreadCount;
}

export async function markNotificationAsRead(id: string): Promise<AppNotification | null> {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return normalizeNotification(response.data?.data ?? response.data?.notification ?? response.data);
  } catch (error) {
    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      const context = getNotificationContext();
      const stored = readStoredNotifications();
      const index = stored.findIndex((notification) => notification.id === id && matchesContext(notification, context, {}));
      if (index === -1) return null;

      stored[index] = { ...stored[index], read: true, updatedAt: new Date().toISOString() };
      writeStoredNotifications(stored);
      emitNotificationChange();
      return stored[index];
    }

    throw new Error(extractApiError(error, 'Unable to update notification.'));
  }
}

export async function markAllNotificationsAsRead(): Promise<AppNotification[]> {
  try {
    const response = await api.patch('/notifications/read-all');
    const data = response.data?.data ?? response.data?.notifications ?? response.data;
    const collection = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
    return collection.map(normalizeNotification).filter((item): item is AppNotification => !!item);
  } catch (error) {
    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      const context = getNotificationContext();
      const stored = readStoredNotifications();
      const updated = stored.map((notification) =>
        matchesContext(notification, context, {}) ? { ...notification, read: true, updatedAt: new Date().toISOString() } : notification
      );
      writeStoredNotifications(updated);
      emitNotificationChange();
      return updated;
    }

    throw new Error(extractApiError(error, 'Unable to mark notifications as read.'));
  }
}

export function subscribeToNotificationChanges(listener: () => void): () => void {
  ensureStorageListener();
  notificationListeners.add(listener);

  return () => {
    notificationListeners.delete(listener);
  };
}