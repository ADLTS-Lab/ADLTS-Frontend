"use client";

import { useEffect, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { getRecentAudits, type AuditLog } from "@/services/super-admin.service";
import { useI18n } from "@/i18n/useI18n";
import { extractApiError } from "@/services/api-utils";

export default function SuperAdminAuditsPage() {
  const { t } = useI18n();
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    const loadAudits = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getRecentAudits();
        if (!alive) return;
        if (response.success) {
          setAudits(response.data ?? []);
        } else {
          setAudits([]);
          setError("Unable to load audit logs.");
        }
      } catch (err) {
        if (!alive) return;
        setError(extractApiError(err, "Unable to load audit logs."));
      } finally {
        if (alive) setLoading(false);
      }
    };

    void loadAudits();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-400">Super Admin</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{t("superAdmin_audits_title")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{t("superAdmin_audits_subtitle")}</p>
        </div>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent audit events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4"><div className="h-5 w-56 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-28 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-36 animate-pulse rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-20 animate-pulse rounded bg-slate-100" /></td>
                  </tr>
                ))
              ) : audits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    {t("superAdmin_audits_empty")}
                  </td>
                </tr>
              ) : (
                audits.map((audit) => (
                  <tr key={audit.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-medium text-slate-900">{audit.action}</td>
                    <td className="px-6 py-4">{audit.user}</td>
                    <td className="px-6 py-4">{formatTimestamp(audit.timestamp)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize",
                          audit.status === "success"
                            ? "bg-emerald-100 text-emerald-800"
                            : audit.status === "error"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800",
                        ].join(" ")}
                      >
                        {audit.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}
