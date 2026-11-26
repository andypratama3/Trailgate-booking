# Papan Status — TrailGate

> Hanya **Orchestrator** yang menulis file ini. Status detail per tugas hidup di
> `docs/board/BACKLOG.md`; detail tugas di `docs/board/tasks/T-xxx.yml`.

## Fase & Gate

| | |
|---|---|
| Fase aktif | **P0 — Discovery & Fondasi** |
| Gate berikutnya | **G0 Spec** (lihat §16.8 PRD) |
| Status G0 | **BELUM** — menunggu (a) T-009 sign-off Andy (kit wawancara), (b) **2 pilot bersedia**, (c) keputusan §20.2 #1-#7, (d) wawancara 5 basecamp + 3 TO (manusia). Tugas P0 yang bisa dikerjakan mesin: T-001..T-008, T-010, T-011, T-013, T-014, T-015 **done**; T-012 kartunya masih `todo` (pekerjaan berjalan, BuildReport belum masuk — status kartu baru berubah saat laporan diterima); T-016 todo |

## Fakta lingkungan terverifikasi (diuji, bukan diasumsikan)

| Uji | Hasil | Dampak |
|---|---|---|
| `php`/`composer`/`node`/`pnpm`/`docker` tersedia | PHP 8.3.6, Node 22.23.5, pnpm 10.33.2, Docker 29.10.0 | Laravel 12 (butuh PHP ≥ 8.2) dan Next.js bisa di-scaffold lokal |
| Jaringan ke Packagist/npmjs | HTTP 200 | pin versi nyata saat scaffold, bukan menebak |
| `.omp/agents/*.md` terdaftar sebagai seat `task` | **ya** — `omp -p --no-session 'List the agent type names your task tool offers, comma-separated, nothing else.'` mengembalikan roster; setelah `.omp/agents/tg-test.md` dibuat, `tg-test` muncul di daftar dan berhasil di-spawn dari sesi berjalan (agent `RosterProbe` mengembalikan `pong`). `tg-test` kemudian **dihapus** — tidak termasuk roster permanen. Kembali dibuktikan 2026-11-25: `.omp/agents/tg-ocr.md` dibuat → seat `tg-ocr` langsung ter-spawn. Roster permanen: 16 seat | roster §16.3 dieksekusi sungguhan, bukan dokumentasi |
| `model: slow|smol|default` di frontmatter | diterima tanpa error (mapping tepat **belum** dikonfirmasi; `config.yml` hanya memetakan `default`) | role dipakai apa adanya; biaya mungkin jatuh ke `default` |
| Isolasi filesystem subagent | **tidak terisolasi** — uji: agent `sonic` (job `FsProbe`) diminta menulis `docs/board/_fsprobe.txt`; file muncul di working tree utama, `find / -name _fsprobe.txt` menghasilkan satu lokasi, dan `git worktree list` hanya menampilkan `master`. **Catatan:** ini bertentangan dengan teks PRD §16.1/§16.15 yang menyebut "worktree terisolasi"; perbedaan ini direkonsiliasi keputusan O-4 dan perlu diamandemen `tg-analyst`/ADR. | fan-out **hanya** untuk path berbeda; commit dari sesi utama |
| `lsp`/`ast_edit` di subagent | **belum diaktifkan** (`config.yml` belum punya `task.enableLsp`/`astGrep.enabled`) | tool itu tidak dimasukkan ke roster; lihat "Perlu keputusan" |

## Rencana gelombang P0 (path berbeda → boleh paralel)

| Gelombang | Tugas | Status (2026-11-27) |
|---|---|---|
| W0 (Orchestrator) | T-002 (roster, papan, skema yield) | **done** (verify pass; D-1..D-5 ditutup) |
| W1 | T-001 (scaffold), T-003 (FR/AC), T-009 (kit wawancara) | T-001 **done**; T-003 **done**; T-009 **agent-side done, menunggu sign-off Andy** |
| W2 | T-004 (Mountain Pack), T-005 (ADR), T-007 (UX), T-008 (CI) | **done** (T-008 3 putaran rework, O-15/ADR-008; actionlint 0 error, 14 job) |
| W3 | T-006 (OpenAPI+tipe), T-010 (token pipeline) | **done** (T-006 2 putaran; T-010 1 putaran, N-1 diputus opsi b) |
| W4 | T-011 (packages/ui), T-012 (tema tenant) | T-011 **done** (AC-39.2 tertutup dengan bukti browser); T-012 **rework r1 berjalan** (2 P1 dari tg-ux: ambang non-teks & latar per tema) |
| Tambahan | T-013/T-015 (gate paket ocr + axe), T-014 (manifest POS), T-016 (axe di CI) | **done** |

Catatan: gelombang = urutan dependensi, bukan larangan paralel (path berbeda). Sisa P0 bukan pekerjaan mesin:
sign-off T-009 + keputusan §20.2 (lihat bagian berikut).

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
| O-2 | Cakupan path diperluas di `OWNERS.md` blok infra (baris 34-42): `apps/api/app/**` sisa → tg-backend; `apps/api/tests/**` → tg-backend; `apps/api/config|bootstrap|*.json|*.xml` → tg-devops; `apps/api/**` sisa → tg-devops; `apps/web/**` sisa → tg-web; root build files + `.gitignore`/`.dockerignore`/`README.md`/`.env*` (root) → tg-devops; `.omp/** AGENTS.md OWNERS.md PROMPT.md` → orchestrator | §16.4 hanya memetakan path produk; tanpa ini auditor menandai commit tak berpemilik |
| O-3 | Toolset roster **tidak** memuat `lsp`/`ast_edit` | belum aktif di config pengguna; menghindari seat gagal spawn. Diaktifkan setelah persetujuan #9 |
| O-4 | Subagent berbagi working tree → Orchestrator hanya memparalelkan tugas dengan path berbeda, dan melakukan commit | hasil uji isolasi filesystem di atas |
| O-5 | Semua seat yang menulis `model: slow`/`smol` **berjalan pada model `default`** sampai terbukti sebaliknya — mapping role→model belum diverifikasi dan `task.agentModelOverrides` belum diisi (#9) | reviewer tg-architect F-6: jangan menganggap cost-routing §16.13 sudah berlaku |
| O-6 | Deviasi tata kelola bootstrap dicatat di `docs/adr/ADR-007-governance-deviations.md`: cakupan Orchestrator (menyimpang dari PRD §16.3), urutan T-002 sebelum T-001, bootstrap di `master` tanpa branch `integration`, subagent tanpa isolasi worktree | reviewer tg-architect/tg-reviewer F-11: PRD §16.3 tidak diubah; ADR mencatatnya sebagai keputusan pengganti |
| O-7 | Kunci uji `base64:XVk01Eub...` di `apps/api/.env.testing` (commit `f29df88`) diperbaiki ke depan saja (`APP_KEY=` kosong + kunci acak per proses lewat `bootstrap/phpunit-testing.php`); **riwayat TIDAK ditulis ulang** | rewrite history akan membatalkan daftar commit di ADR-007 dan seluruh rujukan hash di papan; nilai murni kunci uji, tidak pernah dipakai di luar testing. Konsekuensi: T-008 wajib menambah allowlist terdokumentasi agar secret scan tidak gagal pada hash lama |
| O-8 | `tg-auditor` diberi tool `write` yang **dibatasi** ke `docs/board/audit/**` saja | PRD §16.3 memberi auditor area tulis `docs/board/audit/**` tetapi toolset-nya hanya baca ("bash (read-only)") — kontradiksi di PRD sendiri. Akibatnya `docs/board/audit/` kosong (verifier T-002 D-2). Resolusi: auditor boleh menulis laporannya sendiri, tidak lebih |
| O-9 | Seat ke-16 `tg-ocr` dibuat (reviewer mesin berbasis skill `alibaba/open-code-review`; toolset `read/grep/glob/find/bash/todo`, **tanpa hak tulis**). Paket CLI-nya diajukan lewat task card `T-013` ke tg-security sesuai AGENTS.md #10 | pengguna meminta skill itu dipakai dan ditetapkan ke sebuah agent; reviewer mesin **melengkapi**, tidak menggantikan `tg-reviewer`/`tg-auditor` (temuan tetap wajib diverifikasi host — Step 3 skill). Tanpa approve T-013 + provider OCR, seat ini tidak bisa dijalankan |
| O-10 | Skill pihak ketiga di-vendor ke repo (`.agents/skills/**`, `.claude/skills/**` symlink, `skills-lock.json`) alih-alih global | repo harus dapat direproduksi dari clone; `skills-lock.json` mengunci versi. Konsekuensi: diff review harus mengecualikan `**/generated/**` dan aset skill |
| O-11 | Perbaikan konfigurasi git: probe awal Orchestrator menjalankan `git config user.name user.email` yang justru **men-set** `user.name` lokal menjadi literal `user.email`, sehingga 11 commit pertama (`f29df88`…`b91bba5`) tercatat sebagai author `user.email <andypratama1211@gmail.com>`. Konfigurasi lokal di-`unset` → efektif kembali `andypratama3 <andypratama1211@gmail.com>`. **Riwayat TIDAK ditulis ulang** (alasan sama dengan O-7: daftar commit di ADR-007 dan seluruh rujukan hash papan akan batal) | kesalahan Orchestrator sendiri, dicatat agar tidak diulang dan agar identitas commit yang aneh tidak dianggap penyusupan; author yang benar sudah berlaku untuk commit berikutnya |
| O-12 | `pnpm-lock.yaml` root diubah oleh dua tugas paralel (deps eslint T-008/tg-devops + dev-deps kontrak T-006/tg-architect). Commit per-tugas memecah konsistensi lockfile → `--frozen-lockfile` gagal di salah satu dari dua commit berurutan (temuan tereview tg-web T-006 F-1b, P1). Resolusi: **satu commit integrasi** berisi `packages/contracts/**` + `pnpm-lock.yaml` + `apps/web/package.json` dengan atribusi per-owner di pesan; setelah itu tidak ada lagi lockfile yang berubah dalam commit per-tugas | pengecualian tunggal dari pemisahan commit per-tugas, hanya untuk file lock yang shared; cegah pola serupa di masa depan (bila dua tugas paralel menyentuh lockfile → wajib komit gabungan atau tunda salah satu) |
| O-13 | Kesalahan prosedur commit Orchestrator: `git add <satu path> && git commit` pada shared working tree **menyapu semua file yang sudah di-`git add` subagent**, sehingga commit board `78bfa4f` tanpa sengaja memuat payload T-006 r1 (`openapi.yaml`, `src/generated/openapi.d.ts`, `tests/**`) + `pnpm-lock.yaml` dengan pesan commit yang menyesatkan. Tidak ada kerugian data (isi benar, pemilik benar), tetapi pesan commit tidak akurat pada revisi itu. **Aturan baru:** semua commit Orchestrator memakai `git commit --only -- <path>...` (atau tool commit namespace dengan `only()`), TIDAK PERNAH `git add` + `git commit` polos; payload tugas selalu masuk lewat commit dengan path eksplisit | mencegah pesan commit menyesatkan auditor yang membaca `git log`, dan mencegah file setengah jadi ikut ter-commit |
| O-14 | Arahan pengguna 2026-11-25: **commit yang HANYA menyentuh markdown tidak di-push** ke `origin`. Berlaku untuk commit papan dokumen (`docs/board/**`, `docs/ux/**`, `docs/adr/**`, `docs/**.md`, `*.md` root) yang tidak membawa artefak kode/konfigurasi. Push dilakukan hanya saat commit memuat perubahan non-markdown (kode, konfigurasi, workflow, lockfile) | menghindari riwayat remote yang penuh commit dokumentasi internal; artefak yang perlu dipakai pihak lain tetap ter-push bersama kode |
| O-15 | T-008 melampaui batas 2 putaran rework (§16.2): r3 dijalankan. Arbitrasi ringan oleh Orchestrator: temuan r3 adalah **cacat mekanis** (preamble `ci.yml` terduplikasi — `name`/`on`/`env` dua kali, `ci.yml:13/14/19` vs `24/26/32`, diverifikasi `grep` + loader YAML ketat → `duplicate key 'name'`, sedangkan `yaml.safe_load` longgar sehingga r2 melaporkan "parse OK") + 3 dokumen (F-5/F-6b/F-7b), bukan keputusan desain yang butuh mediator. Ditambahkan alasan objektif: pada jeda itu tidak ada perubahan lingkup, dan seluruh temuan r3 berasal dari artefak yang sudah dinilai r2 | dipilih daripada arbitrasi `tg-architect` formal karena tidak ada perbedaan pendapat antar-agent yang perlu diputus; dicatat sebagai deviasi agar auditor tidak menghitungnya sebagai pelanggaran senyap |
| O-16 | Penutupan temuan audit P0 (2026-11-26) yang ada di wewenang Orchestrator: (A-2/A-3) **kartu gate** (T-013, T-015) dieksekusi tanpa 2 reviewer karena keputusan tunggal pemilik gate (`tg-security`) + verifier `tg-auditor`, tanpa artefak produk yang dibangun → kini didokumentasikan sebagai **AGENTS.md butir 12** (jalur ringkas kartu gate); (A-8) `skills-lock.json` masuk baris owner `tg-devops` di `OWNERS.md`; (A-9) konsentrasi peran (co_owner yang juga reviewer: T-001 tg-architect, T-011 tg-web, T-013 tg-devops) **diterima** sebagai konsekuensi roster 16 seat — aturan literal owner ≠ reviewer ≠ verifier tetap tidak dilanggar (verifier selalu seat lain), tetapi dilaporkan jujur agar pembaca tahu kedalaman independensi review | memilih mendokumentasikan (bukan mengubah roster 16 seat demi independensi penuh) karena alternatifnya menambah seat khusus review yang belum diperlukan; dicatat agar auditor/pembaca menilai sendiri |
