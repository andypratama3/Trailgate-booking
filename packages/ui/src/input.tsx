import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";
import { fieldId } from "./field-id";
import { Spinner } from "./spinner";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  hint?: string;
  error?: string;
  loading?: boolean;
  /** State kosong: field belum diisi (status, bukan sekadar hint) — mis. anggota belum mengisi. */
  empty?: boolean;
  emptyLabel?: string;
}

/**
 * Input berlabel (bukan placeholder-only — accessibility.md §4 butir 3.3.2).
 *
 * State: default | loading (`aria-busy` + spinner, dinonaktifkan)
 * | empty (`empty` → role=status "Belum diisi.") | error (`aria-invalid` + role=alert)
 * | disabled.
 */
export function Input({
  label,
  hint,
  error,
  loading = false,
  empty = false,
  emptyLabel = "Belum diisi.",
  id,
  className,
  disabled,
  ...props
}: InputProps) {
  const inputId = id ?? fieldId("tg-input", label);
  const hintId = hint && !error ? `${inputId}-hint` : undefined;
  const emptyId = empty && !error ? `${inputId}-empty` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, emptyId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-fg">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-busy={loading || undefined}
          disabled={disabled || loading}
          className={cn(
            "h-11 w-full rounded-md border border-border-strong bg-surface px-4 text-base text-fg",
            "placeholder:text-fg-subtle transition-colors ease-standard",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger",
            loading && "pr-11",
            className,
          )}
          {...props}
        />
        {loading && (
          <span className="absolute inset-y-0 right-3 flex items-center">
            <Spinner />
          </span>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-sm text-fg-muted">
          {hint}
        </p>
      )}
      {empty && !error && (
        <p id={emptyId} role="status" className="text-sm text-fg-subtle">
          {emptyLabel}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
