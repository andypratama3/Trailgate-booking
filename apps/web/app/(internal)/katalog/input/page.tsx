"use client";
import { Input, Select, StatusBadge } from "@trailgate/ui";
import { KatalogNav } from "../_components/nav";
import { StateBlock } from "../_components/state-block";

export default function KatalogInputPage() {
  return (
    <div className="flex flex-col gap-6">
      <KatalogNav current="/katalog/input" />
      <h1 className="text-2xl font-semibold text-fg">Input</h1>
      <p className="text-base text-fg-muted">
        Label selalu terlihat (bukan placeholder-only), error via aria-invalid + role=alert.
      </p>

      <StateBlock title="Default">
        <Input label="Nama ketua" placeholder="Nama lengkap" />
        <Input label="Nomor HP" placeholder="08xx" hint="Format: 08xxxxxxxxxx" />
      </StateBlock>

      <StateBlock title="Loading" description="Dinonaktifkan + spinner saat memuat data awal.">
        <Input label="Nomor HP" loading placeholder="08xx" />
      </StateBlock>

      <StateBlock title="Empty" description="Field belum diisi → prop `empty` + role=status 'Belum diisi.'.">
        <Input label="Email anggota" empty emptyLabel="Belum diisi oleh anggota." />
        <Input label="Nomor HP anggota" empty />
      </StateBlock>

      <StateBlock title="Error" description="Pesan per-field + role=alert; border danger.">
        <Input
          label="Nomor HP"
          error="HP ketua belum diisi — isi untuk lanjut."
        />
      </StateBlock>

      <StateBlock title="Disabled">
        <Input label="Alamat jalur" value="Gunung X — Jalur A" disabled />
      </StateBlock>

      {/* Select juga milik bagian form; sekaligus evidenced di katalog ini agar lengkap. */}
      <StateBlock title="Select — default & empty">
        <Select
          label="Jumlah pendaki"
          options={[
            { value: "1", label: "1 orang" },
            { value: "5", label: "5 orang" },
          ]}
          defaultValue="1"
        />
        <Select label="Metode pembayaran" options={[]} />
      </StateBlock>

      <StateBlock title="StatusBadge — status jalur">
        <StatusBadge label="Buka" tone="success" />
        <StatusBadge label="Kuota terbatas" tone="warning" />
        <StatusBadge label="Tutup" tone="danger" />
        <StatusBadge label="Menunggu konfirmasi" tone="info" />
        <StatusBadge label="Belum diumumkan" tone="neutral" />
      </StateBlock>
    </div>
  );
}
