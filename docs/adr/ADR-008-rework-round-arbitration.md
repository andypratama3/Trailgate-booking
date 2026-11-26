> **Status:** accepted · **Tanggal:** 2026-11-26 · **Owner:** tg-architect
> **Amandemen atas:** PRD §16.2 butir 7 (batas putaran rework) · **Rujukan:** `AGENTS.md` ("Loop kerja per tugas"), temuan audit P0 **A-1** (`docs/board/audit/2026-11-26-P0-traceability.md` §6), `docs/board/STATUS.md` log keputusan **O-15**, `docs/board/tasks/T-008.yml`, `docs/board/reports/T-008.md`
> **Dasar:** tindak lanjut audit P0 temuan **A-1 (P2)** — penutupan wajib terdokumentasi di ADR, bukan hanya di STATUS

# ADR-008 — Arbitrasi putaran rework >2 (§16.2 butir 7)

## Konteks

PRD §16.2 butir 7: "Maksimal 2 putaran rework per tugas; putaran ke-3 → arbitrasi `tg-architect`
→ keputusan Andy (dicatat sebagai ADR)." `AGENTS.md` mengulang aturan itu pada bagian
"Loop kerja per tugas": "Maksimal 2 putaran rework; putaran ke-3 → arbitrasi `tg-architect`".

Aturan itu tidak menjelaskan dua hal: (a) bagaimana putaran >2 dijalankan bila temuannya bersifat
mekanis/dokumentasi dan **tidak ada** sengketa yang perlu diputus; (b) siapa yang wajib mencatat
keputusan bila arbiter bukan `tg-architect`. Kekosongan ini muncul nyata pada T-008.

## Kejadian — T-008 r3

T-008 (`phase: P0`, `owner: tg-devops`) menjalani `rework_round: 3`, melampaui batas 2. Temuan r3
(`reports/T-008.md` §Rework r3):

1. **F-SEC-11** — preamble `ci.yml` terduplikasi: `name`/`on`/`env` muncul dua kali
   (`ci.yml:13/14/19` vs `24/26/32`). `yaml.safe_load` longgar sehingga lolos dan r2 melaporkan
   "parse OK"; loader YAML ketat gagal `duplicate key 'name'`.
2. **F-SEC-12** — `${{ env.* }}` dipakai di `services.ports`/`jobs.<job_id>.env` → actionlint/GitHub
   menolak workflow.
3. **Tiga cacat dokumen/assert** — `F-5`, `F-7b`, `F-6b` (assert `total`/`rows`).

Seluruh temuan bersifat **mekanis/dokumentasi**: tidak ada artefak desain baru, tidak ada perubahan
lingkup pada jeda r3, dan semua temuan berasal dari artefak yang sudah dinilai r2. Tidak ada
perbedaan pendapat antar-agent yang perlu diputus.

## Keputusan

1. **R3 T-008 sah dijalankan.** Temuan bersifat mekanis/dokumentasi, bukan sengketa desain; tidak
   ada mediator yang dibutuhkan. Arbitrasi dilakukan **Orchestrator** dan dicatat sebagai **O-15**
   di `docs/board/STATUS.md`.
2. **Keputusan yang mengikat ke depan:**
   - **(i)** Bila putaran ke-3 (dan seterusnya) **hanya** berisi cacat mekanis/dokumen tanpa sengketa
     desain/kontrak, **Orchestrator boleh mengarbitrasi** — dan **wajib mencatat** hasilnya di ADR
     (entri ini atau entri baru) **dan** di `docs/board/STATUS.md`.
   - **(ii)** Bila ada **sengketa desain/kontrak** (perbedaan pendapat antar-agent yang perlu diputus,
     atau perubahan batas modul/kontrak OpenAPI), arbitrasi **WAJIB `tg-architect`** sesuai §16.2
     butir 7; Orchestrator **tidak boleh** menggantikannya.
   - **(iii)** Setiap kartu dengan `rework_round > 2` **wajib** punya entri ADR (baru atau amandemen)
     yang menunjuk id kartu + nomor putaran, **sebelum** status kartu boleh `done`.
3. Jalur yang berlaku ditentukan oleh **sifat temuan** (mekanis vs desain), bukan oleh seat yang
   kebetulan tersedia. Bila temuan r3 tercampur, jalur **(ii)** yang berlaku.

## Alternatif yang ditolak

1. **Selalu arbitrasi `tg-architect` untuk putaran >2 (tafsir literal §16.2).** Ditolak: memindahkan
   cacat mekanis (kunci YAML ganda, syntax `env`) ke seat `slow` yang misinya ADR/kontrak hanya
   menambah siklus tanpa nilai keputusan; §16.2 butir 7 menyasar *arbitrase* = pemutus sengketa, dan
   di sini tidak ada sengketa.
2. **Mengabaikan/menaikkan batas 2 putaran secara diam.** Ditolak: auditor P0 menghitungnya (`A-1`,
   P2); menyembunyikan putaran >2 lebih buruk daripada mencatatnya.
3. **Amandemen ADR-007 alih-alih ADR baru.** Ditolak: ADR-007 berjudul dan berkonteks "deviasi
   operating model saat **bootstrap P0**" dengan pemicu berakhir (T-008 menambah CI) — cakupan
   sementara. Keputusan ini berlaku **lintas phase** dan menciptakan kewajiban baru (entri ADR wajib
   per putaran >2). Aturan `README.md` path ini: keputusan baru → ADR baru; amandemen hanya untuk
   pembaruan versi pada ADR yang sama. ADR-008 menaut ADR-007 sebagai rujukan, bukan menyuntingnya.
4. **Mencatat hanya di STATUS (tanpa ADR).** Ditolak: itulah keadaan yang memicu `A-1`; STATUS adalah
   log, bukan tempat keputusan yang mengikat ke depan.

## Konsekuensi

- Batas **2 putaran tetap**; putaran ke-3 tetap pengecualian, bukan kebiasaan. Tiap pengecualian
  berbiaya satu entri ADR.
- **Deteksi auditor** (§18.1): untuk setiap kartu dengan `rework_round > 2`, periksa keberadaan entri
  ADR yang menunjuk id kartu + putaran tersebut. Kartu `done` tanpa entri ADR = temuan.
- Sifat temuan (mekanis vs desain) ditentukan reviewer/verifier dan dicatat di ReworkBundle; inilah
  bukti yang dipakai memilih butir **(i)** atau **(ii)**.
- `tg-architect` tetap pemilik path `docs/adr/**`. Putaran >2 pada kartu gate (mis. T-013/T-015,
  `AGENTS.md` butir 12) tetap tunduk pada butir (i)/(ii).

## Pemetaan keputusan inti PRD §0

| Keputusan | Relasi |
|---|---|
| — | ADR ini mengatur proses §16.2 butir 7 (arbitrasi putaran rework); tidak memetakan keputusan inti §0 (D1/D4/D5/D7), tetapi menegaskan batas rework tetap berlaku bagi semua pekerjaan. |

## Status

**accepted** — berlaku sejak 2026-11-26, lintas phase (P0..Pn). Amandemen bila: (a) PRD §16.2 diubah;
(b) aturan deteksi auditor §18.1 berubah. Perubahan keputusan (mis. menaikkan batas putaran atau
memindahkan arbitrasi mekanis ke seat lain) memerlukan ADR baru yang menggantikan.
