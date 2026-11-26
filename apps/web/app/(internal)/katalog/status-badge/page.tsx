"use client";
import { StatusBadge } from "@trailgate/ui";
import { KatalogNav } from "../_components/nav";
import { StateBlock } from "../_components/state-block";

export default function KatalogStatusBadgePage() {
  return (
    <div className="flex flex-col gap-6">
      <KatalogNav current="/katalog/status-badge" />
      <h1 className="text-2xl font-semibold text-fg">StatusBadge</h1>
      <p className="text-base text-fg-muted">
        Status jalur — ikon bentuk + teks selalu ada (tidak andalkan warna saja, SC 1.4.1).
      </p>

      <StateBlock title="Default (tone)" description="Semua tone dengan teks.">
        <StatusBadge label="Buka" tone="success" />
        <StatusBadge label="Kuota terbatas" tone="warning" />
        <StatusBadge label="Tutup" tone="danger" />
        <StatusBadge label="Menunggu konfirmasi" tone="info" />
        <StatusBadge label="Belum diumumkan" tone="neutral" />
      </StateBlock>

      <StateBlock title="Loading" description="Spinner + aria-busy + teks 'Memeriksa status...'.">
        <StatusBadge label="Buka" tone="success" loading />
      </StateBlock>

      <StateBlock title="Empty" description="Label kosong → 'Tidak ada status' (nada netral).">
        <StatusBadge label="" tone="neutral" />
      </StateBlock>

      <StateBlock title="Error" description="role=alert + nada danger + pesan.">
        <StatusBadge label="Status tidak bisa dimuat" error="cek koneksi." />
      </StateBlock>
    </div>
  );
}
