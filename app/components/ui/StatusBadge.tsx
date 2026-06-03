import { type ReactNode } from "react";

type BadgeTone =
  | "pending"
  | "approved"
  | "scheduled"
  | "rejected"
  | "cancelled"
  | "completed"
  | "expired"
  | "online"
  | "warning"
  | "offline"
  | "high"
  | "medium"
  | "low"
  | "success"
  | "danger"
  | "error"
  | "info"
  | "neutral"
  | "active"
  | "inactive"
  | "suspended"
  | "succeeded";

type StatusBadgeProps = {
  status?: string | null;
  label?: ReactNode;
  tone?: BadgeTone | string;
  showIcon?: boolean;
  className?: string;
};

type StatusStyle = {
  label: string;
  bg: string;
  color: string;
};

const STATUS_MAP: Record<string, StatusStyle> = {
  pending: { label: "Pending", bg: "var(--warning-subtle)", color: "var(--warning)" },
  approved: { label: "Approved", bg: "var(--success-subtle)", color: "var(--success)" },
  payment_pending: { label: "Payment Pending", bg: "var(--warning-subtle)", color: "var(--warning)" },
  scheduled: { label: "Scheduled", bg: "var(--accent-subtle)", color: "var(--accent)" },
  rejected: { label: "Rejected", bg: "var(--danger-subtle)", color: "var(--danger)" },
  cancelled: { label: "Cancelled", bg: "var(--neutral-subtle)", color: "var(--neutral)" },
  completed: { label: "Completed", bg: "var(--success-subtle)", color: "var(--success)" },
  expired: { label: "Expired", bg: "var(--neutral-subtle)", color: "var(--neutral)" },
  online: { label: "Online", bg: "var(--success-subtle)", color: "var(--success)" },
  warning: { label: "Warning", bg: "var(--warning-subtle)", color: "var(--warning)" },
  offline: { label: "Offline", bg: "var(--danger-subtle)", color: "var(--danger)" },
  high: { label: "High", bg: "var(--danger-subtle)", color: "var(--danger)" },
  medium: { label: "Medium", bg: "var(--warning-subtle)", color: "var(--warning)" },
  low: { label: "Low", bg: "var(--neutral-subtle)", color: "var(--neutral)" },
  success: { label: "Success", bg: "var(--success-subtle)", color: "var(--success)" },
  danger: { label: "Danger", bg: "var(--danger-subtle)", color: "var(--danger)" },
  error: { label: "Error", bg: "var(--danger-subtle)", color: "var(--danger)" },
  info: { label: "Info", bg: "var(--accent-subtle)", color: "var(--accent)" },
  neutral: { label: "Neutral", bg: "var(--neutral-subtle)", color: "var(--neutral)" },
  active: { label: "Active", bg: "var(--success-subtle)", color: "var(--success)" },
  inactive: { label: "Inactive", bg: "var(--neutral-subtle)", color: "var(--neutral)" },
  suspended: { label: "Suspended", bg: "var(--warning-subtle)", color: "var(--warning)" },
  succeeded: { label: "Succeeded", bg: "var(--success-subtle)", color: "var(--success)" },
  failed: { label: "Failed", bg: "var(--danger-subtle)", color: "var(--danger)" },
  passed: { label: "Passed", bg: "var(--success-subtle)", color: "var(--success)" },
  running: { label: "Running", bg: "var(--accent-subtle)", color: "var(--accent)" },
  stable: { label: "Stable", bg: "var(--success-subtle)", color: "var(--success)" },
  excellent: { label: "Excellent", bg: "var(--success-subtle)", color: "var(--success)" },
  review: { label: "Review", bg: "var(--warning-subtle)", color: "var(--warning)" },
  maintenance: { label: "Maintenance", bg: "var(--warning-subtle)", color: "var(--warning)" },
  in_use: { label: "In use", bg: "var(--accent-subtle)", color: "var(--accent)" },
  verified: { label: "Verified", bg: "var(--success-subtle)", color: "var(--success)" },
  confirmed: { label: "Confirmed", bg: "var(--success-subtle)", color: "var(--success)" },
  accepted: { label: "Accepted", bg: "var(--success-subtle)", color: "var(--success)" },
  resolved: { label: "Resolved", bg: "var(--success-subtle)", color: "var(--success)" },
  disabled: { label: "Disabled", bg: "var(--neutral-subtle)", color: "var(--neutral)" },
  enabled: { label: "Enabled", bg: "var(--success-subtle)", color: "var(--success)" },
};

const aliases: Record<string, string> = {
  pending_approval: "pending",
  pending_verification: "pending",
  verification: "pending",
  initiated: "pending",
  inprogress: "running",
  in_progress: "running",
  in_use: "in_use",
  "in use": "in_use",
  cancelleds: "cancelled",
  canceled: "cancelled",
  aborted: "cancelled",
  active_invitation: "active",
  inactive_invitation: "inactive",
  successed: "succeeded",
  healthy: "online",
};

function normalizeStatus(status: string) {
  return status
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/[\(\)]/g, "")
    .replace(/\//g, "_")
    .replace(/\./g, "")
    .replace(/[^a-z0-9_]/g, "");
}

function humanizeStatus(status: string) {
  return status
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function resolveStyle(status?: string | null, tone?: BadgeTone | string): StatusStyle {
  if (tone) {
    const toneKey = aliases[tone] ?? tone;
    return STATUS_MAP[toneKey] ?? STATUS_MAP.neutral;
  }

  if (!status) {
    return STATUS_MAP.neutral;
  }

  const normalized = normalizeStatus(status);
  const mapped = aliases[normalized] ?? normalized;
  return STATUS_MAP[mapped] ?? {
    ...STATUS_MAP.neutral,
    label: humanizeStatus(status),
  };
}

export function StatusBadge({
  status,
  label,
  tone,
  showIcon = true,
  className = "",
}: StatusBadgeProps) {
  const style = resolveStyle(status, tone);
  const resolvedLabel = label ?? (status ? humanizeStatus(status) : style.label);

  return (
    <span
      role="status"
      aria-label={typeof resolvedLabel === "string" ? resolvedLabel : undefined}
      className={`inline-flex items-center gap-1 rounded-[6px] px-2 py-0.5 text-[12px] font-medium ${className}`.trim()}
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {showIcon ? (
        <span
          aria-hidden="true"
          className="h-1 w-1 rounded-[50%] bg-current"
        />
      ) : null}
      {resolvedLabel}
    </span>
  );
}
