"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  FormField,
  PageContainer,
  PageHeader,
  StatBlock,
  StatusBadge,
  formControlClassName,
} from "@/app/components/ui";
import {
  checkInCandidateDevice,
  getCandidatePendingTest,
  type CandidatePendingTest,
} from "@/services/exams.service";
import { useAuthStore } from "@/store/authStore";

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function isDevToken(token: string | null) {
  return token === "dev-token" || token?.startsWith("local-token-");
}

export default function CandidateExamCheckInPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [pendingTest, setPendingTest] = useState<CandidatePendingTest | null>(null);
  const [deviceCode, setDeviceCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [emptyMessage, setEmptyMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    getCandidatePendingTest()
      .then((test) => {
        if (!isMounted) return;
        setPendingTest(test);
        if (!test) {
          setEmptyMessage("No pending test is ready for check-in yet. Complete booking, institution verification, payment, and scheduling first.");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Unable to load pending test.";
        if (/session|sign in|unauthorized|expired/i.test(message) || isDevToken(token)) {
          setEmptyMessage("No backend candidate session is available for check-in. Use a real candidate token when testing this backend-only flow.");
          return;
        }
        setError(message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pendingTest) return;

    const cleanDeviceCode = deviceCode.trim();
    const cleanPassword = password.trim();

    if (!cleanDeviceCode || !cleanPassword) {
      setError("Enter the device code and device password from the assigned test vehicle.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const checkedIn = await checkInCandidateDevice({
        deviceCode: cleanDeviceCode,
        password: cleanPassword,
        testCenterId: pendingTest.testCenterId,
      });
      router.push(`/candidate/exams/${encodeURIComponent(checkedIn?.id ?? pendingTest.id)}/lobby`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete device check-in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Exam check-in"
        description="Connect your scheduled test to the assigned in-vehicle device before entering the exam lobby."
        action={
          <ButtonLink href="/candidate/exams" variant="outline">
            Back to exam history
          </ButtonLink>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      {isLoading ? (
        <Card padding="lg" className="animate-pulse space-y-4">
          <div className="h-5 w-48 rounded-[6px] bg-[var(--surface-2)]" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-20 rounded-[8px] bg-[var(--surface-2)]" />
            <div className="h-20 rounded-[8px] bg-[var(--surface-2)]" />
            <div className="h-20 rounded-[8px] bg-[var(--surface-2)]" />
          </div>
        </Card>
      ) : !pendingTest ? (
        <Card padding="lg">
          <EmptyState
            title="No pending test"
            description={emptyMessage || "There is no pending test ready for check-in for this candidate account."}
            action={
              <ButtonLink href="/candidate/booking" variant="primary">
                View booking status
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <Card padding="lg">
            <CardHeader
              title="Pending test"
              description="Confirm the scheduled test before entering the assigned device credentials."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Card padding="sm" variant="metric">
                <StatBlock label="Test level" value={pendingTest.testLevelCode} />
              </Card>
              <Card padding="sm" variant="metric">
                <StatBlock label="Scheduled start" value={formatDate(pendingTest.scheduledStartAt)} />
              </Card>
              <Card padding="sm" variant="metric">
                <StatBlock label="Window" value={pendingTest.bookingWindowHours ? `${pendingTest.bookingWindowHours} hours` : "-"} />
              </Card>
              <Card padding="sm" variant="soft">
                <p className="text-[12px] font-medium text-[var(--text-secondary)]">Status</p>
                <div className="mt-2">
                  <StatusBadge status={pendingTest.status} />
                </div>
              </Card>
              <Card padding="sm" variant="soft" className="sm:col-span-2">
                <StatBlock label="Test center ID" value={pendingTest.testCenterId} />
              </Card>
            </div>
          </Card>

          <Card padding="lg">
            <CardHeader
              title="Device credentials"
              description="Use the code/password from the assigned ADLTS test vehicle. The backend validates the device and test level."
            />
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Device code" hint="Example: vehicle or device code shown at the test center.">
                {(fieldProps) => (
                  <input
                    {...fieldProps}
                    className={formControlClassName}
                    value={deviceCode}
                    onChange={(event) => setDeviceCode(event.target.value)}
                    autoComplete="off"
                    placeholder="Enter device code"
                  />
                )}
              </FormField>
              <FormField label="Device password" hint="Provided by the authorized device/test-center workflow.">
                {(fieldProps) => (
                  <input
                    {...fieldProps}
                    className={formControlClassName}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="off"
                    placeholder="Enter device password"
                    type="password"
                  />
                )}
              </FormField>
              <Button type="submit" fullWidth state={{ loading: isSubmitting }} disabled={isSubmitting}>
                Check in and open lobby
              </Button>
            </form>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
