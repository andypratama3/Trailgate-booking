"use client";
import { useState } from "react";
import { Button } from "@trailgate/ui";
import { KatalogNav } from "../_components/nav";
import { StateBlock } from "../_components/state-block";
import { injectTenantTheme, validateTenantTheme, resolveColorVar } from "@/lib/tenant-theme.mjs";
import { CONTOH_TEMA } from "@/lib/tenant-demo.mjs";

type ContohTema = (typeof CONTOH_TEMA)[number];

type Hasil =
  | { ok: true; pesan: string }
  | { ok: false; status: number; errors: string[]; rasio: number | null };

/** Demo runtime injeksi tema tenant (T-012): validasi AA → inject scoped, atau 422 tanpa menulis DOM. */
export default function KatalogTenantThemePage() {
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [aktif, setAktif] = useState<string | null>(null);

  const terapkan = (t: ContohTema) => {
    // Latar platform dibaca via resolveColorVar per tema (F-2): setiap tema divalidasi
    // terhadap latarnya sendiri, bukan latar yang sedang aktif saat klik.
    const lightBg = {
      canvas: resolveColorVar(document, "--tg-canvas", "light"),
      surface: resolveColorVar(document, "--tg-surface", "light"),
    };
    const darkBg = {
      canvas: resolveColorVar(document, "--tg-canvas", "dark"),
      surface: resolveColorVar(document, "--tg-surface", "dark"),
    };
    const l = validateTenantTheme(t.light, { backgrounds: lightBg });
    const d = validateTenantTheme(t.dark, { backgrounds: darkBg });
    if (!l.ok || !d.ok) {
      // F-7: tidak menghapus indikator aktif — tema lama masih terpasang di DOM.
      const res = !l.ok ? l : d;
      if (res.ok) return;
      setHasil({
        ok: false,
        status: res.status,
        errors: res.errors ?? [],
        rasio: res.details?.contrast_ratio ?? null,
      });
      return;
    }
    const inj = injectTenantTheme(document, t.light, t.dark, { lightBg, darkBg });
    if (!inj.ok) {
      // Kegagalan aman: tidak ada yang ditulis, tema lama tetap terpasang → indikator tidak dihapus.
      setHasil({ ok: false, status: 422, errors: inj.errors, rasio: null });
      return;
    }
    setAktif(t.id);
    setHasil({ ok: true, pesan: "Tema tenant diterapkan (scoped, [data-theme=\"dark\"] tetap dihormati)." });
  };

  const kembalikan = () => {
    document.head.querySelector("style[data-tg-tenant-theme]")?.remove();
    setAktif(null);
    setHasil({ ok: true, pesan: "Style tenant dihapus; token platform berlaku lagi." });
  };

  return (
    <div className="flex flex-col gap-6">
      <KatalogNav current="/katalog/tenant-theme" />
      <h1 className="text-2xl font-semibold text-fg">Tema tenant</h1>
      <p className="text-base text-fg-muted">
        Injeksi warna merek tenant lewat <code>injectTenantTheme</code>: hanya{" "}
        <code>createElement("style")</code> + <code>textContent</code>, di-scope ke{" "}
        <code>:root</code> dan <code>[data-theme="dark"]</code>. Nilai yang gagal AA ditolak
        (422) tanpa auto-adjust. Coba toggle tema gelap di navigasi setelah menerapkan merek.
      </p>

      <StateBlock title="Contoh merek tenant" description="Tiga kasus: lolos AA, gagal AA, payload injeksi.">
        {CONTOH_TEMA.map((t) => (
          <div key={t.id} className="flex flex-col gap-2">
            <p className="max-w-56 text-sm text-fg">{t.nama}</p>
            <Button
              variant="outline"
              onClick={() => terapkan(t)}
              aria-label={`Terapkan ${t.nama}`}
              aria-pressed={aktif === t.id}
            >
              {aktif === t.id ? "Aktif" : "Terapkan"}
            </Button>
          </div>
        ))}
        <Button variant="ghost" onClick={kembalikan}>
          Kembalikan tema platform
        </Button>
      </StateBlock>

      <StateBlock title="Pratinjau" description="Warna mengikuti variabel --tg-brand yang sedang aktif.">
        <div
          className="flex h-16 w-48 items-center justify-center rounded-md text-sm font-medium"
          style={{ backgroundColor: "var(--tg-brand)", color: "var(--tg-brand-fg)" }}
        >
          Contoh merek tenant
        </div>
      </StateBlock>

      {hasil && (
        <div
          role={hasil.ok ? "status" : "alert"}
          className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 text-sm"
        >
          {hasil.ok ? (
            <p className="text-fg">{hasil.pesan}</p>
          ) : (
            <>
              <p className="font-medium text-fg">
                Ditolak (status {hasil.status}) — tidak ada CSS yang ditulis.
                {aktif !== null && " Tema sebelumnya tetap dipakai."}
              </p>
              {hasil.rasio !== null && (
                <p className="text-fg-muted">
                  Rasio terukur: {hasil.rasio.toFixed(2)}:1.
                </p>
              )}
              <ul className="list-disc pl-5 text-fg-muted">
                {hasil.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
