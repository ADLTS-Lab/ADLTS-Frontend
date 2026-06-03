import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCandidateExamById } from "@/services/exams.service";
import { ButtonLink, Card, PageContainer, PageHeader, ProgressBar, StatBlock, StatusBadge } from "@/app/components/ui";

export default async function CandidateExamDetailPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const exam = await fetchCandidateExamById(examId);

  if (!exam) {
    notFound();
  }

  if (exam.visible === false) {
    return (
      <PageContainer width="wide" className="space-y-6">
        <PageHeader
          title="Result under review"
          description="This result is being reviewed and will be published once approved."
          action={
            <ButtonLink href="/candidate/exams" variant="outline">
              Back to exam history
            </ButtonLink>
          }
        />

        <Card padding="lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[12px] font-medium text-[var(--text-secondary)]">Current status</p>
              <h2 className="mt-1 text-[20px] font-semibold text-[var(--text-primary)]">{exam.title}</h2>
            </div>
            <StatusBadge status={exam.result} tone="warning" />
          </div>
          <p className="mt-4 text-[14px] leading-6 text-[var(--text-secondary)]">
            Some results require review before they are shown. If your result is not visible, wait for the official update or contact support with your booking reference.
          </p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title={`${exam.title} result`}
        description="Review completed driving tests, scores, results, centers, and available result breakdowns."
        action={
          <ButtonLink href="/candidate/exams" variant="outline">
            Back to exam history
          </ButtonLink>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card padding="sm">
          <StatBlock label="Date" value={exam.date} />
        </Card>
        <Card padding="sm">
          <StatBlock label="Score" value={`${exam.score}%`} />
        </Card>
        <Card padding="sm">
          <p className="text-[12px] font-medium text-[var(--text-secondary)]">Result</p>
          <div className="mt-2">
            <StatusBadge status={exam.result} tone={exam.result === "Pass" ? "passed" : "failed"} />
          </div>
        </Card>
        <Card padding="sm">
          <StatBlock label="Exam ID" value={exam.id} />
        </Card>
      </section>

      <Card padding="lg">
        <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">Performance breakdown</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <BreakdownItem label="Speed control" value={exam.speed} />
          <BreakdownItem label="Lane discipline" value={exam.lane} />
          <BreakdownItem label="Braking" value={exam.braking} />
          <BreakdownItem label="Traffic signs" value={exam.trafficSigns} />
        </div>
      </Card>

      <Card padding="lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">Notes</h2>
            <p className="mt-2 text-[14px] leading-6 text-[var(--text-secondary)]">{exam.notes}</p>
          </div>
          <Link href="/contact" className="text-[14px] font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]">
            Contact support
          </Link>
        </div>
      </Card>
    </PageContainer>
  );
}

function BreakdownItem({ label, value }: { label: string; value: string }) {
  const numericValue = Number.parseInt(value, 10);
  const progress = Number.isNaN(numericValue) ? 0 : Math.max(0, Math.min(100, numericValue));

  return (
    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-[14px] font-semibold text-[var(--text-primary)]">{value}</p>
      </div>
      <ProgressBar value={progress} className="mt-3" />
    </div>
  );
}
