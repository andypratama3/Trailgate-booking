"use client";
import { useEffect, useRef, useId, type ReactNode } from "react";
import { cn } from "./cn";
import { Spinner } from "./spinner";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Fokus trap + scroll lock + pulihkan fokus terakhir. */
function useOverlayA11y(
  panelRef: React.RefObject<HTMLDivElement | null>,
  open: boolean,
  onClose: () => void,
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previous = document.activeElement as HTMLElement | null;
    panel?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute("disabled"),
      );
      if (!items.length) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active && panel.contains(active);
      if (!inside) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus();
    };
  }, [open, panelRef]);
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  error?: string;
  variant?: "dialog" | "sheet";
  /** State kosong: panel terbuka tetapi belum ada data untuk ditampilkan. */
  empty?: boolean;
  emptyLabel?: string;
  className?: string;
}

/**
 * Dialog / Sheet — port milik sendiri (tanpa dependensi Radix/primitives).
 * Fokus trap + scroll lock + Escape + pulih fokus (accessibility.md §2 butir 2.1.2).
 *
 * State: open (default) | loading (spinner + aria-busy + skeleton) | error (role=alert)
 * | closed (tidak dirender).
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  loading = false,
  empty = false,
  emptyLabel = "Belum ada data untuk ditampilkan.",
  error,
  variant = "dialog",
  className,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const contentId = useId();

  useOverlayA11y(panelRef, open, onClose);

  if (!open) return null;

  const isSheet = variant === "sheet";

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex",
        isSheet ? "justify-end" : "items-center justify-center p-4",
      )}
    >
      {/* Backdrop — klik untuk menutup; Escape & tombol Tutup adalah jalur keyboard. */}
      <div aria-hidden="true" className="absolute inset-0 bg-overlay" onClick={onClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={contentId}
        tabIndex={-1}
        className={cn(
          "relative flex w-full flex-col overflow-y-auto bg-surface text-fg shadow-lg outline-none",
          isSheet ? "h-full max-w-md rounded-l-lg" : "max-h-full max-w-lg rounded-lg",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-6">
          <h2 id={titleId} className="text-lg font-semibold text-fg leading-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex size-11 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-surface-raised hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <span aria-hidden="true" className="text-base font-medium leading-none">
              ✕
            </span>
          </button>
        </div>

        <div id={contentId} className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col gap-3">
              <p role="status" className="flex items-center gap-2 text-sm text-fg-muted">
                <Spinner />
                Memuat&hellip;
              </p>
              <div className="flex flex-col gap-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface-raised" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-surface-raised" />
              </div>
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-md border border-danger bg-danger-subtle p-4 text-sm text-danger"
            >
              {error}
            </div>
          ) : empty ? (
            <p
              role="status"
              aria-live="polite"
              className="rounded-md border border-border bg-surface-raised p-6 text-center text-sm text-fg-muted"
            >
              {emptyLabel}
            </p>
          ) : (
            children
          )}
        </div>

        {footer && (
          <div className="flex flex-col gap-2 border-t border-border p-6 pt-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Sheet = drawer sisi kanan yang reuse Dialog. */
export function Sheet(props: Omit<DialogProps, "variant">) {
  return <Dialog {...props} variant="sheet" />;
}
