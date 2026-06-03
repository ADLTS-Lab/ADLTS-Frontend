"use client";

import { type ReactNode, useEffect, useState } from "react";
import {
  AlertTriangle,
  Battery,
  CalendarClock,
  Megaphone,
  Power,
  RefreshCcw,
  Settings,
  Thermometer,
  Ticket,
  Wifi,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { listDevicesSafe, type DeviceRecord, type DeviceSummary } from "@/services/devices.service";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  EmptyState,
  PageContainer,
  PageHeader,
  ProgressBar,
  StatBlock,
  StatusBadge,
  ui,
} from "@/app/components/ui";

function isAdminPortalRole(role: string | null | undefined) {
  return role === "admin" || role === "super_admin";
}

function getStatusTone(status: DeviceRecord["status"] | string) {
  if (status === "Online") return "success";
  if (status === "Warning") return "warning";
  return "inactive";
}

export default function AdminDeviceDashboard() {
  const { isAuthenticated, user } = useAuthStore();
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [summary, setSummary] = useState<DeviceSummary>({ total: 0, online: 0, warning: 0, offline: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDevices = async () => {
    setIsLoading(true);
    setError("");

    const { devices: data, summary: nextSummary, error: nextError } = await listDevicesSafe();
    setDevices(data);
    setSummary(nextSummary);
    setError(nextError ?? "");
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isAuthenticated || !isAdminPortalRole(user?.role)) return;

    let isMounted = true;
    setIsLoading(true);
    setError("");

    listDevicesSafe()
      .then(({ devices: data, summary: nextSummary, error: nextError }) => {
        if (!isMounted) return;
        setDevices(data);
        setSummary(nextSummary);
        setError(nextError ?? "");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.role]);

  if ((!isAuthenticated && typeof window === "undefined") || (isAuthenticated && !isAdminPortalRole(user?.role))) {
    return null;
  }

  const displayUnavailable = Boolean(error) && devices.length === 0;
  const metricValue = (value: number) => (displayUnavailable ? "-" : value);

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Device management"
        description="Track connected biometric units, status, utilization, connectivity, and operational warnings."
        action={
          <Button variant="outline" size="sm">
            <Megaphone size={16} />
            Register device
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total devices" value={isLoading ? "-" : metricValue(summary.total)} sub="Registered biometric units" />
        <SummaryCard label="Online" value={isLoading ? "-" : metricValue(summary.online)} sub="Available devices" />
        <SummaryCard label="Warning" value={isLoading ? "-" : metricValue(summary.warning)} sub="Needs review" />
        <SummaryCard label="Offline" value={isLoading ? "-" : metricValue(summary.offline)} sub="Needs follow-up" />
      </section>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card padding="md" variant="soft">
        <p className="text-[14px] leading-6 text-[var(--text-secondary)]">
          Warnings should be reviewed before the next exam session. Offline devices may require remote wake, ticket creation, or local inspection.
        </p>
      </Card>

      <Card className="overflow-hidden p-0">
        <CardHeader
          title="Device grid"
          description="Registered biometric units will appear here after the backend returns device data."
          action={
            <Button type="button" variant="secondary" size="sm" onClick={() => void loadDevices()} disabled={isLoading} state={isLoading ? { loading: true } : undefined}>
              <RefreshCcw size={16} />
              Refresh
            </Button>
          }
        />

        {isLoading ? (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} padding="md" className="animate-pulse space-y-4">
                <div className="h-5 w-40 rounded-[6px] bg-[var(--surface-2)]" />
                <div className="h-4 w-full rounded-[6px] bg-[var(--surface-2)]" />
                <div className="h-16 rounded-[8px] bg-[var(--surface-2)]" />
              </Card>
            ))}
          </div>
        ) : devices.length === 0 ? (
          <EmptyState
            title="No devices found"
            description="Registered biometric units will appear here after backend data is available."
            className="border-0 bg-transparent"
          />
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {devices.map((device) => (
              <DeviceNode key={device.id || device.name} {...device} />
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <Card padding="md" className="space-y-1">
      <StatBlock label={label} value={value} />
      <p className="text-[13px] text-[var(--text-secondary)]">{sub}</p>
    </Card>
  );
}

function DeviceNode({
  type,
  name,
  location,
  utilization,
  battery,
  detailLabel,
  detailValue,
  status,
}: DeviceRecord) {
  const isOffline = status === "Offline";

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={ui.statLabel}>{type}</p>
          <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">{name}</h3>
          <p className="mt-1 text-[12px] text-[var(--text-tertiary)]">{location}</p>
        </div>
        <StatusBadge status={status || "Unknown"} tone={getStatusTone(status)} />
      </div>

      <ProgressBar value={utilization} label="Storage utilization" />

      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={<CalendarClock size={18} className={isOffline ? "text-[var(--text-tertiary)]" : "text-[var(--accent)]"} />}
          label="Uptime"
          value={isOffline ? "-" : `${battery}%`}
        />
        <MetricCard
          icon={detailLabel === "Latency" ? <RefreshCcw size={18} className="text-[var(--accent)]" /> : detailLabel === "Signal" ? <Wifi size={18} className="text-[var(--accent)]" /> : <Thermometer size={18} className="text-[var(--accent)]" />}
          label={detailLabel}
          value={detailValue}
        />
      </div>

      <div className="flex gap-2">
        {isOffline ? (
          <>
            <Button variant="primary" size="sm" className="flex-1">
              <Power size={12} />
              Wake remote
            </Button>
            <Button variant="secondary" size="sm" className="flex-1">
              <Ticket size={12} />
              Ticket
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" size="sm" className="flex-1">
              <Settings size={12} />
              Configure
            </Button>
            <Button variant="danger" size="sm" className="flex-1">
              <AlertTriangle size={12} />
              Emergency stop
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-3">
      {icon}
      <div>
        <p className={ui.statLabel}>{label}</p>
        <p className="text-[14px] font-semibold text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}
