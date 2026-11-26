import type { SelectHTMLAttributes } from "react";
import { cn } from "./cn";
import { fieldId } from "./field-id";
import { Spinner } from "./spinner";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label: string;
  options: SelectOption[];
  value?: string;
  emptyLabel?: string;
  hint?: string;
  error?: string;
  loading?: boolean;
}

/**
 * Select native (berlabel, keyboard & layar-baca bawaan) — pilihan shadcn-style.
 *
 * State: default | loading (dinonaktifkan + "Memuat pilihan...") | empty (tanpa opsi →
 * `emptyLabel`) | error (role=alert) | disabled.
 */
export function Select({
  label,
  options,
  value,
  emptyLabel = "Belum ada pilihan",
  hint,
  error,
  loading = false,
  id,
  className,
  disabled,
  ...props
}: SelectProps) {
  const selectId = id ?? fieldId("tg-select", label);
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = hintId || errorId || undefined;
  const isEmpty = options.length === 0;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={selectId} className="text-sm font-medium text-fg">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <select
          id={selectId}
          aria-describedby={describedBy}
          aria-busy={loading || undefined}
          aria-invalid={error ? true : undefined}
          disabled={disabled || loading || isEmpty}
          value={value}
          className={cn(
            "h-11 w-full rounded-md border border-border-strong bg-surface px-4 text-base text-fg",
            "transition-colors ease-standard",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger",
            className,
          )}
          {...props}
        >
          {loading && <option value="">Memuat pilihan...</option>}
          {!loading && isEmpty && <option value="">{emptyLabel}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {loading && <Spinner className="shrink-0 text-fg-muted" />}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-sm text-fg-muted">
          {hint}
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
