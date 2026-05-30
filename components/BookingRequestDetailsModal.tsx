"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle, ChevronDown, X, XCircle } from "lucide-react";

import { BookingRequest, BookingStatus } from "@/services/booking.service";
import { useI18n } from "@/i18n/useI18n";

type BookingRequestDetailsModalProps = {
  request: BookingRequest;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  title?: string;
};

const ACTION_OPTIONS = [
  { label: 'Approve Request', value: 'approve' },
  { label: 'Reject Request', value: 'reject' },
] as const;

function formatDate(value?: string) {
  if (!value) return 'N/A';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

function formatDateTime(value?: string) {
  if (!value) return 'N/A';

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function statusTone(status: BookingStatus) {
  if (status === 'Approved') return 'bg-emerald-100 text-emerald-800';
  if (status === 'Rejected') return 'bg-rose-100 text-rose-800';
  return 'bg-amber-100 text-amber-800';
}

export default function BookingRequestDetailsModal({ request, onClose, onApprove, onReject, title }: BookingRequestDetailsModalProps) {
  const { t } = useI18n();
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject'>('approve');

  const fullName = useMemo(() => request.candidateDetails?.name || 'N/A', [request.candidateDetails?.name]);

  const handleApplyAction = () => {
    if (selectedAction === 'approve') {
      onApprove();
      return;
    }

    onReject();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{title || t('viewDetails') || 'Candidate Details'}</h2>
            <p className="text-xs text-slate-500">Booking information and moderation actions.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
            aria-label="Close candidate details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Full Name" value={fullName} />
            <DetailItem label="Email" value={request.candidateDetails?.email || 'N/A'} />
            <DetailItem label="Phone" value={request.candidateDetails?.phone || 'N/A'} />
            <DetailItem label="License Category" value={request.licenseCategory} badge />
            <DetailItem label="Booking Date" value={formatDateTime(request.createdAt)} />
            <DetailItem label="Preferred Exam Date" value={formatDate(request.preferredDate)} />
            <DetailItem label="Session" value={request.preferredSession || 'N/A'} />
            <DetailItem label="Booking Status" value={request.status} badge tone={statusTone(request.status)} />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</p>
            <div className="min-h-16 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
              {request.additionalNotes || 'No additional notes provided.'}
            </div>
          </div>

          {request.status === 'Pending' && (
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <ChevronDown className="h-4 w-4 text-slate-400" />
                <select
                  value={selectedAction}
                  onChange={(event) => setSelectedAction(event.target.value as 'approve' | 'reject')}
                  className="bg-transparent text-sm font-semibold text-slate-700 outline-none"
                  aria-label="Request action"
                >
                  {ACTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleApplyAction}
                className="inline-flex items-center justify-center rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
              >
                {selectedAction === 'approve' ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Request
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Request
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, badge = false, tone }: { label: string; value: string; badge?: boolean; tone?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      {badge ? (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone || 'bg-slate-100 text-slate-800'}`}>
          {value}
        </span>
      ) : (
        <p className="text-sm font-bold text-slate-800">{value}</p>
      )}
    </div>
  );
}