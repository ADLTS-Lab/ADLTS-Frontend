"use client";

import { FormEvent, useEffect, useState } from "react";
import { CalendarPlus, RefreshCw } from "lucide-react";
import { listInstitutions, type InstitutionAccount } from "@/services/institution-invitation.service";
import { createSlot, listSlots, type SlotRecord } from "@/services/slots.service";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  DataTable,
  Input,
  PageContainer,
  PageHeader,
  Select,
  StatBlock,
  type DataTableColumn,
} from "@/app/components/ui";

function formatDateTime(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function toLocalInputValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function AdminSlotsPage() {
  const [institutions, setInstitutions] = useState<InstitutionAccount[]>([]);
  const [selectedInstituteId, setSelectedInstituteId] = useState("");
  const [slots, setSlots] = useState<SlotRecord[]>([]);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    startsAt: toLocalInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    endsAt: toLocalInputValue(new Date(Date.now() + 25 * 60 * 60 * 1000)),
    capacity: "1",
  });

  async function loadInstitutions() {
    setIsLoadingInstitutions(true);
    setError("");
    try {
      const data = await listInstitutions();
      setInstitutions(data);
      setSelectedInstituteId((current) => current || data[0]?.id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load institutions.");
    } finally {
      setIsLoadingInstitutions(false);
    }
  }

  async function loadSlots(instituteId = selectedInstituteId) {
    if (!instituteId) {
      setSlots([]);
      return;
    }

    setIsLoadingSlots(true);
    setError("");
    try {
      setSlots(await listSlots(instituteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load slots.");
    } finally {
      setIsLoadingSlots(false);
    }
  }

  useEffect(() => {
    void loadInstitutions();
  }, []);

  useEffect(() => {
    if (selectedInstituteId) void loadSlots(selectedInstituteId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInstituteId]);

  async function handleCreateSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedInstituteId) {
      setError("Select an institution before creating a slot.");
      return;
    }

    setError("");
    setSuccess("");
    setIsCreating(true);

    try {
      await createSlot({
        instituteId: selectedInstituteId,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        capacity: Number(form.capacity),
      });
      setSuccess("Slot created.");
      await loadSlots(selectedInstituteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create slot.");
    } finally {
      setIsCreating(false);
    }
  }

  const totalCapacity = slots.reduce((sum, slot) => sum + slot.capacity, 0);
  const totalBooked = slots.reduce((sum, slot) => sum + slot.bookedCount, 0);
  const totalAvailable = slots.reduce((sum, slot) => sum + slot.available, 0);
  const columns: Array<DataTableColumn<SlotRecord>> = [
    { key: "start", header: "Start", cell: (slot) => formatDateTime(slot.startsAt) },
    { key: "end", header: "End", cell: (slot) => formatDateTime(slot.endsAt) },
    { key: "capacity", header: "Capacity", cell: (slot) => slot.capacity },
    { key: "booked", header: "Booked", cell: (slot) => slot.bookedCount },
    { key: "available", header: "Available", cell: (slot) => slot.available },
  ];

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Slot management"
        description="Create and review institution-scoped practical test slots."
        action={
          <Button type="button" variant="secondary" onClick={() => void loadSlots()} disabled={isLoadingSlots || !selectedInstituteId} state={isLoadingSlots ? { loading: true } : undefined}>
            <RefreshCw size={16} />
            Refresh slots
          </Button>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card padding="md" variant="metric"><StatBlock label="Capacity" value={isLoadingSlots ? "-" : totalCapacity} /></Card>
        <Card padding="md" variant="metric"><StatBlock label="Booked" value={isLoadingSlots ? "-" : totalBooked} /></Card>
        <Card padding="md" variant="metric"><StatBlock label="Available" value={isLoadingSlots ? "-" : totalAvailable} /></Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card padding="lg">
          <CardHeader title="Institution slots" description="The backend lists slots by institute, so select one institution to inspect its schedule." />
          <div className="mb-5">
            <Select
              label="Institution"
              value={selectedInstituteId}
              disabled={isLoadingInstitutions}
              onChange={(event) => setSelectedInstituteId(event.target.value)}
            >
              <option value="">Select institution</option>
              {institutions.map((institution) => (
                <option key={institution.id} value={institution.id}>{institution.name}</option>
              ))}
            </Select>
          </div>
          <DataTable
            columns={columns}
            data={slots}
            getRowKey={(slot) => slot.id}
            loading={isLoadingSlots || isLoadingInstitutions}
            emptyTitle="No slots found"
            emptyDescription={selectedInstituteId ? "Create a slot for the selected institution." : "Select an institution to load slots."}
          />
        </Card>

        <Card padding="lg">
          <CardHeader title="Create slot" description="Create a capacity-limited test slot for the selected institution." />
          <form onSubmit={handleCreateSlot} className="space-y-4">
            <Input label="Starts at" type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} required />
            <Input label="Ends at" type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} required />
            <Input label="Capacity" type="number" min="1" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} required />
            <Button type="submit" fullWidth disabled={!selectedInstituteId || isCreating} state={{ loading: isCreating }}>
              <CalendarPlus size={16} />
              Create slot
            </Button>
          </form>
        </Card>
      </section>
    </PageContainer>
  );
}
