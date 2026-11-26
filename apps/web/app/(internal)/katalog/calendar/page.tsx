"use client";
import { useState } from "react";
import { CalendarQuota, type DayData } from "@trailgate/ui";
import { KatalogNav } from "../_components/nav";
import { StateBlock } from "../_components/state-block";

/** Contoh data kuota November 2026 [DEMO] — bukan klaim bersumber. */
const NOV_DAYS: Record<string, DayData> = {
  "2026-11-03": { status: "available", remaining: 120 },
  "2026-11-04": { status: "available", remaining: 250 },
  "2026-11-05": { status: "available", remaining: 300 },
  "2026-11-10": { status: "limited", remaining: 12 },
  "2026-11-11": { status: "limited", remaining: 30 },
  "2026-11-12": { status: "full", remaining: 0 },
  "2026-11-17": { status: "full", remaining: 0 },
  "2026-11-18": { status: "closed" },
  "2026-11-19": { status: "closed" },
  "2026-11-24": { status: "available", remaining: 120 },
  "2026-11-25": { status: "available", remaining: 150 },
  "2026-11-26": { status: "limited", remaining: 8 },
};

export default function KatalogCalendarPage() {
  const [month, setMonth] = useState(() => new Date(Date.UTC(2026, 10, 1)));
  const [selected, setSelected] = useState<string | null>("2026-11-25");

  const shift = (delta: number) =>
    setMonth((m) => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + delta, 1)));

  return (
    <div className="flex flex-col gap-6">
      <KatalogNav current="/katalog/calendar" />
      <h1 className="text-2xl font-semibold text-fg">Calendar kuota</h1>
      <p className="text-base text-fg-muted">
        Grid kuota harian (tersedia/terbatas/habis/tutup) + navigasi keyboard penuh
        (Arrow ±1/±7, Home/End); tanggal tidak tersedia memakai aria-disabled + alasan teks.
      </p>

      <StateBlock title="Default" description="Klik tanggal atau gunakan panah untuk memilih.">
        <CalendarQuota
          month={month}
          onPrev={() => shift(-1)}
          onNext={() => shift(1)}
          days={NOV_DAYS}
          selected={selected}
          onSelectDay={setSelected}
        />
      </StateBlock>

      <StateBlock title="Loading" description="Skeleton grid + role=status.">
        <CalendarQuota month={month} loading onPrev={() => shift(-1)} onNext={() => shift(1)} />
      </StateBlock>

      <StateBlock title="Empty" description="Belum ada kuota yang dipublikasikan.">
        <CalendarQuota month={month} days={{}} onPrev={() => shift(-1)} onNext={() => shift(1)} />
      </StateBlock>

      <StateBlock title="Error" description="role=alert + Coba lagi.">
        <CalendarQuota
          month={month}
          days={NOV_DAYS}
          onPrev={() => shift(-1)}
          onNext={() => shift(1)}
          error="Kuota jalur tidak bisa dimuat."
          onRetry={() => undefined}
        />
      </StateBlock>
    </div>
  );
}
