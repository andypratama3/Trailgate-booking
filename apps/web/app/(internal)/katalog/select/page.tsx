"use client";
import { Select, StatusBadge } from "@trailgate/ui";
import { KatalogNav } from "../_components/nav";
import { StateBlock } from "../_components/state-block";

const METHOD_OPTIONS = [
  { value: "va", label: "Virtual account" },
  { value: "qris", label: "QRIS" },
  { value: "kartu", label: "Kartu" },
];

export default function KatalogSelectPage() {
  return (
    <div className="flex flex-col gap-6">
      <KatalogNav current="/katalog/select" />
      <h1 className="text-2xl font-semibold text-fg">Select</h1>
      <p className="text-base text-fg-muted">
        Select native (berlabel, keyboard & layar-baca bawaan) — pilihan shadcn-style tanpa
        dependensi tertutup.
      </p>

      <StateBlock title="Default">
        <Select label="Metode pembayaran" options={METHOD_OPTIONS} defaultValue="qris" hint="Pilih metode bayar." />
      </StateBlock>

      <StateBlock title="Loading" description="Dinonaktifkan + 'Memuat pilihan...'.">
        <Select label="Metode pembayaran" options={METHOD_OPTIONS} loading />
      </StateBlock>

      <StateBlock title="Empty" description="Tanpa opsi → opsi nonaktif 'Belum ada pilihan'.">
        <Select label="Metode pembayaran" options={[]} />
      </StateBlock>

      <StateBlock title="Error" description="aria-invalid + role=alert.">
        <Select
          label="Jumlah pendaki"
          options={[
            { value: "1", label: "1 orang" },
            { value: "8", label: "8 orang" },
          ]}
          defaultValue="8"
          error="Sisa kuota tidak cukup untuk 8 orang."
        />
      </StateBlock>

      <StateBlock title="Disabled">
        <Select
          label="Jalur"
          options={[{ value: "jalur-a", label: "Jalur A — Gunung X" }]}
          defaultValue="jalur-a"
          disabled
        />
      </StateBlock>

      <StateBlock title="StatusBadge — loading & error">
        <StatusBadge label="Buka" tone="success" loading />
        <StatusBadge label="" tone="neutral" />
        <StatusBadge label="Gagal memuat status" error="periksa koneksi." />
      </StateBlock>
    </div>
  );
}
