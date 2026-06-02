import {
  BellRing,
  Ban,
  CheckCircle2,
  CircleDashed,
  CircleX,
  Clock3,
  AlertTriangle,
  Info,
  Loader2,
  PlayCircle,
  Power,
  ShieldCheck,
  Timer,
  UserCheck,
} from "lucide-react";
import { type ReactNode } from "react";

type BadgeStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "success"
  | "pending_verification"
  | "pending_approval"
  | "pending"
  | "approved"
  | "verified"
  | "scheduled"
  | "confirmed"
  | "rejected"
  | "running"
  | "completed"
  | "aborted"
  | "failed"
  | "passed"
  | "healthy"
  | "maintenance"
  | "in_use"
  | "offline"
  | "accepted"
  | "resolved"
  | "expired"
  | "warning"
  | "info"
  | "error"
  | "neutral"
  | "new"
  | "succeeded";

type StatusBadgeProps = {
  status?: string | null;
  label?: ReactNode;
  tone?: BadgeStatus;
  showIcon?: boolean;
  className?: string;
};

type StatusStyle = {
  label: string;
  className: string;
  icon?: typeof CheckCircle2;
};

const statusStyles: Record<string, StatusStyle> = {
  active: { label: "Active", className: "bg-[var(--adlts-success-50)] text-[var(--adlts-success-700)] border border-[var(--adlts-success-700)]/30", icon: CheckCircle2 },
  inactive: { label: "Inactive", className: "bg-[var(--adlts-surface-soft)] text-[var(--adlts-ink-700)] border border-[var(--adlts-border)]", icon: Power },
  suspended: { label: "Suspended", className: "bg-[var(--adlts-warning-50)] text-[var(--adlts-warning-700)] border border-[var(--adlts-warning-700)]/35", icon: Ban },
  pending_verification: { label: "Pending verification", className: "bg-[var(--adlts-blue-50)] text-[var(--adlts-blue-700)] border border-[var(--adlts-blue-700)]/35", icon: CircleDashed },
  pending_approval: { label: "Pending approval", className: "bg-[var(--adlts-blue-50)] text-[var(--adlts-blue-700)] border border-[var(--adlts-blue-700)]/35", icon: CircleDashed },
  pending: { label: "Pending", className: "bg-[var(--adlts-blue-50)] text-[var(--adlts-blue-700)] border border-[var(--adlts-blue-700)]/35", icon: Clock3 },
  approved: { label: "Approved", className: "bg-[var(--adlts-success-50)] text-[var(--adlts-success-700)] border border-[var(--adlts-success-700)]/35", icon: CheckCircle2 },
  verified: { label: "Verified", className: "bg-[var(--adlts-success-50)] text-[var(--adlts-success-700)] border border-[var(--adlts-success-700)]/35", icon: ShieldCheck },
  scheduled: { label: "Scheduled", className: "bg-[var(--adlts-blue-50)] text-[var(--adlts-blue-700)] border border-[var(--adlts-blue-700)]/35", icon: Timer },
  confirmed: { label: "Confirmed", className: "bg-[var(--adlts-success-50)] text-[var(--adlts-success-700)] border border-[var(--adlts-success-700)]/35", icon: UserCheck },
  rejected: { label: "Rejected", className: "bg-[var(--adlts-error-50)] text-[var(--adlts-error-700)] border border-[var(--adlts-error-700)]/35", icon: CircleX },
  running: { label: "Running", className: "bg-[var(--adlts-success-50)] text-[var(--adlts-success-700)] border border-[var(--adlts-success-700)]/35", icon: Loader2 },
  completed: { label: "Completed", className: "bg-[var(--adlts-success-50)] text-[var(--adlts-success-700)] border border-[var(--adlts-success-700)]/35", icon: CheckCircle2 },
  aborted: { label: "Aborted", className: "bg-[var(--adlts-warning-50)] text-[var(--adlts-warning-700)] border border-[var(--adlts-warning-700)]/35", icon: Ban },
  failed: { label: "Failed", className: "bg-[var(--adlts-error-50)] text-[var(--adlts-error-700)] border border-[var(--adlts-error-700)]/35", icon: CircleX },
  passed: { label: "Passed", className: "bg-[var(--adlts-success-50)] text-[var(--adlts-success-700)] border border-[var(--adlts-success-700)]/35", icon: CheckCircle2 },
  healthy: { label: "Healthy", className: "bg-[var(--adlts-success-50)] text-[var(--adlts-success-700)] border border-[var(--adlts-success-700)]/35", icon: CheckCircle2 },
  maintenance: { label: "Maintenance", className: "bg-[var(--adlts-warning-50)] text-[var(--adlts-warning-700)] border border-[var(--adlts-warning-700)]/35", icon: BellRing },
  in_use: { label: "In use", className: "bg-[var(--adlts-blue-50)] text-[var(--adlts-blue-700)] border border-[var(--adlts-blue-700)]/35", icon: PlayCircle },
  offline: { label: "Offline", className: "bg-[var(--adlts-surface-soft)] text-[var(--adlts-ink-500)] border border-[var(--adlts-border)]", icon: Info },
  accepted: { label: "Accepted", className: "bg-[var(--adlts-success-50)] text-[var(--adlts-success-700)] border border-[var(--adlts-success-700)]/35", icon: UserCheck },
  resolved: { label: "Resolved", className: "bg-[var(--adlts-success-50)] text-[var(--adlts-success-700)] border border-[var(--adlts-success-700)]/35", icon: ShieldCheck },
  expired: { label: "Expired", className: "bg-[var(--adlts-error-50)] text-[var(--adlts-error-700)] border border-[var(--adlts-error-700)]/35", icon: Timer },
  warning: { label: "Warning", className: "bg-[var(--adlts-warning-50)] text-[var(--adlts-warning-700)] border border-[var(--adlts-warning-700)]/35", icon: AlertTriangle },
  error: { label: "Error", className: "bg-[var(--adlts-error-50)] text-[var(--adlts-error-700)] border border-[var(--adlts-error-700)]/35", icon: CircleX },
  neutral: { label: "Neutral", className: "bg-[var(--adlts-surface-soft)] text-[var(--adlts-ink-600)] border border-[var(--adlts-border)]", icon: Info },
  info: { label: "Info", className: "bg-[var(--adlts-blue-50)] text-[var(--adlts-blue-700)] border border-[var(--adlts-blue-700)]/35", icon: Info },
  new: { label: "New", className: "bg-[var(--adlts-blue-50)] text-[var(--adlts-blue-700)] border border-[var(--adlts-blue-700)]/35", icon: Timer },
  succeeded: { label: "Succeeded", className: "bg-[var(--adlts-success-50)] text-[var(--adlts-success-700)] border border-[var(--adlts-success-700)]/35", icon: CheckCircle2 },
  success: { label: "Success", className: "bg-[var(--adlts-success-50)] text-[var(--adlts-success-700)] border border-[var(--adlts-success-700)]/35", icon: CheckCircle2 },
};

const aliases: Record<string, string> = {
  pending_approval: "pending_approval",
  verification: "pending_verification",
  "in use": "in_use",
  excellent: "passed",
  stable: "healthy",
  succeeded: "succeeded",
  success: "passed",
  successed: "succeeded",
  cancelled: "aborted",
  cancelleds: "aborted",
  disabled: "inactive",
  enabled: "active",
  deleted: "resolved",
  active_invitation: "active",
  inactive_invitation: "inactive",
  inprogress: "running",
  in_progress: "running",
};

function normalizeStatus(status: string): string {
  return status
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/[\(\)]/g, "")
    .replace(/\//g, "_")
    .replace(/\./g, "")
    .replace(/[^a-z0-9_]/g, "");
}

function resolveBadge(status: string): StatusStyle {
  const normalized = normalizeStatus(status);
  const mapped = aliases[normalized] ?? normalized;
  return statusStyles[mapped] ?? statusStyles.neutral;
}

export function StatusBadge({
  status,
  label,
  tone,
  showIcon = true,
  className = "",
}: StatusBadgeProps) {
  const normalized = status ? normalizeStatus(status) : "";
  const style = tone && statusStyles[tone] ? statusStyles[tone] : status ? resolveBadge(normalized) : statusStyles.neutral;
  const resolvedLabel = label ?? (status ? status.replace(/[\-_]+/g, " ") : style.label);

  const Icon = style.icon;

  return (
    <span
      role="status"
      aria-label={typeof resolvedLabel === "string" ? resolvedLabel : undefined}
      className={`inline-flex items-center rounded-pill px-2.5 py-1 text-[12px] font-medium ${style.className} ${className}`.trim()}
    >
      {showIcon && Icon ? <Icon aria-hidden="true" className="mr-1 h-3.5 w-3.5" strokeWidth={1.8} /> : null}
      {resolvedLabel}
    </span>
  );
}
