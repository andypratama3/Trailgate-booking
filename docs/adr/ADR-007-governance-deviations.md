> **Status:** accepted · **Tanggal:** 2026-11-24 · **Owner:** tg-architect · **Amandemen atas:** PRD §16.1, §16.3, §16.5, §16.7, §16.15, §17
> **Amandemen (2026-11-24):** Deviasi 3 diperluas dari commit bootstrap menjadi **seluruh phase P0**, dengan pemicu berakhir (T-008 + branch `integration`) dan tindak lanjut wajib sejak P1.

# ADR-007 — Deviasi operating model saat bootstrap P0

## Konteks

PRD Bagian 16 menetapkan operating model multi-agent (roster, kepemilikan path, task card,
siklus kerja, mode kegagalan) dan Bagian 17 menetapkan urutan dependensi backlog P0. Sebagian
asumsi model itu tidak berlaku pada repo ini saat bootstrap, karena kondisi yang diasumsikan
PRD belum ada (roster agent belum dibuat, branch `integration` belum ada, isolasi worktree
subagent tidak terjadi di lingkungan terpasang).

Empat deviasi berikut sudah dicatat sebagai prosa — log keputusan `O-1..O-5` di
[`docs/board/STATUS.md`](../board/STATUS.md) dan blok `deviation:` di
[`docs/board/tasks/T-002.yml`](../board/tasks/T-002.yml) — tetapi belum sebagai ADR. Auditor yang
menerapkan PRD §16/§18.1 tanpa rujukan ini dapat menandai bootstrap sebagai pelanggaran diam.
ADR ini mencatat deviasi itu secara formal, beserta dasar buktinya.

Deviasi ini berlaku **hanya untuk phase P0** (termasuk commit bootstrap); setelah roster, papan,
branch `integration`, dan CI berdiri (T-008), siklus kerja §16.7 berlaku penuh.

---

## Deviasi 1 — Ruang tulis Orchestrator lebih luas dari §16.3

**Konteks**

PRD §16.3 (baris `Orchestrator`) memberi batas tulis: "Boleh menulis — `docs/board/**` saja",
dengan larangan "Menulis kode produk". Dalam praktik, bootstrap memerlukan penulisan
`AGENTS.md`, `OWNERS.md`, `.omp/**` (roster agent, 15 seat), dan pemindahan `PROMPT.md` →
`docs/prd/PRD.md` oleh Orchestrator itu sendiri.

Bukti repo:

- `docs/board/STATUS.md` — log keputusan **O-2** (dan **O-1** untuk pemindahan `PROMPT.md`).
- `docs/board/tasks/T-002.yml` — `acceptance` menuntut `AGENTS.md`, `OWNERS.md`, dan
  `.omp/agents/*.md` (15) ada, dengan `owner: orchestrator`; `notes` menyatakan tugas ini
  "Dikerjakan langsung oleh Orchestrator (owner = orchestrator, path `docs/board/**`), bukan subagent".
- `OWNERS.md` — blok "Path infra yang tidak terdaftar di PRD §16.4": `.omp/**  AGENTS.md  OWNERS.md
  → orchestrator` dan `PROMPT.md (dihapus saat bootstrap → docs/prd/PRD.md) → orchestrator`.

**Keputusan**

OD-2 (`STATUS.md`) berlaku sebagai amandemen dan **menggantikan §16.3 untuk repo ini**:
Orchestrator boleh menulis `docs/board/**`, `AGENTS.md`, `OWNERS.md`, `.omp/**`, dan
`PROMPT.md` (saat relokasi bootstrap). Larangan §16.3 atas kode produk tetap berlaku tanpa
pengecualian.

**Alternatif yang ditolak**

1. Mematuhi §16.3 secara literal. Ditolak: `AGENTS.md`/`OWNERS.md`/`.omp/**` adalah artefak
   akseptansi T-002 yang owner-nya Orchestrator; tanpa tulis, tidak seorang pun dapat
   menghasilkan roster, dan §18.1 ("Setiap commit hanya menyentuh path milik agent pembuatnya")
   justru gagal karena commit pemiliknya tak terpetakan.
2. Mendelegasikan `AGENTS.md`/`OWNERS.md`/`.omp/**` ke `tg-devops`. Ditolak: seat `tg-devops`
   adalah keluaran T-002, jadi belum ada saat pekerjaan itu dilakukan (sirkular).
3. Menyerahkan `PROMPT.md` → `docs/prd/PRD.md` ke `tg-analyst`. Ditolak sebagai jalur utama;
   digantikan dengan menetapkan `co_owner: tg-analyst` pada T-002 sehingga perpindahan itu sah
   menurut §18.1 (`docs/prd/**` → `tg-analyst`).

**Konsekuensi**

- Ruang tulis Orchestrator lebih luas daripada §16.3 pada bootstrap; auditor yang membaca §16.3
  saja wajib merujuk ADR ini bersama `OWNERS.md` (baris `.omp/**  AGENTS.md  OWNERS.md`).
- Scope tambahan bersifat governance, bukan produk: tetap tidak ada kode produk yang ditulis
  Orchestrator.
- Bila `OWNERS.md` diubah kelak atas path yang sudah dipetakan PRD §16.4, perubahan itu
  memerlukan ADR baru (`OWNERS.md` menutup blok path infra dengan aturan ini).

---

## Deviasi 2 — T-002 dikerjakan lebih dulu daripada T-001

**Konteks**

PRD §17 baris `T-002` menetapkan `Dep` = `T-001` (scaffold monorepo oleh `tg-devops`). Faktanya
T-002 (roster, papan, skema yield) dieksekusi lebih dulu: roster agent adalah prasyarat untuk
pekerjaan subagent apa pun — tanpa seat `tg-devops` tidak ada yang dapat mengerjakan T-001,
dan `docs/board/**` + skema yield §16.6 harus ada sebelum BuildReport pertama.

Bukti repo:

- `docs/board/tasks/T-002.yml` — blok `deviation:` (`prd_dep: T-001`, `actual: executed before T-001`),
  `depends_on: []`.
- `docs/board/STATUS.md` — tabel "Rencana gelombang P0" menempatkan T-002 di **W0 (Orchestrator)**
  dengan alasan "prasyarat semua", sementara T-001 ada di W1.

**Keputusan**

Urutan dependensi §17 untuk P0 **dibalik secara sadar**: T-002 dijalankan sebelum T-001.
`depends_on: []` pada T-002 adalah representasi operasional yang benar; referensi §17 tetap
dibawa di blok `deviation.prd_dep` agar keterlacakan tidak hilang.

**Alternatif yang ditolak**

1. Mematuhi §17 (T-001 → T-002). Ditolak: tidak ada seat yang dapat menjalankan T-001 sebelum
   T-002 menghasilkan roster.
2. Mengerjakan scaffold monorepo langsung dari Orchestrator agar urutan §17 tetap terjaga.
   Ditolak: melanggar larangan §16.3 "Menulis kode produk" dan melampaui `OWNERS.md`
   (`apps/**`, `docker/**` → `tg-devops`).

**Konsekuensi**

- Kolom `Dep` §17 bukan sumber otoritatif untuk urutan bootstrap P0; task card + ADR ini yang
  mengikat.
- §18.1 tidak memeriksa urutan dependensi (yang diperiksa: FR→tugas, tugas→tes, tugas→review,
  pemisahan peran, kepemilikan path, kesumberan domain, batas rework); deviasi ini tetap dicatat
  sebagai keputusan sadar, bukan kelalaian.
- W1 (`T-001`) tetap milik `tg-devops` dengan reviewer/verifier per §17.

---

## Deviasi 3 — Seluruh phase P0 di-commit langsung ke `master`, bukan lewat `agent/<owner>/<id>` → `integration`

**Konteks**

PRD §16.5 mencontohkan task card dengan `branch: agent/tg-data/T-121` (pola `agent/<owner>/<id>`),
dan §16.7 langkah akhir siklus kerja adalah "tg-devops merge ke `integration` + CI penuh".
Cakupan deviasi ini adalah **seluruh phase P0**, bukan hanya commit bootstrap: tiga kondisi
membuat alur §16.5/§16.7 tidak dapat dijalankan untuk commit P0 mana pun.

1. Branch `integration` belum ada di repo. Ia dibuat `tg-devops`, seat yang baru ada setelah
   T-002 (Deviasi 2); `git branch -a` hanya menampilkan `master`.
2. CI belum ada. §16.7 menuntut "CI penuh" di akhir alur; pipeline itu deliverable T-008
   (`depends_on: [T-001]`), sehingga sebelum T-008 tidak ada CI yang bisa dijalankan.
3. §16.7 mengandaikan subagent dengan worktree sendiri untuk menghasilkan `agent/<owner>/<id>`.
   Hal itu **dibantah di lingkungan ini** (Deviasi 4: semua subagent menulis ke working tree yang
   sama dan Orchestrator memegang semua commit), sehingga pola branch-per-subagent tidak punya
   subjek di P0.

Karena T-008 sendiri adalah tugas P0, syarat §16.5/§16.7 tidak dapat dipenuhi oleh commit P0
mana pun tanpa sirkularitas.

Bukti repo:

- `docs/board/tasks/T-002.yml` — `branch: master` dan blok `deviation.branch` ("Tugas ini
  dikerjakan langsung oleh Orchestrator ... sehingga dikerjakan di master. Jalur merge ke branch
  integration + CI penuh milik tg-devops dan belum ada di repo awal").
- `docs/board/tasks/T-001.yml` — `branch: agent/tg-devops/T-001` (task card sudah benar menurut
  §16.5), tetapi commit-nya mendarat di `master` karena alasan (1)-(3); kartu T-003 dan T-009
  berpola sama.
- `docs/board/tasks/T-008.yml` — `epic: P0`, `phase: P0`, `owner: tg-devops`,
  `depends_on: [T-001]`; ini yang memasang CI.
- Riwayat git `master`: `git branch -a` hanya menampilkan `master` — tidak ada `integration`.
- `docs/board/STATUS.md` — rencana gelombang W0 mencantumkan T-002 sebagai tugas W0 Orchestrator.

Commit P0 yang dicakup deviasi ini (urutan kronologis, per `git log`; sinkron terakhir di `0fd4f1dc`):

| commit | ringkasan |
|---|---|
| `493ddba` | chore(bootstrap): governance, agent roster, and board (T-002) |
| `41292fc` | chore(board): complete P0 task cards, ownership fixes, board (T-002) |
| `f29df88` | feat(scaffold): monorepo apps/{api,web,pos} + packages/* + Docker dev stack (T-001) |
| `e3241f59` | docs(requirements): pilot interview + validation kit (T-009) |
| `2bc073a` | feat(scaffold): Laravel 12 application core, lockfiles, framework config (T-001) |
| `7d96f744` | docs(requirements): FR/AC rework round 1 — coverage + measurable ACs (T-003) |
| `05964961` | docs(adr): ADR-007 governance deviations + ownership map completion (T-002) |
| `dc589982` | fix(scaffold): T-001 rework round 1 — G2 phpstan, secret hygiene, hardening |
| `9124765b` | chore(board): status sync, archived task reports, ownership nits (T-002 rework r2) |
| `0fd4f1dc` | docs(adr): amend ADR-007 deviasi 3 to cover all of P0 until T-008 adds CI |

**Keputusan**

Seluruh commit phase P0 langsung ke `master`; jawaban atas §16.5/§16.7 ditunda ke akhir P0.
Jalur `agent/<owner>/<id>` → `integration` + CI penuh adalah deliverable `tg-devops` (sesuai
§16.3 "merge ke `integration`") dan T-008 yang memasang CI. Karena itu DoD §18.2 ("merge ke
`integration` dengan CI penuh hijau") **belum berlaku** untuk seluruh phase P0.

**Alternatif yang ditolak**

1. Membuat branch `integration` dan `agent/orchestrator/...` sendiri dari Orchestrator. Ditolak:
   menciptakan alur merge tanpa CI dan tanpa owner rilis; `tg-devops` pemilik jalur itu menurut
   §16.3/§16.7.
2. Menunggu `integration` ada sebelum bootstrap apa pun. Ditolak: `integration` dibuat oleh
   `tg-devops`, yang seatnya sendiri adalah keluaran T-002 (sirkular dengan Deviasi 2).
3. Membuka cabang `agent/...` per tugas T-001 meski tanpa CI/integration. Ditolak: tidak ada
   tujuan merge; §16.7 mensyaratkan `integration` sebagai target dan CI sebagai gerbang, keduanya
   absen.
4. Menyatakan deviasi ini berakhir setelah commit bootstrap pertama dan menandai T-001 sebagai
   pelanggaran. Ditolak: T-001 berjalan di dalam P0 dengan kondisi (1)-(3) yang sama; menandainya
   pelanggaran akan menghukum pekerjaan yang tidak memiliki jalur sah — persis yang harus dicegah
   ADR ini.

**Konsekuensi**

- `master` memuat seluruh commit P0 tanpa jalur merge §16.7; ini tercatat, bukan pelanggaran diam.
- **Pemicu berakhirnya deviasi:** T-008 mendaratkan CI dan `tg-devops` membuat branch
  `integration`. Setelah itu ADR ini tidak lagi mengecualikan apa pun.
- **Tindak lanjut wajib:** sejak tugas P1 pertama, pekerjaan mengikuti §16.5/§16.7
  (`agent/<owner>/<id>` → `integration` → CI penuh) dan DoD §18.2 berlaku penuh.
- Setiap tugas P1+ yang di-commit ke `master` adalah pelanggaran, bukan kelanjutan deviasi ini.
- Deviasi 4 adalah dasar atas butir (3): pola `agent/<owner>/<id>` per subagent tidak punya
  subjek tanpa worktree terisolasi; bila isolasi worktree kelak tersedia, pola itu menjadi mungkin
  dan ADR ini ditinjau ulang.

---

## Deviasi 4 — Subagent tidak terisolasi worktree; mereka menulis ke working tree yang sama

**Konteks**

PRD §16.1 menyatakan `task` "memecah pekerjaan ke subagent paralel di **worktree terisolasi**",
dan §16.15 memakai asumsi itu sebagai penangkal untuk risiko "Dua agent menyentuh file sama"
("Worktree terisolasi + OWNERS.md + Orchestrator hanya paralelkan path berbeda"). Uji lingkungan
terverifikasi menunjukkan **isolasi itu tidak berlaku di sini**.

Bukti repo:

- `docs/board/STATUS.md` — tabel "Fakta lingkungan terverifikasi", baris **Isolasi filesystem
  subagent**: "**tidak terisolasi** — uji: agent `sonic` (job `FsProbe`) diminta menulis
  `docs/board/_fsprobe.txt`; file muncul di working tree utama, `find / -name _fsprobe.txt`
  menghasilkan satu lokasi, dan `git worktree list` hanya menampilkan `master`. Catatan: ini
  bertentangan dengan teks PRD §16.1/§16.15 ... perlu diamandemen `tg-analyst`/ADR."
- `docs/board/STATUS.md` — log keputusan **O-4**: "Subagent berbagi working tree → Orchestrator
  hanya memparalelkan tugas dengan path berbeda, dan melakukan commit".

**Keputusan**

Model kerja repo ini: **semua subagent menulis ke working tree yang sama**. Konsekuensi
operasional yang mengikat:

1. Orchestrator hanya mem-fan-out tugas dengan **path yang disjoint** (aturan gelombang di
   `STATUS.md` + peta `OWNERS.md`); tidak ada dua tugas paralel yang boleh menyentuh file sama.
2. **Orchestrator memegang semua commit**. Subagent tidak boleh commit; mereka menghasilkan
   perubahan + BuildReport (`docs/board/YIELD.md`).

**Alternatif yang ditolak**

1. Mengandalkan §16.1/§16.15 apa adanya (worktree terisolasi) dan memparalelkan tugas yang
   pathnya beririsan. Ditolak: dibantah uji `FsProbe` — dua agent akan saling menimpa di satu tree.
2. Melarang semua pekerjaan paralel dan menjalankan subagent satu per satu. Ditolak: tidak perlu;
   fan-out pada path disjoint tetap aman dan tetap sesuai §16.15 ("Orchestrator hanya paralelkan
   path berbeda") — yang hilang hanyalah separuh penangkalnya (worktree).
3. Membuat worktree nyata per subagent di bootstrap. Ditolak pada tahap ini: bukan bagian T-002,
   butuh pekerjaan infra/CI, dan layak dievaluasi ulang sebagai ADR tersendiri bila isolasi
   diaktifkan OMP di kemudian hari.

**Konsekuensi**

- Pemeriksaan §18.1 "Kepemilikan path — setiap commit hanya menyentuh path milik agent
  pembuatnya (atau co-owner di task card)" bergantung pada commit Orchestrator + peta `OWNERS.md`,
  bukan pada isolasi worktree: satu commit = satu pemilik path.
- Pelanggaran aturan fan-out path-disjoint berakibat konflik sunyi antar-agent di satu tree;
  Orchestrator menanggung kontrol ini.
- Bila OMP kelak menyediakan isolasi worktree terverifikasi, ADR ini diganti (superseded) dan
  §16.1/§16.15 kembali berlaku penuh.
- Deviasi ini adalah dasar atas Deviasi 3 butir (3): pola `agent/<owner>/<id>` → `integration`
  (§16.5/§16.7) tidak dapat dijalankan selama subagent tidak punya worktree sendiri.

---

## Klarifikasi §16.4 — `docs/board/**` superset `docs/board/audit/**`

PRD §16.4 memetakan `docs/board/**` → `orchestrator` dan, pada baris berikutnya,
`docs/board/audit/**` → `tg-auditor`. `docs/board/**` adalah **superset** dari
`docs/board/audit/**`, sehingga kedua baris §16.4 saling tumpang tindih dan aturan "satu owner
per path" (§16.2 butir 2) menjadi ambigu bila dibaca harfiah.

Resolusi (sudah berlaku di `OWNERS.md`): entri orchestrator dibaca sebagai
`docs/board/** (kecuali audit/**)` → `orchestrator`, dan `docs/board/audit/**` → `tg-auditor`.
Presedensi: entri yang lebih spesifik menang. Ini pula yang membuat §16.3 ("`docs/board/**` saja"
untuk Orchestrator) tidak memberi Orchestrator hak tulis atas papan audit `tg-auditor`, dan
sejalan dengan §16.3 pada baris `tg-auditor` yang melarang "Edit src dan papan status" namun
memberi `docs/board/audit/**`.

Bukti repo: `OWNERS.md` baris `docs/board/**  (kecuali audit/**)   orchestrator` dan
`docs/board/audit/**   tg-auditor`.

---

## Rujukan

- `docs/prd/PRD.md` §16.1, §16.2, §16.3, §16.4, §16.5, §16.7, §16.15, §17, §18.1, §18.2
- `docs/board/STATUS.md` — log keputusan O-1, O-2, O-4; tabel "Fakta lingkungan terverifikasi"
  (baris isolasi filesystem subagent); tabel gelombang P0
- `docs/board/tasks/T-002.yml` — blok `deviation:`, `depends_on`, `branch`, `notes`
- `docs/board/tasks/T-001.yml`, `T-003.yml`, `T-008.yml`, `T-009.yml` — `phase: P0`, `branch`,
  `depends_on` (commit P0 yang dicakup Deviasi 3 dan pemicu CI di T-008)
- `docs/board/YIELD.md` — skema BuildReport/ReviewReport/VerifyReport/ReworkBundle (§16.6)
- `OWNERS.md` — peta path, blok "Path infra yang tidak terdaftar di PRD §16.4"
- `AGENTS.md` — aturan operasional semua agent (§16.11)
