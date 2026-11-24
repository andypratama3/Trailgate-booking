# Papan Status — TrailGate

> Hanya **Orchestrator** yang menulis file ini. Status detail per tugas hidup di
> `docs/board/BACKLOG.md`; detail tugas di `docs/board/tasks/T-xxx.yml`.

## Fase & Gate

| | |
|---|---|
| Fase aktif | **P0 — Discovery & Fondasi** |
| Gate berikutnya | **G0 Spec** (lihat §16.8 PRD) |
| Status G0 | **BELUM** — menunggu (a) dekomposisi FR-ID + AC (T-003), (b) ADR + kontrak (T-005, T-006), (c) aturan domain bersumber (T-004), (d) **2 pilot bersedia** (manusia) |

## Fakta lingkungan terverifikasi (diuji, bukan diasumsikan)

| Uji | Hasil | Dampak |
|---|---|---|
| `php`/`composer`/`node`/`pnpm`/`docker` tersedia | PHP 8.3.6, Node 22.23.5, pnpm 10.33.2, Docker 29.10.0 | Laravel 12 (butuh PHP ≥ 8.2) dan Next.js bisa di-scaffold lokal |
| Jaringan ke Packagist/npmjs | HTTP 200 | pin versi nyata saat scaffold, bukan menebak |
| `.omp/agents/*.md` terdaftar sebagai seat `task` | **ya** (agent proyek muncul di roster; terbukti `tg-test` bisa di-spawn dari sesi berjalan) | roster §16.3 dieksekusi sungguhan, bukan dokumentasi |
| `model: slow|smol|default` di frontmatter | diterima tanpa error (mapping tepat **belum** dikonfirmasi; `config.yml` hanya memetakan `default`) | role dipakai apa adanya; biaya mungkin jatuh ke `default` |
| Isolasi filesystem subagent | **tidak terisolasi** — subagent menulis ke working tree yang sama | fan-out **hanya** untuk path berbeda; commit dari sesi utama |
| `lsp`/`ast_edit` di subagent | **belum diaktifkan** (`config.yml` belum punya `task.enableLsp`/`astGrep.enabled`) | tool itu tidak dimasukkan ke roster; lihat "Perlu keputusan" |

## Rencana gelombang P0 (path berbeda → boleh paralel)

| Gelombang | Tugas | Path | Alasan urutan |
|---|---|---|---|
| W0 (Orchestrator) | T-002 (roster, papan, skema yield) | `.omp/agents/**`, `docs/board/**`, `AGENTS.md`, `OWNERS.md` | prasyarat semua |
| W1 | T-001 (scaffold), T-003 (FR/AC), T-009 (kit wawancara) | `apps/**`+`docker/**`+`.github/**` · `docs/requirements/fr/**` · `docs/requirements/interviews/**` | tanpa dependensi, path terpisah |
| W2 | T-004 (Mountain Pack), T-005 (ADR), T-007 (UX/wireframe), T-008 (CI) | `docs/domain/**`+`seeders/packs/**` · `docs/adr/**` · `docs/ux/**` · `.github/**` | T-004/T-005/T-007 dep T-003; T-008 dep T-001 |
| W3 | T-006 (OpenAPI+tipe), T-010 (token pipeline) | `packages/contracts/**` · `packages/design-tokens/**` | T-006 dep T-005; T-010 dep T-001 |
| W4 | T-011 (packages/ui), T-012 (tema tenant) | `packages/ui/**` · `apps/web/**` | T-011 dep T-010; T-012 dep T-011 |

Catatan: **W2 dan W3 bisa tumpang tindih** karena path-nya berbeda; gelombang di atas hanya urutan
dependensi, bukan larangan paralel.

## Perlu keputusan manusia (menghambat G0)

1. §20.2 #1 — gunung/pengelola pilot (menentukan Mountain Pack pertama).
2. §20.2 #2 — fokus awal basecamp vs TO/open trip.
3. §20.2 #3 — setuju D4 (BYO Midtrans) atau dana lewat platform.
4. §20.2 #4 — nama produk final + domain. *(nama kerja sementara: "TrailGate")*
5. §20.2 #5 — konsultan hukum UU PDP/PSE/refund.
6. §20.2 #6 — hosting (VPS Indonesia vs cloud).
7. §20.2 #7 — model harga template.
8. **G0 exit criteria** — "2 pilot bersedia" dan "5 wawancara basecamp + 3 TO" adalah pekerjaan manusia
   (T-009 menyiapkan kitnya, bukan menggantikan wawancara).
9. Global `~/.omp/agent/config.yml`: menambah `task.enableLsp`, `astGrep.enabled`,
   `task.agentModelOverrides` — perubahan config pengguna, butuh persetujuan.

## Log keputusan Orchestrator

| # | Keputusan | Alasan |
|---|---|---|
| O-1 | PRD dipindahkan `PROMPT.md` → `docs/prd/PRD.md` | Lampiran B langkah 2 |
| O-2 | `OWNERS.md` menambah path infra (`apps/api/**` non-domain, `docker-compose*`, `Makefile`, dotfiles) ke `tg-devops`; `AGENTS.md`/`OWNERS.md`/`README.md` ke `orchestrator` | §16.4 hanya memetakan path produk; tanpa ini auditor menandai commit tak berpemilik |
| O-3 | Toolset roster **tidak** memuat `lsp`/`ast_edit` | belum aktif di config pengguna; menghindari seat gagal spawn. Diaktifkan setelah persetujuan #9 |
| O-4 | Subagent berbagi working tree → Orchestrator hanya memparalelkan tugas dengan path berbeda, dan melakukan commit | hasil uji isolasi filesystem di atas |
