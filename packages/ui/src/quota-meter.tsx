import { cn } from "./cn";
import { Spinner } from "./spinner";

export type QuotaTone = "success" | "warning" | "danger";

const TONE_CLASS: Record<QuotaTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

function toneFor(remainingPct: number): QuotaTone {
  if (remainingPct <= 0) return "danger";
  if (remainingPct < 0.15) return "danger";
  if (remainingPct < 0.4) return "warning";
  return "success";
}

export interface QuotaMeterProps {
  label: string;
  /** Sisa kuota; `undefined` = belum diumumkan (state empty). */
  remaining?: number;
  capacity?: number;
  unit?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Meter kuota jalur. Rasio sisa menentukan nada (success/warning/danger) —
 * selalu disertai teks angka, tidak pernah warna saja (SC 1.4.1).
 *
 * State: default | loading (skeleton + role=status) | empty (kuota belum diumumkan)
 * | error (role=alert + Coba lagi).
 */
export function QuotaMeter({
  label,
  remaining,
  capacity,
  unit = "orang",
  loading = false,
  error,
  onRetry,
  className,
}: QuotaMeterProps) {
  const hasData = typeof remaining === "number" && typeof capacity === "number" && capacity > 0;
  const pct = hasData ? Math.max(0, Math.min(1, (remaining as number) / (capacity as number))) : 0;
  const tone = toneFor(pct);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-fg">{label}</span>
        {loading ? (
          <span className="text-fg-muted">Memuat kuota&hellip;</span>
        ) : error ? (
          <span className="text-danger">Kuota tidak bisa dimuat</span>
        ) : hasData ? (
          <span className={cn("font-medium", tone === "danger" ? "text-danger" : "text-fg")}>
            {remaining} / {capacity} {unit} tersisa
          </span>
        ) : (
          <span className="text-fg-muted">Belum diumumkan</span>
        )}
      </div>

      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-md border border-danger bg-danger-subtle p-3 text-sm text-danger"
        >
          {error}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Coba lagi
            </button>
          )}
        </div>
      ) : (
        <div
          role="progressbar"
          aria-label={`${label} (${unit})`}
          aria-valuemin={0}
          aria-valuemax={hasData ? capacity : undefined}
          aria-valuenow={hasData ? remaining : undefined}
          aria-busy={loading || undefined}
          className="h-3 w-full overflow-hidden rounded-full border border-border bg-surface-raised"
        >
          <div
            aria-hidden="true"
            className={cn("h-full rounded-full transition-all ease-standard", loading ? "animate-pulse bg-fg-subtle" : TONE_CLASS[tone])}
            style={{ width: `${hasData ? Math.round(pct * 100) : loading ? 40 : 0}%` }}
          />
        </div>
      )}

      {loading ? (
        <p role="status" className="flex items-center gap-2 text-sm text-fg-muted">
          <Spinner className="size-3" />
          Memuat kuota&hellip;
        </p>
      ) : !hasData && !error ? (
        <p className="text-sm text-fg-muted">
          Kuota belum diumumkan untuk jalur ini. Coba lagi nanti atau hubungi pengelola.
        </p>
      ) : null}
    </div>
  );
}
