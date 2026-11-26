"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "./cn";
import { Spinner } from "./spinner";

export type ToastTone = "success" | "error" | "warning" | "info";

const TONE_CLASS: Record<ToastTone, string> = {
  success: "border-success bg-success-subtle text-success-subtle-fg",
  warning: "border-warning bg-warning-subtle text-warning-subtle-fg",
  info: "border-info bg-info-subtle text-info-subtle-fg",
  error: "border-danger bg-danger-subtle text-danger-subtle-fg",
};

const TONE_PREFIX: Record<ToastTone, string> = {
  success: "Berhasil:",
  warning: "Perhatian:",
  info: "Info:",
  error: "Gagal:",
};

export interface ToastProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  tone?: ToastTone;
  onClose: () => void;
  /** Auto-tutup dalam milidetik; 0 = hanya manual (aksesibility §2.2.2). */
  duration?: number;
  loading?: boolean;
  error?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Toast / status message — `role="status"` untuk pesan non-kritis,
 * `role="alert"` untuk error (accessibility.md §4).
 *
 * State: default | loading (spinner + aria-busy) | error (role=alert) | empty (hanya nada).
 */
export function Toast({
  open,
  title,
  description,
  tone = "info",
  onClose,
  duration = 0,
  loading = false,
  error,
  action,
  className,
}: ToastProps) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const resolvedTone: ToastTone = error ? "error" : tone;
  const isEmpty = title.trim() === "" && !description;

  useEffect(() => {
    if (!open || duration <= 0) return;
    const timer = window.setTimeout(() => onCloseRef.current(), duration);
    return () => window.clearTimeout(timer);
  }, [open, duration]);

  if (!open) return null;

  const role = resolvedTone === "error" ? "alert" : "status";

  return (
    <div
      role={role}
      aria-live={resolvedTone === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      className={cn(
        "fixed bottom-4 right-4 z-50 flex w-full max-w-sm items-start gap-3 rounded-md border p-4 shadow-lg",
        TONE_CLASS[resolvedTone],
        className,
      )}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold">
          <span className="sr-only">{TONE_PREFIX[resolvedTone]} </span>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Spinner />
              {title || "Memproses..."}
            </span>
          ) : isEmpty ? (
            "Tidak ada pesan."
          ) : (
            title
          )}
        </p>
        {error && <p className="mt-1 text-sm">{error}</p>}
        {!error && description && <div className="mt-1 text-sm">{description}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        className="flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <span aria-hidden="true" className="text-sm leading-none">
          ✕
        </span>
      </button>
    </div>
  );
}
