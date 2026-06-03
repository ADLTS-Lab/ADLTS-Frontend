"use client";

import { FormEvent, useEffect, useState } from "react";
import { ClipboardList, Plus, RefreshCw } from "lucide-react";
import {
  createManeuverConfig,
  createTestPlan,
  listTestPlans,
  publishTestPlan,
  type TestPlan,
} from "@/services/test-plans.service";
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
  StatusBadge,
  Textarea,
  type DataTableColumn,
} from "@/app/components/ui";

const MANEUVER_TYPES = [
  "parallel_parking",
  "three_point_turn",
  "lane_change",
  "traffic_signal",
  "reverse_parking",
  "roundabout",
];

export default function AdminTestPlansPage() {
  const [plans, setPlans] = useState<TestPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isAddingManeuver, setIsAddingManeuver] = useState(false);
  const [isPublishing, setIsPublishing] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    passThreshold: "70",
  });
  const [maneuverForm, setManeuverForm] = useState({
    maneuverType: "parallel_parking",
    displayName: "Parallel parking",
    sequenceNumber: "1",
    weight: "1",
    passThreshold: "70",
    tolerancePx: "20",
    minFramesRequired: "30",
  });

  async function loadPlans() {
    setIsLoading(true);
    setError("");
    try {
      const data = await listTestPlans();
      setPlans(data);
      setSelectedPlanId((current) => current || data[0]?.id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load test plans.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPlans();
  }, []);

  async function handleCreatePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsCreatingPlan(true);

    try {
      const created = await createTestPlan({
        name: planForm.name.trim(),
        description: planForm.description.trim(),
        passThreshold: Number(planForm.passThreshold),
      });
      setSuccess("Test plan created.");
      setPlanForm({ name: "", description: "", passThreshold: "70" });
      await loadPlans();
      if (created?.id) setSelectedPlanId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create test plan.");
    } finally {
      setIsCreatingPlan(false);
    }
  }

  async function handleAddManeuver(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPlanId) {
      setError("Select a test plan before adding a maneuver.");
      return;
    }

    setError("");
    setSuccess("");
    setIsAddingManeuver(true);

    try {
      await createManeuverConfig(selectedPlanId, {
        maneuverType: maneuverForm.maneuverType,
        displayName: maneuverForm.displayName.trim(),
        sequenceNumber: Number(maneuverForm.sequenceNumber),
        weight: Number(maneuverForm.weight),
        passThreshold: Number(maneuverForm.passThreshold),
        tolerancePx: Number(maneuverForm.tolerancePx),
        minFramesRequired: Number(maneuverForm.minFramesRequired),
      });
      setSuccess("Maneuver added to test plan.");
      await loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add maneuver.");
    } finally {
      setIsAddingManeuver(false);
    }
  }

  async function handlePublish(planId: string) {
    setError("");
    setSuccess("");
    setIsPublishing(planId);

    try {
      await publishTestPlan(planId);
      setSuccess("Test plan published.");
      await loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to publish test plan.");
    } finally {
      setIsPublishing("");
    }
  }

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;
  const columns: Array<DataTableColumn<TestPlan>> = [
    { key: "name", header: "Name", cell: (plan) => <span className="font-medium">{plan.name}</span> },
    { key: "threshold", header: "Pass threshold", cell: (plan) => `${plan.passThreshold}%` },
    { key: "maneuvers", header: "Maneuvers", cell: (plan) => plan.maneuvers.length },
    { key: "status", header: "Status", cell: (plan) => <StatusBadge status={plan.status} /> },
    {
      key: "action",
      header: "Action",
      cell: (plan) => (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPublishing === plan.id || plan.status === "active"}
          state={isPublishing === plan.id ? { loading: true } : undefined}
          onClick={() => void handlePublish(plan.id)}
        >
          Publish
        </Button>
      ),
    },
  ];

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Test plans"
        description="Configure practical test plans, pass thresholds, and maneuver scoring sequence."
        action={
          <Button type="button" variant="secondary" onClick={() => void loadPlans()} disabled={isLoading} state={isLoading ? { loading: true } : undefined}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card padding="lg">
          <CardHeader title="Existing plans" description="Published plans are used by configured test-level mappings and scheduled exams." />
          <DataTable
            columns={columns}
            data={plans}
            getRowKey={(plan) => plan.id}
            loading={isLoading}
            emptyTitle="No test plans"
            emptyDescription="Create a test plan before adding maneuver scoring rules."
          />
        </Card>

        <Card padding="lg">
          <CardHeader title="Create plan" description="Create a draft plan with a pass threshold." />
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <Input label="Name" value={planForm.name} onChange={(event) => setPlanForm({ ...planForm, name: event.target.value })} required />
            <Textarea label="Description" value={planForm.description} onChange={(event) => setPlanForm({ ...planForm, description: event.target.value })} rows={4} />
            <Input label="Pass threshold" type="number" min="1" max="100" value={planForm.passThreshold} onChange={(event) => setPlanForm({ ...planForm, passThreshold: event.target.value })} suffix={<span className="text-[12px] text-[var(--text-secondary)]">%</span>} required />
            <Button type="submit" fullWidth state={{ loading: isCreatingPlan }} disabled={isCreatingPlan}>
              <Plus size={16} />
              Create test plan
            </Button>
          </form>
        </Card>
      </section>

      <Card padding="lg">
        <CardHeader
          title="Maneuver configuration"
          description="Add backend-supported maneuver configs to a selected draft plan. QR values are generated by the backend."
          action={<ClipboardList size={20} className="text-[var(--accent)]" />}
        />
        <form onSubmit={handleAddManeuver} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Select label="Test plan" value={selectedPlanId} onChange={(event) => setSelectedPlanId(event.target.value)} required>
            <option value="">Select plan</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </Select>
          <Select label="Maneuver type" value={maneuverForm.maneuverType} onChange={(event) => setManeuverForm({ ...maneuverForm, maneuverType: event.target.value })}>
            {MANEUVER_TYPES.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}
          </Select>
          <Input label="Display name" value={maneuverForm.displayName} onChange={(event) => setManeuverForm({ ...maneuverForm, displayName: event.target.value })} required />
          <Input label="Sequence" type="number" min="1" value={maneuverForm.sequenceNumber} onChange={(event) => setManeuverForm({ ...maneuverForm, sequenceNumber: event.target.value })} required />
          <Input label="Weight" type="number" min="0" step="0.1" value={maneuverForm.weight} onChange={(event) => setManeuverForm({ ...maneuverForm, weight: event.target.value })} required />
          <Input label="Pass threshold" type="number" min="1" max="100" value={maneuverForm.passThreshold} onChange={(event) => setManeuverForm({ ...maneuverForm, passThreshold: event.target.value })} />
          <Input label="Tolerance px" type="number" min="1" value={maneuverForm.tolerancePx} onChange={(event) => setManeuverForm({ ...maneuverForm, tolerancePx: event.target.value })} />
          <Input label="Min frames" type="number" min="1" value={maneuverForm.minFramesRequired} onChange={(event) => setManeuverForm({ ...maneuverForm, minFramesRequired: event.target.value })} />
          <div className="md:col-span-2 xl:col-span-4">
            <Button type="submit" disabled={!selectedPlan || isAddingManeuver} state={{ loading: isAddingManeuver }}>
              <Plus size={16} />
              Add maneuver
            </Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
}
