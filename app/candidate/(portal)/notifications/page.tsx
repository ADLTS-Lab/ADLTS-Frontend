"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Clock3, RefreshCw } from "lucide-react";

import { Card } from "@/app/components/ui/Card";
import { useI18n } from "@/i18n/useI18n";
import { getCandidateNotifications, markNotificationAsRead, type CandidateNotification } from "@/services/notifications.service";

export default function CandidateNotificationsPage() {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<CandidateNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getCandidateNotifications({ page: 1, pageSize: 50 });
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
  }, []);

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

  return (
    <main className="max-w-5xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Notifications</p>
          <h1 className="text-3xl font-bold text-slate-900">Candidate Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">Track booking, result, and license pickup updates.</p>
        </div>
        <button
          onClick={() => void loadNotifications()}
          disabled={loading}
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Unread</p>
          <p className="mt-2 text-3xl font-bold text-blue-900">{loading ? '—' : unreadCount}</p>
        </Card>
        <Card className="p-5 sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Latest Message</p>
          <p className="mt-2 text-sm text-slate-600">
            {loading ? 'Loading notifications...' : notifications[0]?.message || 'No notifications available yet.'}
          </p>
        </Card>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 bg-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">All Notifications</h2>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            <Bell className="h-3.5 w-3.5" />
            {notifications.length} total
          </div>
        </div>

        <div className="divide-y divide-slate-100 bg-white">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-6 animate-pulse space-y-3">
                <div className="h-4 w-40 rounded bg-slate-100" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-5/6 rounded bg-slate-100" />
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <Clock3 className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              No notifications yet.
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
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{notification.message}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {notification.pickupLocation && <span className="rounded-full bg-slate-100 px-2.5 py-1">{notification.pickupLocation}</span>}
                      {notification.pickupDate && <span className="rounded-full bg-slate-100 px-2.5 py-1">{notification.pickupDate}</span>}
                      {notification.pickupTime && <span className="rounded-full bg-slate-100 px-2.5 py-1">{notification.pickupTime}</span>}
                    </div>
                  </div>

                  {!notification.read && (
                    <button
                      onClick={() => void handleMarkRead(notification.id)}
                      disabled={markingId === notification.id}
                      className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      {markingId === notification.id ? 'Marking...' : 'Mark as read'}
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