"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { createDevice } from "@/services/devices.service";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  Input,
  PageContainer,
  PageHeader,
  Textarea,
} from "@/app/components/ui";

export default function AdminNewDevicePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    deviceCode: "",
    password: "",
    testCenterId: "",
    allowedLevels: "class_b",
    streamUrl: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const device = await createDevice({
        deviceCode: form.deviceCode.trim(),
        password: form.password,
        testCenterId: form.testCenterId.trim(),
        allowedLevels: form.allowedLevels.split(",").map((item) => item.trim()).filter(Boolean),
        streamUrl: form.streamUrl.trim(),
      });
      router.push(device?.id ? `/admin/devices/${encodeURIComponent(device.id)}` : "/admin/devices");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register device.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Register device"
        description="Register an ADLTS in-vehicle unit for a test center and allowed test levels."
        action={<ButtonLink href="/admin/devices" variant="outline">Back to devices</ButtonLink>}
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Card padding="lg" className="max-w-3xl">
        <CardHeader title="Device details" description="The device password is used by the check-in QR flow and is not retrievable later from the backend." />
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <Input label="Device code" value={form.deviceCode} onChange={(event) => setForm({ ...form, deviceCode: event.target.value })} required />
          <Input label="Device password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          <Input label="Test center ID" value={form.testCenterId} onChange={(event) => setForm({ ...form, testCenterId: event.target.value })} required />
          <Input label="Stream URL" value={form.streamUrl} onChange={(event) => setForm({ ...form, streamUrl: event.target.value })} placeholder="rtsp:// or http:// stream URL" />
          <div className="md:col-span-2">
            <Textarea
              label="Allowed levels"
              hint="Comma-separated level codes, for example: class_b,class_c"
              value={form.allowedLevels}
              onChange={(event) => setForm({ ...form, allowedLevels: event.target.value })}
              rows={3}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={isSubmitting} state={{ loading: isSubmitting }}>
              <Save size={16} />
              Register device
            </Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
}
