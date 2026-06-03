import { Card, CardHeader, PageContainer, PageHeader, StatBlock } from "@/app/components/ui";

export default function TransportAuthorityDashboard() {
  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Transport authority portal"
        description="Transport authority access is currently limited to identity, profile, and settings until backend authority workflows are added."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card padding="md" variant="metric">
          <StatBlock label="Dashboard scope" value="Lightweight" />
        </Card>
        <Card padding="md" variant="metric">
          <StatBlock label="Backend support" value="Profile" />
        </Card>
        <Card padding="md" variant="metric">
          <StatBlock label="Operations workflows" value="Future scope" />
        </Card>
      </section>

      <Card padding="lg">
        <CardHeader
          title="Backend-supported access"
          description="The current backend supports transport authority identity/profile operations. Institution management remains with admin and super admin for now."
        />
        <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <p className="text-[14px] font-semibold text-[var(--text-primary)]">No operational actions are enabled for this role yet.</p>
          <p className="mt-2 text-[13px] leading-5 text-[var(--text-secondary)]">
            Authority workflows will be added only after matching backend permissions and endpoints are available.
          </p>
        </div>
      </Card>
    </PageContainer>
  );
}
