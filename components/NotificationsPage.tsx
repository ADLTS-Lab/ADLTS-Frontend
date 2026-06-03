"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, CheckCircle2, RefreshCw } from "lucide-react";

import {
  Alert,
  Button,
  Card,
  CardHeader,
  EmptyState,
  PageContainer,
  PageHeader,
  StatBlock,
  StatusBadge,
} from "@/app/components/ui";
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

  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function NotificationsPage() {
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
      setError(err instanceof Error ? err.message : "Unable to load this data right now. Refresh the page or contact support if the issue continues.");
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
      setError(err instanceof Error ? err.message : "Failed to update notification.");
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
      setError(err instanceof Error ? err.message : "Failed to update notifications.");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Important account, booking, payment, exam, and review updates will appear here."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleMarkAllRead()}
              disabled={loading || markingAll || unreadCount === 0}
              state={markingAll ? { loading: true } : undefined}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadNotifications()}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card padding="sm">
          <StatBlock label="Unread count" value={loading ? "-" : unreadCount} />
        </Card>
        <Card padding="sm" className="sm:col-span-2">
          <p className="text-[12px] font-medium text-[var(--text-secondary)]">Latest message</p>
          <p className="mt-2 text-[14px] text-[var(--text-primary)]">
            {loading ? "Loading notifications..." : notifications[0]?.message || "No notifications yet. Important account, booking, payment, exam, and review updates will appear here."}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">Notification list</h2>
          </div>
          <StatusBadge status={`${notifications.length} total`} tone="neutral" />
        </div>

        <div className="divide-y divide-[var(--border)] bg-[var(--surface)]">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse space-y-3 p-6">
                <div className="h-4 w-40 rounded-[6px] bg-[var(--surface-2)]" />
                <div className="h-3 w-full rounded-[6px] bg-[var(--surface-2)]" />
                <div className="h-3 w-5/6 rounded-[6px] bg-[var(--surface-2)]" />
              </div>
            ))
          ) : notifications.length === 0 ? (
            <EmptyState
              title="No notifications yet"
              description="Important account, booking, payment, exam, and review updates will appear here."
              className="border-0 bg-transparent"
            />
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className={`p-6 ${notification.read ? "bg-[var(--surface)]" : "bg-[var(--accent-subtle)]"}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">{notification.title}</h3>
                      {!notification.read ? <StatusBadge status="Unread" tone="warning" /> : null}
                    </div>
                    <p className="text-[14px] leading-6 text-[var(--text-secondary)]">{notification.message}</p>
                    <p className="text-[12px] font-medium text-[var(--text-tertiary)]">{formatTimestamp(notification.createdAt)}</p>
                  </div>

                  {!notification.read ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void handleMarkRead(notification.id)}
                      disabled={markingId === notification.id}
                      state={markingId === notification.id ? { loading: true } : undefined}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as read
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </PageContainer>
  );
}
