"use client";
import { KatalogNav } from "./_components/nav";
import { StateBlock } from "./_components/state-block";

const COMPONENTS: ReadonlyArray<{ href: string; label: string; blurb: string }> = [
  { href: "/katalog/button", label: "Button", blurb: "Varian + loading/empty/error/disabled" },
  { href: "/katalog/input", label: "Input", blurb: "Label, hint, error, loading" },
  { href: "/katalog/select", label: "Select", blurb: "Native select + empty/loading" },
  { href: "/katalog/dialog", label: "Dialog", blurb: "Modal + fokus trap" },
  { href: "/katalog/sheet", label: "Sheet", blurb: "Drawer kanan (reuse Dialog)" },
  { href: "/katalog/tabs", label: "Tabs", blurb: "Tablist + keyboard" },
  { href: "/katalog/toast", label: "Toast", blurb: "Status message tones" },
  { href: "/katalog/table", label: "DataTable", blurb: "Tabel + loading/empty/error" },
  { href: "/katalog/calendar", label: "Calendar kuota", blurb: "Grid kuota + keyboard" },
  { href: "/katalog/status-badge", label: "StatusBadge", blurb: "Status jalur berwarna + teks" },
  { href: "/katalog/quota-meter", label: "QuotaMeter", blurb: "Sisa kuota progressbar" },
  { href: "/katalog/stepper", label: "Stepper", blurb: "Wizard 4 langkah booking" },
];

export default function KatalogIndexPage() {
  return (
    <div className="flex flex-col gap-6">
      <KatalogNav current="/katalog" />

      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-fg">Katalog Komponen</h1>
        <p className="text-base text-fg-muted">
          Komponen dasar <code className="rounded bg-surface-raised px-1.5 py-0.5 text-sm">packages/ui</code>{" "}
          milik sendiri (port shadcn/ui tanpa dependensi tertutup), semua styling lewat token
          T-010 dengan state default/loading/empty/error.
        </p>
        <p className="text-base text-fg-muted">
          Audit axe:{" "}
          <code className="rounded bg-surface-raised px-1.5 py-0.5 text-sm">
            packages/ui/scripts/axe-katalog.mjs
          </code>{" "}
          — terverifikasi 13/13 halaman katalog, 0 pelanggaran serious/critical (lihat{" "}
          <code className="rounded bg-surface-raised px-1.5 py-0.5 text-sm">packages/ui/README.md</code>).
        </p>
      </header>

      <section aria-labelledby="daftar">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMPONENTS.map((c) => (
            <li key={c.href}>
              <a
                href={c.href}
                className="flex h-full flex-col gap-1 rounded-lg border border-border bg-surface p-4 text-fg transition-colors ease-standard hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                <span className="font-medium">{c.label}</span>
                <span className="text-sm text-fg-muted">{c.blurb}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <StateBlock title="Prinsip">
        Warna/ukuran hanya lewat peran semantik token (`bg-surface`, `text-fg-muted`,
        `rounded-md`); tidak ada hex/px di komponen maupun katalog (lint AC-39.1:
        `check-no-hardcode`). Setiap komponen punya state default, loading, empty, error, dan
        disabled bila interaktif.
      </StateBlock>
    </div>
  );
}
