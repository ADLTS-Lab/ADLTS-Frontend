import { type ReactNode } from "react";

import { Button } from "./Button";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  confirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  className?: string;
};

export function ConfirmModal({
  open,
  title,
  description,
  children,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  confirming = false,
  onCancel,
  onConfirm,
  className = "",
}: ConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] px-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className={`w-full max-w-[480px] rounded-[8px] bg-[var(--surface)] p-6 shadow-[var(--shadow-modal)] ${className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 id="confirm-modal-title" className="text-[16px] font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
            {description ? (
              <p className="text-[14px] leading-6 text-[var(--text-secondary)]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            x
          </button>
        </div>
        {children ? <div className="mt-4 text-[14px] text-[var(--text-secondary)]">{children}</div> : null}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            state={confirming ? { loading: true } : undefined}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
