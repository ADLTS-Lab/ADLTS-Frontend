"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, CheckCircle2, Clock3, RefreshCw } from "lucide-react";

import { Card } from "@/app/components/ui/Card";
import { useI18n } from "@/i18n/useI18n";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  getNotificationsPage,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotificationChanges,
  type AppNotification,
} from "@/services/notification.service";

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function NotificationsPage() {
  const { t } = useI18n();
  const { user } = useAuthSession();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getNotificationsPage({ page: 1, pageSize: 50 });
      setNotifications(result.items);
      setUnreadCount(result.unreadCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
    const unsubscribe = subscribeToNotificationChanges(() => {
      void loadNotifications();
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  const handleMarkRead = async (id: string) => {
    setMarkingId(id);
    try {
      const updated = await markNotificationAsRead(id);
      if (updated) {
        setNotifications((current) => current.map((item) => (item.id === id ? updated : item)));
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification.');
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const updated = await markAllNotificationsAsRead();
      if (updated) {
        setNotifications((current) => current.map((item) => ({ ...item, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notifications.');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 md:space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">{t('notifications')}</p>
          <h1 className="text-3xl font-bold text-slate-900">{t('notifications')}</h1>
          <p className="mt-1 text-sm text-slate-500">Read and manage your latest account alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void handleMarkAllRead()}
            disabled={loading || markingAll || unreadCount === 0}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            {markingAll ? 'Marking...' : t('markAllAsRead')}
          </button>
          <button
            onClick={() => void loadNotifications()}
            disabled={loading}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Unread</p>
          <p className="mt-2 text-3xl font-bold text-blue-900">{loading ? '—' : unreadCount}</p>
        </Card>
        <Card className="p-5 sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Latest Message</p>
          <p className="mt-2 text-sm text-slate-600">
            {loading ? 'Loading notifications...' : notifications[0]?.message || t('notificationsEmpty')}
          </p>
        </Card>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-700" />
            <h2 className="text-lg font-semibold text-slate-900">{t('notifications')}</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {notifications.length} total
          </div>
        </div>

        <div className="divide-y divide-slate-100 bg-white">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-3 p-6 animate-pulse">
                <div className="h-4 w-40 rounded bg-slate-100" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-5/6 rounded bg-slate-100" />
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <Clock3 className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              {t('notificationsEmpty')}
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className={`p-6 ${notification.read ? 'bg-white' : 'bg-blue-50/40'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{notification.title}</h3>
                      {!notification.read && (
                        <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          {t('unread')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{notification.message}</p>
                    <p className="text-xs font-medium text-slate-400">{formatTimestamp(notification.createdAt)}</p>
                  </div>

                  {!notification.read && (
                    <button
                      onClick={() => void handleMarkRead(notification.id)}
                      disabled={markingId === notification.id}
                      className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      {markingId === notification.id ? 'Marking...' : t('markAsRead')}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </main>
  );
}