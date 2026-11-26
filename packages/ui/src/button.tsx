import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-fg hover:bg-primary/90",
  secondary: "bg-brand text-brand-fg hover:bg-brand/90",
  outline: "border border-border-strong bg-surface text-fg hover:bg-surface-raised",
  ghost: "text-fg-muted hover:bg-surface-raised hover:text-fg",
  // Teks = peran `surface`: terang putih di atas danger, gelap permukaan gelap di atas danger.
  danger: "bg-danger text-surface hover:bg-danger/90",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  // 2.75rem = 44px — target sentuh minimum internal (accessibility.md §2).
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const BASE_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors ease-standard " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  empty?: boolean;
  emptyLabel?: string;
  error?: string;
}

/**
 * Tombol dasar (port milik sendiri dari pola shadcn/ui — tanpa dependensi tertutup).
 *
 * State: default | loading (spinner + `aria-busy`) | empty (`empty`, label nonaktif)
 * | error (`error` → danger + pesan di role=alert) | disabled.
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel = "Memuat...",
  empty = false,
  emptyLabel = "Tidak ada aksi",
  error,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading || empty;
  const resolvedVariant: ButtonVariant = error ? "danger" : variant;
  const content = loading
    ? loadingLabel
    : empty
      ? emptyLabel
      : children;

  const button = (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(BASE_CLASS, VARIANT_CLASS[resolvedVariant], SIZE_CLASS[size], className)}
      {...props}
    >
      {loading && <Spinner />}
      {content}
    </button>
  );

  // Pembungkus hanya dibuat bila ada pesan error (role=alert di bawah tombol);
  // `className` tetap diterapkan ke <button> pada kedua jalur.
  if (!error) return button;

  return (
    <span className="inline-flex flex-col gap-2">
      {button}
      <span role="alert" className="text-sm text-danger">
        {error}
      </span>
    </span>
  );
}