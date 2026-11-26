"use client";
import { Button } from "@trailgate/ui";
import { KatalogNav } from "../_components/nav";
import { StateBlock } from "../_components/state-block";

export default function KatalogButtonPage() {
  return (
    <div className="flex flex-col gap-6">
      <KatalogNav current="/katalog/button" />
      <h1 className="text-2xl font-semibold text-fg">Button</h1>
      <p className="text-base text-fg-muted">
        Varian (primary/secondary/outline/ghost/danger) + state default/loading/empty/error/disabled.
      </p>

      <StateBlock title="Default">
        <Button>Bayar sekarang</Button>
        <Button variant="secondary">Cari</Button>
        <Button variant="outline">Lihat detail penutupan</Button>
        <Button variant="ghost">Batal</Button>
        <Button variant="danger">Tolak booking</Button>
      </StateBlock>

      <StateBlock title="Loading" description="Spinner + aria-busy; aksi tidak bisa di klik saat memuat.">
        <Button loading>Simpan</Button>
        <Button variant="outline" loading loadingLabel="Menahan kuota…">
          Lanjut isi data
        </Button>
      </StateBlock>

      <StateBlock title="Empty" description="Konteks kosong: tombol dinonaktifkan dengan label 'Tidak ada aksi'.">
        <Button empty />
        <Button variant="secondary" empty emptyLabel="Tidak ada jalur yang cocok" />
      </StateBlock>

      <StateBlock title="Error" description="Aksi gagal: nada danger + pesan role=alert.">
        <Button error="Pembayaran belum terkonfirmasi — periksa status." variant="outline">
          Cek status
        </Button>
      </StateBlock>

      <StateBlock title="Disabled">
        <Button disabled variant="outline">
          Beri tahu saya jika jalur dibuka
        </Button>
      </StateBlock>
    </div>
  );
}
