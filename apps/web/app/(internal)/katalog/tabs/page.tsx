"use client";
import { Tabs, type TabItem } from "@trailgate/ui";
import { KatalogNav } from "../_components/nav";
import { StateBlock } from "../_components/state-block";

const ITEMS: TabItem[] = [
  { id: "jalur", label: "Jalur", content: <p className="text-sm text-fg-muted">Jalur A — Gunung X, status Buka.</p> },
  { id: "kuota", label: "Kuota", content: <p className="text-sm text-fg-muted">120 / 300 tersisa hari ini.</p> },
  { id: "syarat", label: "Syarat", content: <p className="text-sm text-fg-muted">Surat sehat ≤ 24 jam, umur ≥ 17.</p> },
];

export default function KatalogTabsPage() {
  return (
    <div className="flex flex-col gap-6">
      <KatalogNav current="/katalog/tabs" />
      <h1 className="text-2xl font-semibold text-fg">Tabs</h1>
      <p className="text-base text-fg-muted">
        Tablist dengan navigasi keyboard (Arrow kiri/kanan, Home/End) dan roving tabindex.
      </p>

      <StateBlock title="Default" description="Panel konten bernama (&amp; tabpanels berlabel).">
        <Tabs
          label="Detail jalur"
          defaultValue="jalur"
          items={ITEMS}
        />
      </StateBlock>

      <StateBlock title="Loading" description="Tab dinonaktifkan + skeleton panel + aria-busy.">
        <Tabs label="Detail jalur" defaultValue="jalur" items={ITEMS} loading />
      </StateBlock>

      <StateBlock title="Empty" description="Tanpa item → pesan 'Belum ada tab.'">
        <Tabs label="Detail jalur" items={[]} />
      </StateBlock>

      <StateBlock title="Error" description="role=alert + tombol Coba lagi.">
        <Tabs label="Detail jalur" items={ITEMS} error="Jalur tidak bisa dimuat." onRetry={() => undefined} />
      </StateBlock>
    </div>
  );
}
