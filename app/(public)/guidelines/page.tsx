import { Card, CardHeader, PageContainer, PageHeader } from "@/app/components/ui";

const requirements = [
  "Valid national ID or license training records",
  "Accurate candidate contact details",
  "Approved institution enrollment",
  "Document trail required by your reviewing institution",
];

const process = [
  "Submit a candidate profile and booking request.",
  "Receive institution review outcome.",
  "Complete payment and scheduling instructions.",
  "Take the examination and await review.",
  "Review outcome through the candidate portal.",
];

export default function GuidelinesPage() {
  return (
    <PageContainer width="wide" className="space-y-8">
      <PageHeader
        eyebrow="Guidelines"
        title="Platform guidelines"
        description="Operational steps and expectations for each ADLTS role."
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <CardHeader
            title="Overview"
            description="ADLTS coordinates transparent flow from request to results."
          />
          <p className="text-sm text-[var(--adlts-ink-600)]">
            Candidates, institutions, and authorities share one backend path, reducing manual handoffs and fragmented status updates.
          </p>
        </Card>

        <Card className="space-y-3">
          <CardHeader title="Requirements" description="Submission checks before request review." />
          <ul className="ml-5 list-disc text-sm text-[var(--adlts-ink-700)] space-y-2">
            {requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      </section>

      <Card className="space-y-3">
        <CardHeader title="Booking Process" description="Sequence most users follow." />
        <ol className="ml-5 list-decimal space-y-2 text-sm text-[var(--adlts-ink-700)]">
          {process.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </Card>

      <Card className="space-y-3">
        <CardHeader title="FAQ" description="Common operational questions and answers." />
        <div className="space-y-3">
          <details className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-4">
            <summary className="cursor-pointer font-medium text-[var(--adlts-ink-900)]">How long does approval take?</summary>
            <p className="mt-2 text-sm text-[var(--adlts-ink-600)]">
              Approval timing varies by institution capacity and workflow policy. Check request status updates in your portal.
            </p>
          </details>
          <details className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-4">
            <summary className="cursor-pointer font-medium text-[var(--adlts-ink-900)]">Can I change my institution?</summary>
            <p className="mt-2 text-sm text-[var(--adlts-ink-600)]">
              Institution changes are allowed according to the current request status and institution policy.
            </p>
          </details>
          <details className="rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-4">
            <summary className="cursor-pointer font-medium text-[var(--adlts-ink-900)]">What happens after failed result?</summary>
            <p className="mt-2 text-sm text-[var(--adlts-ink-600)]">
              Review next steps are published by the institution; you can track follow-up instructions from your candidate page.
            </p>
          </details>
        </div>
      </Card>
    </PageContainer>
  );
}
