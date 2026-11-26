# @trailgate/ui

Komponen UI milik sendiri (pola shadcn/ui, **tanpa dependensi tertutup** seperti Radix).
Dikonsumsi `apps/web` lewat dependensi workspace `"@trailgate/ui": "workspace:*"`.

## Aturan (berlaku untuk semua komponen)

1. **Styling lewat token T-010.** Komponen hanya memakai peran semantik Tailwind
   (`bg-surface`, `text-fg-muted`, `border-border-strong`, `rounded-md`, `h-11`, …).
   Dilarang hex/px/Tailwind-primitif — dicek `check-no-hardcode` (AC-39.1):
   `pnpm -C packages/ui check-no-hardcode`.
2. **State wajib:** setiap komponen punya `default`, `loading`, `empty`, `error`
   (+ `disabled` bila interaktif), semuanya memakai `aria-busy` / `role="status"` /
   `role="alert"` sesuai `docs/ux/accessibility.md` §4.
3. **Cakupan:** komponen dasar (T-011). DataTable penuh = T-186, widget = T-187.
4. **Dependensi:** hanya `typescript` + `@types/react` (dev, versi identik dengan `apps/web`)
   untuk typecheck. React sendiri datang dari konsumen (`apps/web`).

## Pemetaan state per komponen

| Komponen | File | loading | empty | error |
|---|---|---|---|---|
| Button | `src/button.tsx` | spinner + `aria-busy` | `empty` → nonaktif "Tidak ada aksi" | `error` → nada danger + `role=alert` |
| Input | `src/input.tsx` | spinner + nonaktif | `empty` → `role=status` "Belum diisi." | `aria-invalid` + `role=alert` |
| Select | `src/select.tsx` | "Memuat pilihan..." | tanpa opsi → `emptyLabel` | `aria-invalid` + `role=alert` |
| Dialog / Sheet | `src/dialog.tsx` | spinner + skeleton | `empty` (+`emptyLabel`) → `role=status` di panel | `role=alert` di panel |
| Tabs | `src/tabs.tsx` | `aria-busy` + skeleton panel | tanpa item → `emptyMessage` | panel `role=alert` + Coba lagi |
| Toast | `src/toast.tsx` | spinner + `aria-busy` | judul kosong → "Tidak ada pesan." | nada error + `role=alert` |
| DataTable | `src/data-table.tsx` | `aria-busy` + skeleton baris | pesan dalam `<tbody>` | `role=alert` + Coba lagi |
| CalendarQuota | `src/calendar-quota.tsx` | skeleton grid | tanpa data hari → pesan | `role=alert` + Coba lagi |
| StatusBadge | `src/status-badge.tsx` | spinner + "Memeriksa status..." | label kosong → "Tidak ada status" | `role=alert`, nada danger |
| QuotaMeter | `src/quota-meter.tsx` | skeleton bar + `role=status` | tanpa `remaining/capacity` | `role=alert` + Coba lagi |
| Stepper | `src/stepper.tsx` | skeleton + `role=status` | tanpa langkah → `emptyMessage` | `role=alert` |

## Katalog komponen

Katalog internal ada di `apps/web/app/(internal)/katalog/**` (path tg-web; T-011 co_owner).
Setiap komponen dirender dengan seluruh state-nya, plus tombol ganti tema gelap/terang.
**Catatan Button:** tanpa `error`, `Button` merender `<button>` langsung (`className` konsumen
berlaku ke `<button>`); dengan `error`, tombol dibungkus `<span className="inline-flex flex-col gap-2">`
agar pesan `role=alert` bisa tampil di bawahnya (`className` tetap ke `<button>`).

```sh
pnpm -C apps/web dev     # http://localhost:3000/katalog
```

**Catatan integrasi Tailwind:** utilitas yang hanya muncul di `packages/ui/src/**`
tidak terdeteksi otomatis oleh Tailwind (root pemindaian = `apps/web`), jadi
`apps/web/app/globals.css` memuat satu baris `@source "../../../packages/ui/src";`
(ditambahkan T-011, 2 baris, file milik tg-web — perlu konfirmasi tg-web saat review).
Tanpa baris itu kelas `rounded-l-lg`, `border-t-transparent`, `outline-focus`, dst. tidak
digenerate dan tampilan komponen rusak.

## Audit axe

Skrip: `packages/ui/scripts/axe-katalog.mjs` — menurunkan rute dari direktori
`apps/web/app/(internal)/katalog/**` (tidak bisa drift), menjalankan `axe.run` tiap halaman,
dan gagal bila ada pelanggaran `serious`/`critical` **atau** halaman berstatus HTTP ≥ 400
(tidak ada lulus palsu untuk rute yang hilang).

```sh
pnpm -C apps/web build && pnpm -C apps/web start -p 3100
pnpm -C packages/ui axe -- --base http://localhost:3100
# tanpa unduhan Playwright: node scripts/axe-katalog.mjs --executable /path/ke/chrome
```

Pemilihan browser berurutan dan diuji dengan launch nyata: `--executable`/`AXE_CHROMIUM_PATH`
→ browser bawaan Playwright → kandidat browser sistem (`google-chrome`, `chromium`).
Playwright diluncurkan dengan `chromiumSandbox: false` (host/root CI) — hanya untuk audit lokal.

Hasil terverifikasi (2026-11-25, `next start` build repo ini): 13 halaman, **0 violations,
0 serious/critical, exit 0**, browser `chromium-1255` bawaan Playwright.

Prasyarat gate: `@axe-core/playwright@4.14.1` + `@playwright/test` di root `devDependencies`
(T-015 disetujui, dev-only). Bila tidak ada browser yang bisa diluncurkan, skrip keluar `2`
dengan status `GATE_PENDING_BROWSER` + instruksi (jangan install sendiri — AGENTS.md #10).

Exit: `0` lulus, `1` ada pelanggaran/gagal muat, `2` prasyarat gate, `3` direktori katalog hilang.
