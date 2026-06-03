"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle, ChevronDown, X, XCircle } from "lucide-react";

import { BookingRequest } from "@/services/booking.service";
import { useI18n } from "@/i18n/useI18n";
import { StatusBadge } from "@/app/components/ui";

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

export default function BookingRequestDetailsModal({ request, onClose, onApprove, onReject, title }: BookingRequestDetailsModalProps) {
  const { t } = useI18n();
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject'>('approve');

  const fullName = useMemo(() => request.candidateDetails?.name || 'N/A', [request.candidateDetails?.name]);

  const handleApplyAction = () => {
    if (request.status !== 'Pending') {
      return;
    }

    if (selectedAction === 'approve') {
      onApprove();
      return;
    }

    onReject();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-[8px] bg-[var(--surface)] shadow-[var(--shadow-modal)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">{title || t('viewDetails') || 'Candidate Details'}</h2>
            <p className="text-[12px] text-[var(--text-secondary)]">Booking information and moderation actions.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-[6px] p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
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
            <DetailItem label="Booking Status" value={request.status} badge />
          </div>

          <div>
            <p className="mb-2 text-[12px] font-medium text-[var(--text-secondary)]">Notes</p>
            <div className="min-h-16 rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-primary)]">
              {request.additionalNotes || 'No additional notes provided.'}
            </div>
          </div>

          {request.status === 'Pending' && (
            <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-end">
              <div className="flex items-center gap-2 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
                <select
                  value={selectedAction}
                  onChange={(event) => setSelectedAction(event.target.value as 'approve' | 'reject')}
                  className="bg-transparent text-sm font-semibold text-[var(--text-primary)] outline-none"
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
                className="inline-flex items-center justify-center rounded-[6px] bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--surface)] transition-colors hover:bg-[var(--accent-hover)]"
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

function DetailItem({ label, value, badge = false }: { label: string; value: string; badge?: boolean }) {
  return (
    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <p className="mb-1 text-[12px] font-medium text-[var(--text-secondary)]">{label}</p>
      {badge ? (
        <StatusBadge status={value} />
      ) : (
        <p className="text-sm font-semibold text-[var(--text-primary)]">{value}</p>
      )}
    </div>
  );
}
