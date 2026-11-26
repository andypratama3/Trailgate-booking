"use client";
import { useId, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "./cn";
import { Spinner } from "./spinner";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: (id: string) => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyMessage?: string;
  className?: string;
}

/**
 * Tabs dengan navigasi keyboard (Arrow kiri/kanan, Home/End) — rAF dipakai agar
 * fokus berpindah setelah state ter-commit.
 *
 * State: default | loading (aria-busy + skeleton panel) | error (role=alert + Coba lagi)
 * | empty (tablist kosong + pesan) | disabled (tab aktif tetap tabbable, non-aktif tidak).
 */
export function Tabs({
  items,
  label,
  defaultValue,
  value: controlledValue,
  onChange,
  loading = false,
  error,
  onRetry,
  emptyMessage = "Belum ada tab.",
  className,
}: TabsProps) {
  const uid = useId();
  const tabId = (id: string) => `${uid}-tab-${id}`;
  const panelId = (id: string) => `${uid}-panel-${id}`;

  const active = controlledValue ?? defaultValue ?? items[0]?.id;

  const handleSelect = (id: string) => {
    onChange?.(id);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = items.findIndex((t) => t.id === active);
    if (idx === -1 || items.length === 0) return;
    let next: number;
    switch (e.key) {
      case "ArrowRight":
        next = (idx + 1) % items.length;
        break;
      case "ArrowLeft":
        next = (idx - 1 + items.length) % items.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = items.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const target = items[next];
    handleSelect(target.id);
    requestAnimationFrame(() => {
      document.getElementById(tabId(target.id))?.focus();
    });
  };

  if (error) {
    return (
      <div className={cn("flex flex-col", className)}>
        <div
          role="alert"
          className="rounded-md border border-danger bg-danger-subtle p-4 text-sm text-danger"
        >
          {error}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="ml-4 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Coba lagi
            </button>
          )}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn("flex flex-col", className)}>
        <p className="rounded-md border border-border bg-surface-raised p-6 text-center text-fg-muted">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        role="tablist"
        aria-label={label}
        aria-busy={loading || undefined}
        onKeyDown={handleKeyDown}
        className="flex flex-wrap gap-1 border-b border-border"
      >
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              id={tabId(item.id)}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={panelId(item.id)}
              tabIndex={isActive ? 0 : -1}
              disabled={loading}
              onClick={() => handleSelect(item.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors ease-standard",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isActive ? "border-b-2 border-brand text-brand" : "text-fg-muted hover:text-fg",
              )}
            >
              {loading && <Spinner className="mr-2 inline-block size-3" />}
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <div
            key={item.id}
            id={panelId(item.id)}
            role="tabpanel"
            aria-labelledby={tabId(item.id)}
            tabIndex={0}
            hidden={!isActive}
            className="mt-4 rounded-md border border-border bg-surface p-4 text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {loading ? (
              <div className="flex flex-col gap-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-surface-raised" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-surface-raised" />
                <p role="status" className="text-sm text-fg-muted">
                  Memuat konten&hellip;
                </p>
              </div>
            ) : (
              item.content
            )}
          </div>
        );
      })}
    </div>
  );
}