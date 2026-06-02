import { Card, CardHeader, PageContainer, PageHeader } from "@/app/components/ui";

const items = [
  {
    title: "What we store",
    detail:
      "Basic account identity details, role context, booking data, and platform interactions required to keep services operational.",
  },
  {
    title: "How we use data",
    detail:
      "Data supports authentication, authorization, workflow routing, status visibility, and security monitoring.",
  },
  {
    title: "Your control",
    detail:
      "You can sign out at any time. Session tokens and account changes are managed by platform login state.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PageContainer width="wide" className="space-y-8">
      <PageHeader
        eyebrow="Privacy"
        title="Privacy & Security"
        description="How profile and process data is handled in the ADLTS portals."
      />

      <Card className="space-y-3">
        <CardHeader title="Overview" description="Data handling at a glance." />
        <p className="text-sm text-[var(--adlts-ink-600)]">
          ADLTS is a role-based portal system. We show only operationally necessary information based on your authenticated role.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title} className="space-y-2">
            <h2 className="text-base font-semibold text-[var(--adlts-ink-900)]">{item.title}</h2>
            <p className="text-sm text-[var(--adlts-ink-600)]">{item.detail}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-2">
        <CardHeader title="Contact & updates" description="For compliance or correction requests." />
        <p className="text-sm text-[var(--adlts-ink-600)]">
          If your rights request, account question, or data update request concerns profile details, contact support directly.
          Operational requests are reviewed according to role governance and platform procedures.
        </p>
      </Card>
    </PageContainer>
  );
}
