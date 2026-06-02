"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  PageContainer,
  PageHeader,
  StatusBadge,
  ui,
} from "@/app/components/ui";
import {
  Battery,
  CalendarClock,
  Megaphone,
  Plus,
  RefreshCcw,
  Settings,
  Ticket,
  Thermometer,
  Wifi,
  AlertTriangle,
  Power,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { listDevicesSafe, type DeviceRecord, type DeviceSummary } from "@/services/devices.service";

function isAdminPortalRole(role: string | null | undefined) {
  return role === "admin" || role === "super_admin";
}

function getStatusTone(status: DeviceRecord["status"] | string) {
  if (status === "Online") return "success";
  if (status === "Warning") return "warning";
  return "inactive";
}

function getStatusLabel(status: DeviceRecord["status"] | string) {
  return status || "Unknown";
}

export default function AdminDeviceDashboard() {
  const { isAuthenticated, user } = useAuthStore();
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [summary, setSummary] = useState<DeviceSummary>({ total: 0, online: 0, warning: 0, offline: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  const { total: totalDevices, online: onlineCount, warning: warningCount, offline: offlineCount } = summary;

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        eyebrow="Admin Portal"
        title="Device Management"
        description={`${totalDevices} connected biometric units tracked in real time.`}
        action={
          <Button variant="outline" size="sm">
            <Megaphone size={16} className="mr-2" />
            Register device
          </Button>
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard label="Total devices" value={totalDevices.toString()} sub="Connected units" tone="info" />
        <SummaryCard label="Online" value={onlineCount.toString()} sub="Healthy" tone="success" />
        <SummaryCard label="Warning" value={warningCount.toString()} sub="Needs action" tone="warning" />
        <SummaryCard label="Offline" value={offlineCount.toString()} sub="Needs follow-up" tone="error" />
      </section>

      {error && <Alert variant="error">{error}</Alert>}

      <Card className="overflow-hidden p-0">
        <CardHeader
          title="Biometric devices"
          description="Status, battery, and connectivity details for exam devices."
        />

        {isLoading ? (
          <div className="p-6">
            <p className="text-sm text-[var(--adlts-ink-600)]">Loading devices…</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="border-t border-[var(--adlts-divider)] p-6 text-center text-[var(--adlts-ink-600)]">No devices found.</div>
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {devices.map((device) => (
              <DeviceNode key={device.name} {...device} />
            ))}
            <Button variant="secondary" className="h-auto justify-center border-dashed py-6">
              <Plus size={16} />
              Add Device
            </Button>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}

const SummaryCard = ({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "info" | "success" | "warning" | "error";
}) => {
  return (
    <Card padding="md" className="space-y-1">
      <p className={ui.statLabel}>{label}</p>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-[var(--adlts-ink-600)]">{sub}</p>
      <StatusBadge status={label} tone={tone} />
    </Card>
  );
};

const DeviceNode = ({
  type,
  name,
  location,
  utilization,
  battery,
  detailLabel,
  detailValue,
  status,
}: {
  type: string;
  name: string;
  location: string;
  utilization: number;
  battery: number;
  detailLabel: string;
  detailValue: string;
  status: string;
}) => {
  const isOffline = status === "Offline";

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={ui.statLabel}>{type}</p>
          <h3 className="text-lg font-semibold text-[var(--adlts-ink-900)]">{name}</h3>
          <p className="mt-1 text-xs text-[var(--adlts-ink-500)]">📍 {location}</p>
        </div>
        <StatusBadge status={getStatusLabel(status)} tone={getStatusTone(status)} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold uppercase tracking-wide text-[var(--adlts-ink-500)]">
          <span>Storage utilization</span>
          <span>{utilization}%</span>
        </div>
        <div className="h-1.5 w-full bg-[var(--adlts-surface-soft)] rounded-full">
          <div
            className={`h-full rounded-full ${utilization > 80 ? "bg-[var(--adlts-warning-600)]" : "bg-[var(--adlts-blue-600)]"}`}
            style={{ width: `${utilization}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-3 flex items-center gap-3">
          <CalendarClock
            size={18}
            className={isOffline ? "text-[var(--adlts-ink-400)]" : "text-[var(--adlts-blue-700)]"}
          />
          <div>
            <p className={ui.statLabel}>Uptime</p>
            <p className="text-sm font-semibold text-[var(--adlts-ink-900)]">{isOffline ? "—" : `${battery}%`}</p>
          </div>
        </div>

        <div className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-3 flex items-center gap-3">
          {detailLabel === "Latency" ? (
            <RefreshCcw size={18} className="text-[var(--adlts-blue-700)]" />
          ) : detailLabel === "Signal" ? (
            <Wifi size={18} className="text-[var(--adlts-blue-700)]" />
          ) : (
            <Thermometer size={18} className="text-[var(--adlts-blue-700)]" />
          )}
          <div>
            <p className={ui.statLabel}>{detailLabel}</p>
            <p className="text-sm font-semibold text-[var(--adlts-ink-900)]">{detailValue}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {isOffline ? (
          <>
            <Button variant="primary" size="sm" className="flex-1">
              <Power size={12} /> Wake remote
            </Button>
            <Button variant="secondary" size="sm" className="flex-1">
              <Ticket size={12} /> Ticket
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" size="sm" className="flex-1">
              <Settings size={12} /> Configure
            </Button>
            <Button variant="danger" size="sm" className="flex-1">
              <AlertTriangle size={12} /> Emergency stop
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};
