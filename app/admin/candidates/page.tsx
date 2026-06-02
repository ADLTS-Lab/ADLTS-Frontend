"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listCandidates,
  updateCandidateStatus,
  type CandidateRecord,
} from "@/services/candidates.service";
import { useI18n } from "@/i18n/useI18n";
import { extractApiError } from "@/services/api-utils";
import {
  Alert,
  Button,
  Card,
  Input,
  PageContainer,
  PageHeader,
  StatusBadge,
  ui,
} from "@/app/components/ui";

export default function AdminCandidatesPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCandidates = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await listCandidates(search ? { search } : undefined);
        setCandidates(data);
      } catch (err: unknown) {
        setError(extractApiError(err, "Unable to load candidates."));
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidates();
  }, [search]);

  const activeCount = useMemo(() => candidates.filter((candidate) => candidate.status === "active").length, [candidates]);

  const toggleStatus = async (candidate: CandidateRecord) => {
    const nextStatus = candidate.status === "active" ? "suspended" : "active";

    try {
      const { candidate: updated } = await updateCandidateStatus(candidate.id, nextStatus);
      setCandidates((current) => current.map((item) => (item.id === candidate.id ? updated : item)));
    } catch (err: unknown) {
      setError(extractApiError(err, "Unable to update candidate status."));
    }
  };

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow={t("adminPortal")}
        title={t("candidates_title") || "Candidates"}
        description={t("candidates_subtitle") || "Review user accounts and status controls."}
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card padding="md" className="space-y-1">
          <p className={ui.statLabel}>{t("status_active") || "Active"}</p>
          <p className="text-2xl font-semibold text-[var(--adlts-ink-900)]">{activeCount}</p>
        </Card>
        <Card padding="md" className="space-y-1">
          <p className={ui.statLabel}>{t("status_suspended") || "Suspended"}</p>
          <p className="text-2xl font-semibold text-[var(--adlts-ink-900)]">{candidates.length - activeCount}</p>
        </Card>
        <Card padding="md" className="space-y-1">
          <p className={ui.statLabel}>Total candidates</p>
          <p className="text-2xl font-semibold text-[var(--adlts-ink-900)]">{candidates.length}</p>
        </Card>
      </section>

      <Card padding="md">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search_placeholder_candidates") || "Search candidates"}
        />
      </Card>

      {error && <Alert variant="error">{error}</Alert>}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left">
            <thead className="border-b border-[var(--adlts-divider)] bg-[var(--adlts-surface-soft)]">
              <tr>
                <th className="px-6 py-4">{t("table_name")}</th>
                <th className="px-6 py-4">{t("table_email")}</th>
                <th className="px-6 py-4">{t("table_center")}</th>
                <th className="px-6 py-4">{t("table_category")}</th>
                <th className="px-6 py-4">{t("table_status")}</th>
                <th className="px-6 py-4">{t("table_action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--adlts-divider)]">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-8 text-[var(--adlts-ink-600)]" colSpan={6}>
                    {t("loadingCandidates")}
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-[var(--adlts-ink-600)]" colSpan={6}>
                    {t("noCandidatesFound")}
                  </td>
                </tr>
              ) : (
                candidates.map((candidate) => (
                  <tr key={candidate.id} className="transition-colors hover:bg-[var(--adlts-surface-soft)]">
                    <td className="px-6 py-4 font-medium text-[var(--adlts-ink-900)]">
                      {candidate.name || `${candidate.first_name} ${candidate.last_name}`}
                    </td>
                    <td className="px-6 py-4 text-[var(--adlts-ink-700)]">{candidate.email}</td>
                    <td className="px-6 py-4 text-[var(--adlts-ink-700)]">{candidate.testCenter}</td>
                    <td className="px-6 py-4 text-[var(--adlts-ink-700)]">{candidate.licenseCategory}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={candidate.status} tone={candidate.status === "active" ? "success" : "inactive"} />
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant={candidate.status === "active" ? "danger" : "secondary"}
                        size="sm"
                        onClick={() => toggleStatus(candidate)}
                      >
                        {candidate.status === "active" ? t("action_suspend") : t("action_activate")}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
