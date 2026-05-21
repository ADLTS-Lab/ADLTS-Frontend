"use client";

import { useEffect, useState } from "react";
import { getInstituteOverview, getRecentEnrollments, InstituteOverview, Enrollment } from "@/services/institute.service";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { useI18n } from "@/i18n/useI18n";

export default function InstituteDashboard() {
  const { t } = useI18n();
  const [overview, setOverview] = useState<InstituteOverview | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [overviewRes, enrollmentsRes] = await Promise.all([getInstituteOverview(), getRecentEnrollments()]);
        if (overviewRes.success) setOverview(overviewRes.data);
        if (enrollmentsRes.success) setEnrollments(enrollmentsRes.data);
      } catch (err) {
        console.error("Failed to load institute data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Institute Portal</h1>
          <p className="text-slate-500 mt-1">Manage your driving school candidates and schedules.</p>
        </div>
        <Button variant="primary">Register Candidate</Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Active Students", value: overview?.activeStudents, color: "text-blue-600" },
          { label: "Upcoming Exams", value: overview?.upcomingExams, color: "text-indigo-600" },
          { label: "Average Pass Rate", value: overview ? `${overview.passRate}%` : undefined, color: "text-emerald-600" },
        ].map((stat, i) => (
          <Card key={i} className="p-6">
            <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
            {loading ? (
              <div className="h-9 w-20 bg-slate-200 animate-pulse rounded mt-2"></div>
            ) : (
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value || "—"}</p>
            )}
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-semibold text-slate-900">Recent Enrollments</h2>
          <Button variant="secondary" className="text-sm">View All</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate Name</th>
                <th className="px-6 py-4 font-medium">Enrollment Date</th>
                <th className="px-6 py-4 font-medium">License Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-5 w-32 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-24 bg-slate-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-100 animate-pulse rounded"></div></td>
                  </tr>
                ))
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No recent enrollments.</td>
                </tr>
              ) : (
                enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{enr.candidateName}</td>
                    <td className="px-6 py-4">
                      {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(enr.enrollmentDate))}
                    </td>
                    <td className="px-6 py-4">{enr.licenseCategory}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        enr.status === 'Ready for Exam' ? 'bg-emerald-100 text-emerald-800' : 
                        enr.status === 'In Training' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {enr.status}
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
