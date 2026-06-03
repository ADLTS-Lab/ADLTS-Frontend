"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  PageContainer,
  PageHeader,
  StatusBadge,
} from "@/app/components/ui";
import { acknowledgeCandidateGuidelines } from "@/services/exams.service";
import { useAuthStore } from "@/store/authStore";

const GUIDELINES = [
  "Remain in the assigned test vehicle until the examiner or system indicates the next step.",
  "Keep the device connected and do not restart or disconnect in-vehicle equipment.",
  "Follow official test-center instructions and traffic-safety rules throughout the examination.",
  "Results are published only after automated scoring and authorized review are completed.",
];

function isDevelopmentToken(token: string | null) {
  return token === "dev-token" || token?.startsWith("local-token-");
}

export default function CandidateExamLobbyPage() {
  const params = useParams<{ examId: string }>();
  const examId = params.examId;
  const { token } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState("");

  async function handleAcknowledge() {
    setError("");
    setIsSubmitting(true);

    try {
      await acknowledgeCandidateGuidelines(examId);
      setAcknowledged(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to acknowledge guidelines.";
      if (/session|sign in|unauthorized|expired/i.test(message) || isDevelopmentToken(token)) {
        setError("No backend candidate session is available for lobby acknowledgement. Use a real candidate token when testing this backend-only flow.");
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Exam lobby"
        description="Review the candidate instructions and acknowledge them before the examination continues."
        action={
          <ButtonLink href="/candidate/exams/check-in" variant="outline">
            Back to check-in
          </ButtonLink>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {acknowledged ? <Alert variant="success">Guidelines acknowledged. Wait for the authorized test start instruction.</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card padding="lg">
          <CardHeader
            title="Candidate guidelines"
            description="This acknowledgement records that you have reviewed the required exam instructions."
          />
          <div className="space-y-3">
            {GUIDELINES.map((item, index) => (
              <div key={item} className="flex gap-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-[var(--border)] bg-[var(--surface)] text-[13px] font-semibold text-[var(--text-secondary)]">
                  {index + 1}
                </span>
                <p className="text-[14px] leading-6 text-[var(--text-primary)]">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <CardHeader title="Lobby status" description="The final live exam start is controlled by the authorized operational workflow." />
          <div className="space-y-5">
            <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <p className="text-[12px] font-medium text-[var(--text-secondary)]">Exam ID</p>
              <p className="mt-1 break-all text-[14px] font-semibold text-[var(--text-primary)]">{examId}</p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-[var(--text-secondary)]">Guidelines</p>
              <div className="mt-2">
                <StatusBadge status={acknowledged ? "Acknowledged" : "Pending acknowledgement"} tone={acknowledged ? "success" : "warning"} />
              </div>
            </div>
            <Button type="button" fullWidth state={{ loading: isSubmitting }} disabled={isSubmitting || acknowledged} onClick={handleAcknowledge}>
              {acknowledged ? "Acknowledged" : "Acknowledge guidelines"}
            </Button>
            {acknowledged ? (
              <ButtonLink href="/candidate/exams" variant="outline" fullWidth>
                Return to exam history
              </ButtonLink>
            ) : null}
          </div>
        </Card>
      </div>

      {isDevelopmentToken(token) && !acknowledged ? (
        <Card padding="md">
          <EmptyState
            title="Development shortcut token detected"
            description="This lobby uses real backend endpoints. A development-only token can open the page, but backend acknowledgement requires a real candidate JWT."
            className="py-8"
          />
        </Card>
      ) : null}
    </PageContainer>
  );
}
