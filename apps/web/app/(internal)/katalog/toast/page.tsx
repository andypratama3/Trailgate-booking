"use client";
import { useState } from "react";
import { Button, Toast, type ToastTone } from "@trailgate/ui";
import { KatalogNav } from "../_components/nav";
import { StateBlock } from "../_components/state-block";

type DemoMode = ToastTone | "loading" | "empty";

const CONTENT: Record<DemoMode, { tone: ToastTone; title: string; description?: string; loading?: boolean }> = {
  success: { tone: "success", title: "Check-in berhasil", description: "TG-2026-0001 · 12:04." },
  warning: { tone: "warning", title: "Kuota hampir habis", description: "Sisa 12 dari 300 [DEMO]." },
  info: { tone: "info", title: "Pembaruan tersedia", description: "Versi baru siap dipasang." },
  error: { tone: "error", title: "Pembayaran belum terkonfirmasi", description: "Pembayaran belum terkonfirmasi — periksa status." },
  loading: { tone: "info", title: "Menahan kuota…", description: "Jangan tutup halaman ini.", loading: true },
  empty: { tone: "info", title: "" },
};

export default function KatalogToastPage() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DemoMode>("success");

  const show = (m: DemoMode) => {
    setMode(m);
    setOpen(true);
  };

  const current = CONTENT[mode];

  return (
    <div className="flex flex-col gap-6">
      <KatalogNav current="/katalog/toast" />
      <h1 className="text-2xl font-semibold text-fg">Toast</h1>
      <p className="text-base text-fg-muted">
        Status message — role=status (polite) untuk non-error, role=alert (assertive) untuk
        error; dapat ditutup via keyboard.
      </p>

      <StateBlock title="Default (tone)" description="Pilih tone untuk menampilkan Toast.">
        <Button onClick={() => show("success")}>Berhasil</Button>
        <Button variant="outline" onClick={() => show("warning")}>Perhatian</Button>
        <Button variant="ghost" onClick={() => show("info")}>Info</Button>
        <Button variant="danger" onClick={() => show("error")}>Gagal</Button>
      </StateBlock>

      <StateBlock title="Loading" description="Toast progres: spinner + aria-busy (tone info).">
        <Button variant="outline" onClick={() => show("loading")}>Tampilkan loading</Button>
      </StateBlock>

      <StateBlock title="Empty" description="Tanpa judul → 'Tidak ada pesan.'">
        <Button variant="ghost" onClick={() => show("empty")}>Tampilkan empty</Button>
      </StateBlock>

      <Toast
        open={open}
        onClose={() => setOpen(false)}
        tone={current.tone}
        title={current.title}
        description={current.description}
        loading={current.loading}
        duration={mode === "loading" ? 0 : 4000}
      />
    </div>
  );
}
