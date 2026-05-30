export * from './notification.service';import api from '@/lib/api';

import { extractApiError, shouldUseLocalFallback } from './api-utils';

export type CandidateNotification = {
  id: string;
  candidateId?: string;
  title: string;
  message: string;
  pickupLocation?: string;
  pickupDate?: string;
  pickupTime?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface NotificationQueryParams {
  candidateId?: string;
  read?: boolean;
  page?: number;
  pageSize?: number;
}

export interface NotificationPageResult {
  items: CandidateNotification[];
  unreadCount: number;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const NOTIFICATION_STORAGE_KEY = 'adlts-candidate-notifications';
const ALLOW_LOCAL_FALLBACK =
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK !== 'false' : true;

const MOCK_NOTIFICATION_SEED: CandidateNotification[] = [
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
  {
    id: 'notif-2',
    candidateId: 'candidate-1',
    title: 'Booking Approved',
    message: 'Your booking request has been approved by Bole Driving Institute.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

function normalizeNotification(raw: unknown): CandidateNotification | null {
  if (!raw || typeof raw !== 'object') return null;

  const value = raw as Record<string, unknown>;
  const title = String(value.title ?? '').trim();
  const message = String(value.message ?? '').trim();

  if (!title && !message) return null;

  return {
    id: String(value.id ?? `notif-${Date.now()}`),
    candidateId: typeof value.candidateId === 'string' ? value.candidateId : typeof value.candidate_id === 'string' ? value.candidate_id : undefined,
    title: title || 'Notification',
    message: message || title || 'Notification',
    pickupLocation: typeof value.pickupLocation === 'string' ? value.pickupLocation : typeof value.pickup_location === 'string' ? value.pickup_location : undefined,
    pickupDate: typeof value.pickupDate === 'string' ? value.pickupDate : typeof value.pickup_date === 'string' ? value.pickup_date : undefined,
    pickupTime: typeof value.pickupTime === 'string' ? value.pickupTime : typeof value.pickup_time === 'string' ? value.pickup_time : undefined,
    read: Boolean(value.read),
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
  };
}

function sortNotifications(items: CandidateNotification[]): CandidateNotification[] {
  return [...items].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function paginateNotifications(items: CandidateNotification[], page = 1, pageSize = 10): NotificationPageResult {
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

function readStoredNotifications(): CandidateNotification[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return sortNotifications(parsed.map(normalizeNotification).filter((item): item is CandidateNotification => !!item));
  } catch {
    return [];
  }
}

function writeStoredNotifications(items: CandidateNotification[]): CandidateNotification[] {
  const normalized = sortNotifications(items);
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

function getSeedNotifications(): CandidateNotification[] {
  return MOCK_NOTIFICATION_SEED.map((item) => ({ ...item }));
}

function filterNotifications(items: CandidateNotification[], query: NotificationQueryParams): CandidateNotification[] {
  return items.filter((item) => {
    if (query.candidateId && item.candidateId && item.candidateId !== query.candidateId) return false;
    if (typeof query.read === 'boolean' && item.read !== query.read) return false;
    return true;
  });
}

function backendParams(query: NotificationQueryParams): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (query.candidateId) params.candidate_id = query.candidateId;
  if (typeof query.read === 'boolean') params.read = query.read ? 'true' : 'false';
  if (query.page) params.page = query.page;
  if (query.pageSize) params.page_size = query.pageSize;
  return params;
}

async function loadNotificationsFromApi(query: NotificationQueryParams): Promise<CandidateNotification[]> {
  const response = await api.get('/notifications', { params: backendParams(query) });
  const data = response.data?.data ?? response.data?.notifications ?? response.data;
  const collection = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return collection.map(normalizeNotification).filter((item): item is CandidateNotification => !!item);
}

export async function getCandidateNotifications(query: NotificationQueryParams = {}): Promise<NotificationPageResult> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;

  try {
    const notifications = sortNotifications(await loadNotificationsFromApi(query));
    return paginateNotifications(filterNotifications(notifications, query), page, pageSize);
  } catch (error) {
    const stored = readStoredNotifications();
    if (stored.length > 0) {
      return paginateNotifications(filterNotifications(stored, query), page, pageSize);
    }

    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      const seed = writeStoredNotifications(getSeedNotifications());
      return paginateNotifications(filterNotifications(seed, query), page, pageSize);
    }

    const seed = getSeedNotifications();
    return paginateNotifications(filterNotifications(seed, query), page, pageSize);
  }
}

export async function markNotificationAsRead(id: string): Promise<CandidateNotification | null> {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return normalizeNotification(response.data?.data ?? response.data?.notification ?? response.data);
  } catch (error) {
    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      const stored = readStoredNotifications();
      const index = stored.findIndex((notification) => notification.id === id);
      if (index === -1) return null;

      stored[index] = { ...stored[index], read: true, updatedAt: new Date().toISOString() };
      writeStoredNotifications(stored);
      return stored[index];
    }

    throw new Error(extractApiError(error, 'Unable to update notification.'));
  }
}