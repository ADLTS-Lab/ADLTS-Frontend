"use client";

import React from "react";
import { BookingRequest } from "@/services/booking.service";
import { X, CheckCircle, XCircle } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

interface CandidateModalProps {
  request: BookingRequest;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export default function CandidateModal({ request, onClose, onApprove, onReject }: CandidateModalProps) {
  const { t } = useI18n();
  const formatDate = (value?: string) => {
    if (!value) return 'N/A';

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">{t("viewDetails") || "Candidate Details"}</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</p>
              <p className="font-medium text-slate-900">{request.candidateDetails?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</p>
              <p className="font-medium text-slate-900">{request.candidateDetails?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</p>
              <p className="font-medium text-slate-900">{request.candidateDetails?.phone || "N/A"}</p>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">License Category</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                {request.licenseCategory}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                request.status === "Approved" ? "bg-green-100 text-green-800" :
                request.status === "Rejected" ? "bg-red-100 text-red-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {request.status}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Booking Date</p>
              <p className="font-medium text-slate-900">{formatDate(request.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Preferred Exam Date</p>
              <p className="font-medium text-slate-900">{request.preferredDate}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Preferred Session</p>
              <p className="font-medium text-slate-900">{request.preferredSession}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Status</p>
              <p className="font-medium text-slate-900">{request.status}</p>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Additional Notes</p>
            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 border border-slate-100 min-h-16">
              {request.additionalNotes || 'No additional notes provided.'}
            </div>
          </div>
        </div>

        {request.status === "Pending" && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
            <button
              onClick={() => { onReject(); onClose(); }}
              className="flex items-center px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl font-bold transition"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {t("reject") || "Reject"}
            </button>
            <button
              onClick={() => { onApprove(); onClose(); }}
              className="flex items-center px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-xl font-bold transition shadow-sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {t("approve") || "Approve"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
