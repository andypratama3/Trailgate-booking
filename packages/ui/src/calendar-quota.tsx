"use client";
import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { cn } from "./cn";
import { Button } from "./button";

export type QuotaDayStatus = "available" | "limited" | "full" | "closed";

export interface DayData {
  status: QuotaDayStatus;
  remaining?: number;
  label?: string;
}

export interface CalendarQuotaProps {
  month: Date;
  onPrev?: () => void;
  onNext?: () => void;
  /** Peta tanggal → data kuota (kunci: YYYY-MM-DD, UTC). */
  days?: Record<string, DayData>;
  selected?: string | null;
  onSelectDay?: (dateKey: string) => void;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  label?: string;
  className?: string;
}

const STATUS_CLASS: Record<QuotaDayStatus, string> = {
  available: "bg-success-subtle hover:bg-success-subtle/80 text-success-subtle-fg",
  limited: "bg-warning-subtle hover:bg-warning-subtle/80 text-warning-subtle-fg",
  full: "bg-danger-subtle text-danger-subtle-fg",
  closed: "bg-surface-raised text-fg-muted",
};

const STATUS_LABEL: Record<QuotaDayStatus, string> = {
  available: "tersedia",
  limited: "kuota terbatas",
  full: "kuota habis",
  closed: "tutup",
};

const WEEKDAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

/** Matriks 6×7 (string | null) — null = sel kosong di luar bulan, kunci = YYYY-MM-DD. */
function buildCells(year: number, month: number): (string | null)[][] {
  const first = new Date(Date.UTC(year, month, 1));
  const startOffset = ((first.getUTCDay() + 6) % 7); // Senin = 0
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells: (string | null)[][] = [];
  let day = 1;
  for (let w = 0; w < 6; w++) {
    const week: (string | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      if (idx < startOffset || day > daysInMonth) {
        week.push(null);
      } else {
        const mm = String(month + 1).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        week.push(`${year}-${mm}-${dd}`);
        day++;
      }
    }
    cells.push(week);
  }
  return cells;
}

const monthLabel = (d: Date) =>
  new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }).format(d);


/**
 * Kalender kuota jalur — navigasi keyboard penuh (Arrow ±1/±7, Home/End).
 * Tanggal tak tersedia pakai `aria-disabled` + alasan teks di label (SC 1.3.1, 2.1.1, 2.4.3, 4.1.2;
 * tidak andalkan warna saja — SC 1.4.1).
 *
 * State: default | loading (skeleton grid) | empty (tidak ada data hari) | error (role=alert + Coba lagi).
 */
export function CalendarQuota({
  month,
  onPrev,
  onNext,
  days = {},
  selected,
  onSelectDay,
  loading = false,
  error,
  onRetry,
  label = "Pilih tanggal",
  className,
}: CalendarQuotaProps) {
  const [focused, setFocused] = useState<string | null>(null);
  const gridRef = useRef<HTMLTableElement>(null);

  const year = month.getUTCFullYear();
  const monthNum = month.getUTCMonth();
  const cells = buildCells(year, monthNum);
  const allKeys = cells.flat();
  const ml = monthLabel(month);

  const firstValidKey = allKeys.find((k) => k !== null) ?? null;
  const effectiveFocused = focused ?? firstValidKey;
  const nearestKey = useCallback(
    (from: number, step: number): string | null => {
      let i = from + step;
      while (i >= 0 && i < allKeys.length) {
        const k = allKeys[i];
        if (k !== null) return k;
        i += step;
      }
      return null;
    },
    [allKeys],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTableElement>) => {
      if (!effectiveFocused) return;
      const cur = allKeys.indexOf(effectiveFocused);
      let next: string | null = null;

      switch (e.key) {
        case "ArrowLeft":  next = nearestKey(cur, -1);  break;
        case "ArrowRight": next = nearestKey(cur, 1);   break;
        case "ArrowUp":    next = nearestKey(cur, -7);  break;
        case "ArrowDown":  next = nearestKey(cur, 7);   break;
        case "Home": {
          let first: string | null = null;
          for (let i = 0; i < allKeys.length; i++) {
            if (allKeys[i] !== null) { first = allKeys[i]; break; }
          }
          next = first;
          break;
        }
        case "End": {
          let last: string | null = null;
          for (let i = allKeys.length - 1; i >= 0; i--) {
            if (allKeys[i] !== null) { last = allKeys[i] as string; break; }
          }
          next = last;
          break;
        }
        default: return;
      }

      if (!next) return;
      e.preventDefault();
      setFocused(next);
      requestAnimationFrame(() =>
        gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${next}"]`)?.focus(),
      );
    },
    [effectiveFocused, nearestKey, allKeys],
  );

  if (error) {
    return (
      <div className={cn("flex flex-col gap-3 rounded-lg border border-border bg-surface p-4", className)}>
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-danger">
          <p className="flex-1">{error}</p>
          {onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Coba lagi</Button>}
        </div>
        <p className="text-sm text-fg-muted">{ml} — periksa koneksi lalu coba lagi.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn("flex flex-col gap-3 rounded-lg border border-border bg-surface p-4", className)}>
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-surface-raised" />
          <div className="flex gap-2">
            <div className="size-9 animate-pulse rounded bg-surface-raised" />
            <div className="size-9 animate-pulse rounded bg-surface-raised" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1" aria-busy="true">
          {WEEKDAY_NAMES.map((d) => (
            <div key={d} className="h-9 rounded bg-surface-raised" />
          ))}
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded bg-surface-raised" />
          ))}
        </div>
        <p role="status" className="text-sm text-fg-muted">Memuat kuota&hellip;</p>
      </div>
    );
  }
  if (Object.keys(days).length === 0) {
    return (
      <div className={cn("flex flex-col gap-3 rounded-lg border border-border bg-surface p-4", className)}>
        <h3 className="text-base font-semibold text-fg">{ml}</h3>
        <p role="status" className="rounded-md border border-border bg-surface-raised p-6 text-center text-fg-muted">
          Belum ada kuota yang dipublikasikan untuk {ml}.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3 rounded-lg border border-border bg-surface p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-fg">{ml}</h3>
        <div className="flex gap-1">
          <button type="button" aria-label="Bulan sebelumnya" onClick={onPrev}
            className="flex size-9 items-center justify-center rounded-md text-fg-muted hover:bg-surface-raised hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">‹</button>
          <button type="button" aria-label="Bulan berikutnya" onClick={onNext}
            className="flex size-9 items-center justify-center rounded-md text-fg-muted hover:bg-surface-raised hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">›</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table ref={gridRef} role="grid" aria-label={label}
          className="w-full table-fixed border-collapse text-center text-sm"
          onKeyDown={handleKeyDown}>
          <thead>
            <tr>
              {WEEKDAY_NAMES.map((d) => (
                <th key={d} scope="col" className="h-9 border-b border-border pb-2 text-xs font-medium text-fg-muted">
                  <abbr title={d} aria-label={d}>{d}</abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cells.map((week, wi) => (
              <tr key={wi}>
                {week.map((dateKey, di) => {
                  if (dateKey === null) return <td key={di} aria-label="kosong" className="p-1" />;

                  const data = days[dateKey];
                  const status: QuotaDayStatus = data?.status ?? "closed";
                  const disabled = status === "closed" || status === "full";
                  const isSelected = selected === dateKey;
                  const isFocused = effectiveFocused === dateKey;
                  const dayNum = new Date(dateKey).getUTCDate();
                  const ariaLabel = `${dayNum} ${ml} — ${STATUS_LABEL[status]}${data?.remaining !== undefined ? `, ${data.remaining} tersisa` : ""}${isSelected ? " (dipilih)" : ""}`;

                  return (
                    <td key={di} role="gridcell" aria-selected={isSelected || undefined} className="p-1">
                      <button
                        type="button"
                        data-day={dateKey}
                        tabIndex={isFocused ? 0 : -1}
                        aria-label={ariaLabel}
                        aria-disabled={disabled || undefined}
                        aria-pressed={isSelected || undefined}
                        onClick={() => { if (!disabled && onSelectDay) onSelectDay(dateKey); }}
                        onFocus={() => setFocused(dateKey)}
                        className={cn(
                          "flex size-11 w-full items-center justify-center rounded-md text-sm font-medium transition-colors ease-standard",
                          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus",
                          isSelected ? "ring-2 ring-brand" : "",
                          STATUS_CLASS[status],
                          disabled ? "cursor-default opacity-60" : "cursor-pointer",
                        )}
                      >
                        {dayNum}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legenda warna + teks (SC 1.4.1). */}
      <ul className="flex flex-wrap gap-4 text-sm text-fg-muted">
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-3 rounded-full bg-success" />Tersedia</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-3 rounded-full bg-warning" />Kuota terbatas</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-3 rounded-full bg-danger" />Kuota habis</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-3 rounded-full bg-fg-subtle" />Tutup</li>
      </ul>

      <p className="sr-only">Navigasi: panah kiri/kanan untuk satu hari, panah atas/bawah untuk satu minggu, Home/End untuk pertama/terakhir dalam bulan.</p>
    </div>
  );
}
