"use client";
import { useState } from "react";
import { Button, Sheet } from "@trailgate/ui";
import { KatalogNav } from "../_components/nav";
import { StateBlock } from "../_components/state-block";

export default function KatalogSheetPage() {
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
      <KatalogNav current="/katalog/sheet" />
      <h1 className="text-2xl font-semibold text-fg">Sheet</h1>
      <p className="text-base text-fg-muted">
        Drawer sisi kanan yang mereuse <code className="rounded bg-surface-raised px-1 py-0.5">Dialog</code>{" "}
        (fokus trap + Escape + aria-modal).
      </p>

      <StateBlock title="Default">
        <Button onClick={() => openWith("default")}>Buka sheet — isi data rombongan</Button>
      </StateBlock>

      <StateBlock title="Loading">
        <Button variant="outline" onClick={() => openWith("loading")}>
          Buka sheet — loading
        </Button>
      </StateBlock>

      <StateBlock title="Empty" description="Drawer terbuka, belum ada data → role=status.">
        <Button variant="outline" onClick={() => openWith("empty")}>
          Buka sheet — empty
        </Button>
      </StateBlock>

      <StateBlock title="Error">
        <Button variant="danger" onClick={() => openWith("error")}>
          Buka sheet — error
        </Button>
      </StateBlock>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={
          empty ? "Daftar anggota" : "Data rombongan — langkah 2 dari 4"
        }
        loading={loading}
        empty={empty}
        emptyLabel="Belum ada anggota yang ditambahkan."
        error={error ? "Progres tidak bisa dimuat. Periksa koneksi." : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => setOpen(false)}>Simpan & lanjut</Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">
          Ketua: nama, HP, email. Anggota (8): terisi 3, menunggu tautan 5 — bagikan link
          pengisian untuk mengundang.
        </p>
      </Sheet>
    </div>
  );
}
