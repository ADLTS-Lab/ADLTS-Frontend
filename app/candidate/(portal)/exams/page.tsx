"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listCandidateExams, type ExamSummary } from "@/services/exams.service";
import { extractApiError } from "@/services/api-utils";
import {
  Alert,
  ButtonLink,
  Card,
  CardHeader,
  DataTable,
  EmptyState,
  PageContainer,
  PageHeader,
  StatBlock,
  StatusBadge,
  type DataTableColumn,
} from "@/app/components/ui";

export default function CandidateExamHistoryPage() {
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    listCandidateExams()
      .then((data) => {
        if (isMounted) setExams(data);
      })
      .catch((err) => {
        if (isMounted) setError(extractApiError(err, "Unable to load exam history right now."));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = {
    total: exams.length,
    passed: exams.filter((exam) => exam.result === "Pass").length,
    failed: exams.filter((exam) => exam.result === "Fail").length,
    latestScore: exams[0]?.score,
  };
  const passRate = metrics.total === 0 ? 0 : Math.round((metrics.passed / metrics.total) * 100);

  const columns: Array<DataTableColumn<ExamSummary>> = [
    {
      key: "date",
      header: "Date",
      cell: (exam) => exam.date,
    },
    {
      key: "type",
      header: "Type",
      cell: (exam) => exam.examType,
    },
    {
      key: "score",
      header: "Score",
      cell: (exam) => `${exam.score}%`,
    },
    {
      key: "result",
      header: "Result",
      cell: (exam) => <ResultBadge result={exam.result} />,
    },
    {
      key: "center",
      header: "Center",
      cell: (exam) => exam.center,
    },
    {
      key: "details",
      header: "Details",
      cell: (exam) => (
        <Link href={`/candidate/exams/${exam.id}`} className="font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]">
          View result
        </Link>
      ),
    },
  ];

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Exam history"
        description="Review completed driving tests, scores, results, centers, and available result breakdowns."
        action={
          <ButtonLink href="/candidate/booking" variant="outline">
            Start a booking first
          </ButtonLink>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card padding="sm" variant="metric">
          <StatBlock label="Total exams" value={isLoading ? "-" : metrics.total} />
        </Card>
        <Card padding="sm" variant="metric">
          <StatBlock label="Passes" value={isLoading ? "-" : metrics.passed} />
        </Card>
        <Card padding="sm" variant="metric">
          <StatBlock label="Failed" value={isLoading ? "-" : metrics.failed} />
        </Card>
        <Card padding="sm" variant="metric">
          <StatBlock label="Pass rate" value={isLoading ? "-" : `${passRate}%`} />
        </Card>
        <Card padding="sm" variant="metric">
          <StatBlock label="Latest score" value={isLoading ? "-" : metrics.latestScore === undefined ? "-" : `${metrics.latestScore}%`} />
        </Card>
      </div>

      <div className="space-y-4 md:hidden">
        {isLoading ? (
          <Card padding="md" className="animate-pulse space-y-3">
            <div className="h-5 w-40 rounded-[6px] bg-[var(--surface-2)]" />
            <div className="h-4 w-full rounded-[6px] bg-[var(--surface-2)]" />
            <div className="h-4 w-2/3 rounded-[6px] bg-[var(--surface-2)]" />
          </Card>
        ) : exams.length === 0 ? (
          <EmptyState
            title="No exam results yet"
            description="Your results will appear here after you complete a test and the result is available."
            action={
              <ButtonLink href="/candidate/booking" variant="primary">
                Start a booking first
              </ButtonLink>
            }
          />
        ) : (
          exams.map((exam) => (
            <Card key={exam.id} padding="md" className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-medium text-[var(--text-secondary)]">{exam.date}</p>
                  <h3 className="mt-1 text-[16px] font-semibold text-[var(--text-primary)]">{exam.examType}</h3>
                </div>
                <ResultBadge result={exam.result} />
              </div>
              <dl className="grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-[14px]">
                <div>
                  <dt className="text-[12px] font-medium text-[var(--text-secondary)]">Center</dt>
                  <dd className="mt-1 font-medium text-[var(--text-primary)]">{exam.center}</dd>
                </div>
                <div className="text-right">
                  <dt className="text-[12px] font-medium text-[var(--text-secondary)]">Score</dt>
                  <dd className="mt-1 font-semibold text-[var(--text-primary)]">{exam.score}%</dd>
                </div>
              </dl>
              <Link href={`/candidate/exams/${exam.id}`} className="inline-flex text-[14px] font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]">
                View result
              </Link>
            </Card>
          ))
        )}
      </div>

      <Card padding="md" className="hidden md:block">
        <CardHeader
          title="Published results"
          description="Some results require review before publication. If a result is hidden, wait for the official update or contact support with your exam ID."
        />
        <DataTable
          columns={columns}
          data={exams}
          getRowKey={(exam) => exam.id}
          loading={isLoading}
          emptyTitle="No exam results yet"
          emptyDescription="Your results will appear here after you complete a test and the result is available."
          emptyAction={
            <ButtonLink href="/candidate/booking" variant="primary">
              Start a booking first
            </ButtonLink>
          }
        />
      </Card>

      <Card padding="md">
        <CardHeader title="Result legend" />
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="Pass" tone="passed" />
          <StatusBadge status="Fail" tone="failed" />
          <StatusBadge status="Under review" tone="warning" />
        </div>
      </Card>
    </PageContainer>
  );
}

function ResultBadge({ result }: { result: string }) {
  const normalized = result?.toLowerCase();
  const tone = normalized === "pass" ? "passed" : normalized === "fail" ? "failed" : "neutral";

  return <StatusBadge status={result} tone={tone} />;
}
