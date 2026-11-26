import { cn } from "./cn";
import { Spinner } from "./spinner";

export type StatusBadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_CLASS: Record<StatusBadgeTone, string> = {
  success: "border-success bg-success-subtle text-success-subtle-fg",
  warning: "border-warning bg-warning-subtle text-warning-subtle-fg",
  danger: "border-danger bg-danger-subtle text-danger-subtle-fg",
  info: "border-info bg-info-subtle text-info-subtle-fg",
  neutral: "border-border-strong bg-surface-raised text-fg-muted",
};

export interface StatusBadgeProps {
  /** Teks status — wajib; jangan andalkan warna saja (SC 1.4.1). */
  label: string;
  tone?: StatusBadgeTone;
  loading?: boolean;
  error?: string;
  className?: string;
}

const TONE_ICON: Record<StatusBadgeTone, string> = {
  success: "●",
  warning: "▲",
  danger: "■",
  info: "◆",
  neutral: "–",
};

/**
 * Badge status jalur (buka/tutup/kuota terbatas) — teks + ikon bentuk + warna.
 *
 * State: default | loading (spinner + "Memeriksa status...") | empty (label kosong)
 * | error (role=alert, nada danger).
 */
export function StatusBadge({
  label,
  tone = "neutral",
  loading = false,
  error,
  className,
}: StatusBadgeProps) {
  const resolvedTone: StatusBadgeTone = error ? "danger" : tone;
  const text = loading ? "Memeriksa status..." : label.trim() === "" ? "Tidak ada status" : label;

  return (
    <span
      role={error ? "alert" : undefined}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
        TONE_CLASS[resolvedTone],
        className,
      )}
    >
      {loading ? (
        <Spinner className="size-3" />
      ) : (
        <span aria-hidden="true" className="text-xs leading-none">
          {TONE_ICON[resolvedTone]}
        </span>
      )}
      {error ? `${text} — ${error}` : text}
    </span>
  );
}
