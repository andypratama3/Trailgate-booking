"use client";
import { useState } from "react";
import { Button, Dialog } from "@trailgate/ui";
import { KatalogNav } from "../_components/nav";
import { StateBlock } from "../_components/state-block";

export default function KatalogDialogPage() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [empty, setEmpty] = useState(false);

  const openWith = (mode: "default" | "loading" | "empty" | "error") => {
    setLoading(mode === "loading");
    setEmpty(mode === "empty");
    setError(mode === "error");
    setOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <KatalogNav current="/katalog/dialog" />
      <h1 className="text-2xl font-semibold text-fg">Dialog</h1>
      <p className="text-base text-fg-muted">
        Modal dengan fokus trap, scroll lock, Escape, dan pemulihan fokus (accessibility.md §2).
      </p>

      <StateBlock title="Default" description="Klik tombol untuk membuka dialog.">
        <Button onClick={() => openWith("default")}>Buka dialog — detail penutupan</Button>
      </StateBlock>

      <StateBlock title="Loading" description="Spinner + aria-busy saat konten dimuat.">
        <Button variant="outline" onClick={() => openWith("loading")}>
          Buka dialog — loading
        </Button>
      </StateBlock>

      <StateBlock title="Empty" description="Panel terbuka, belum ada data → role=status.">
        <Button variant="outline" onClick={() => openWith("empty")}>
          Buka dialog — empty
        </Button>
      </StateBlock>

      <StateBlock title="Error" description="role=alert di dalam panel.">
        <Button variant="danger" onClick={() => openWith("error")}>
          Buka dialog — error
        </Button>
      </StateBlock>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={
          error
            ? "Penutupan gagal dimuat"
            : empty
              ? "Detail penutupan jalur"
              : "Jalur A — Gunung X"
        }
        loading={loading}
        empty={empty}
        emptyLabel="Belum ada penutupan jalur yang aktif."
        error={error ? "Status jalur tidak bisa dimuat. Cek koneksi." : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Tutup
            </Button>
            <Button onClick={() => setOpen(false)}>Pilih tanggal</Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">
          Kuota hari ini: 120 / 300 tersisa. Reservasi sementara ditahan 15 menit setelah
          lanjut.
        </p>
        <p className="mt-2 text-sm text-fg-muted">
          Sumber: situs resmi pengelola — diverifikasi 20 Nov 2026.
        </p>
      </Dialog>
    </div>
  );
}
