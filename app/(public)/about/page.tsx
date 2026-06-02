import { Card, CardHeader, PageContainer, PageHeader, ui } from "@/app/components/ui";

const values = [
  {
    title: "Trusted Process",
    description:
      "Clear, auditable workflows reduce manual follow-up and keep role-based actions predictable.",
  },
  {
    title: "Role-Aware Access",
    description:
      "Candidates, institutes, experts, and authorities each receive focused tools for their workflow.",
  },
  {
    title: "Reliable Operations",
    description:
    "ADLTS is designed for coordinated scheduling, review, and reporting across the exam lifecycle.",
  },
];

export default function AboutPage() {
  return (
    <PageContainer width="wide" className="space-y-8">
      <PageHeader
        eyebrow="About ADLTS"
        title="Automated Driving License Testing System"
        description="ADLTS is a transparent digital workflow for driving test enrollment, review, scheduling, and result tracking."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card padding="lg" className="space-y-3">
          <p className={ui.eyebrow}>Mission</p>
          <h2 className={ui.sectionTitle}>Built for clarity in public service</h2>
          <p className={ui.sectionLead}>
            ADLTS helps candidates complete verification and testing milestones through a consistent portal experience.
          </p>
        </Card>

        {values.map((value) => (
          <Card key={value.title} className="space-y-2">
            <CardHeader title={value.title} />
            <p className="text-sm text-[var(--adlts-ink-600)]">{value.description}</p>
          </Card>
        ))}
      </section>

      <Card className="space-y-3">
        <CardHeader title="How it works" description="A concise summary of the candidate journey." />
        <ul className="ml-5 list-disc space-y-2 text-sm text-[var(--adlts-ink-700)]">
          <li>Candidate registers and submits a booking request.</li>
          <li>Institution validates documents and training readiness.</li>
          <li>Payment and scheduling follow institutional approval.</li>
          <li>Examination is administered and reviewed by expert teams.</li>
          <li>Authorities monitor compliance, outcomes, and operational health.</li>
        </ul>
      </Card>
    </PageContainer>
  );
}
