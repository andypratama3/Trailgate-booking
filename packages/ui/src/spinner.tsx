import { cn } from "./cn";

export interface SpinnerProps {
  className?: string;
}

/**
 * Spinner dekoratif. Selalu ditemani teks status oleh komponen pemanggil
 * (accessibility.md §3 butir 2: gerak bukan pembawa makna tunggal).
 */
export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}