import { cn } from "./cn";
import { Spinner } from "./spinner";

export interface StepperStep {
  id: string;
  label: string;
}

export interface StepperProps {
  steps: StepperStep[];
  /** Indeks langkah saat ini (0-based). */
  current: number;
  label?: string;
  onStepClick?: (index: number) => void;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  className?: string;
}

/**
 * Stepper wizard booking (4 langkah) — `aria-current="step"` + label status teks
 * (accessibility.md §4 "Stepper booking").
 *
 * State: default | loading (skeleton + role=status) | empty (tanpa langkah)
 * | error (role=alert).
 */
export function Stepper({
  steps,
  current,
  label = "Langkah booking",
  onStepClick,
  loading = false,
  error,
  emptyMessage = "Belum ada langkah.",
  className,
}: StepperProps) {
  if (error) {
    return (
      <div className={cn("flex flex-col", className)}>
        <p role="alert" className="rounded-md border border-danger bg-danger-subtle p-4 text-sm text-danger">
          {error}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <p role="status" className="flex items-center gap-2 text-sm text-fg-muted">
          <Spinner className="size-3" />
          Memuat langkah&hellip;
        </p>
        <ol aria-label={label} className="flex flex-wrap gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="size-8 animate-pulse rounded-full bg-surface-raised" />
              <span className="h-4 w-24 animate-pulse rounded bg-surface-raised" />
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className={cn("flex flex-col", className)}>
        <p className="rounded-md border border-border bg-surface-raised p-6 text-center text-fg-muted">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <ol
      aria-label={label}
      className={cn("flex flex-wrap items-center gap-x-6 gap-y-3", className)}
    >
      {steps.map((step, index) => {
        const isDone = index < current;
        const isCurrent = index === current;
        const stateLabel = isDone ? " (selesai)" : isCurrent ? " (langkah saat ini)" : "";
        const marker = (
          <span
            aria-hidden="true"
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
              isDone
                ? "border-success bg-success-subtle text-success-subtle-fg"
                : isCurrent
                  ? "border-brand bg-brand text-brand-fg"
                  : "border-border-strong bg-surface text-fg-muted",
            )}
          >
            {isDone ? "✓" : index + 1}
          </span>
        );

        const content = (
          <span className={cn("text-sm", isCurrent ? "font-semibold text-fg" : "text-fg-muted")}>
            {step.label}
            <span className="sr-only">{stateLabel}</span>
          </span>
        );

        return (
          <li key={step.id} className="flex items-center gap-2">
            {onStepClick ? (
              <button
                type="button"
                aria-current={isCurrent ? "step" : undefined}
                onClick={() => onStepClick(index)}
                className="flex items-center gap-2 rounded-md px-1 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                {marker}
                {content}
              </button>
            ) : (
              <span
                aria-current={isCurrent ? "step" : undefined}
                className="flex items-center gap-2"
              >
                {marker}
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
