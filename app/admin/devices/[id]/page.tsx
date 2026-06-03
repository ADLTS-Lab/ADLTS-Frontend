"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, RefreshCw, Save } from "lucide-react";
import {
  downloadDeviceQr,
  getDevice,
  updateDevice,
  updateDeviceStatus,
  type DeviceRecord,
} from "@/services/devices.service";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  Input,
  PageContainer,
  PageHeader,
  Select,
  StatBlock,
  StatusBadge,
  Textarea,
} from "@/app/components/ui";

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function AdminDeviceDetailPage() {
  const params = useParams<{ id: string }>();
  const deviceId = params.id;
  const [device, setDevice] = useState<DeviceRecord | null>(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [allowedLevels, setAllowedLevels] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "maintenance">("active");
  const [qrPassword, setQrPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadDevice() {
    setIsLoading(true);
    setError("");
    try {
      const data = await getDevice(deviceId);
      setDevice(data);
      setStreamUrl(data?.streamUrl ?? "");
      setAllowedLevels((data?.allowedLevels ?? []).join(","));
      setStatus(data?.status === "Offline" ? "inactive" : data?.status === "Maintenance" ? "maintenance" : "active");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load device.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDevice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      await updateDevice(deviceId, {
        streamUrl: streamUrl.trim(),
        allowedLevels: allowedLevels.split(",").map((item) => item.trim()).filter(Boolean),
      });
      await updateDeviceStatus(deviceId, status);
      setSuccess("Device updated.");
      await loadDevice();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update device.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDownloadQr() {
    if (!qrPassword.trim()) {
      setError("Enter the current device password to generate the QR code.");
      return;
    }

    setError("");
    setSuccess("");
    setIsDownloadingQr(true);

    try {
      const blob = await downloadDeviceQr(deviceId, qrPassword);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `device-${device?.deviceCode || deviceId}-qr.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setSuccess("QR code downloaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to download device QR.");
    } finally {
      setIsDownloadingQr(false);
    }
  }

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title={device?.name || "Device detail"}
        description="Review device registration, update operational configuration, and generate check-in QR assets."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => void loadDevice()} disabled={isLoading} state={isLoading ? { loading: true } : undefined}>
              <RefreshCw size={16} />
              Refresh
            </Button>
            <ButtonLink href="/admin/devices" variant="outline">Back to devices</ButtonLink>
          </div>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <Card padding="md" variant="metric"><StatBlock label="Device code" value={isLoading ? "-" : device?.deviceCode || "-"} /></Card>
        <Card padding="md" variant="metric"><StatBlock label="Test center" value={isLoading ? "-" : device?.testCenterId || "-"} /></Card>
        <Card padding="md" variant="metric"><StatBlock label="Current test" value={isLoading ? "-" : device?.currentTestId || "-"} /></Card>
        <Card padding="md" variant="metric">
          <p className="text-[12px] font-medium text-[var(--text-secondary)]">Status</p>
          <div className="mt-2"><StatusBadge status={device?.status || "-"} /></div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card padding="lg">
          <CardHeader title="Configuration" description="Update stream URL, allowed levels, and operational status." />
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Stream URL" value={streamUrl} onChange={(event) => setStreamUrl(event.target.value)} />
            <Textarea label="Allowed levels" hint="Comma-separated level codes." value={allowedLevels} onChange={(event) => setAllowedLevels(event.target.value)} rows={3} />
            <Select label="Status" value={status} onChange={(event) => setStatus(event.target.value as "active" | "inactive" | "maintenance")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </Select>
            <Button type="submit" disabled={isSaving} state={{ loading: isSaving }}>
              <Save size={16} />
              Save device
            </Button>
          </form>
        </Card>

        <Card padding="lg">
          <CardHeader
            title="Check-in QR"
            description="Backend QR generation requires the device password because plaintext passwords are not stored."
          />
          <div className="space-y-4">
            <Input label="Device password" type="password" value={qrPassword} onChange={(event) => setQrPassword(event.target.value)} />
            <Button type="button" fullWidth disabled={isDownloadingQr} state={{ loading: isDownloadingQr }} onClick={() => void handleDownloadQr()}>
              <Download size={16} />
              Download QR
            </Button>
            <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[13px] leading-5 text-[var(--text-secondary)]">
              Last seen: {formatDate(device?.lastSeenAt)}
            </div>
          </div>
        </Card>
      </section>
    </PageContainer>
  );
}
