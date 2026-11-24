# Traceability — FR → prd_ref

Sumber kebenaran: `docs/prd/PRD.md` v1.0 (24 November 2026). Tabel ini memetakan setiap FR ke
bagian PRD tempat ia didefinisikan (kolom wajib `prd_ref`) beserta bagian PRD pendukung yang
dipakai sebagai dasar acceptance criteria di `FR.md`.

- Kolom **`prd_ref`** = definisi kebutuhan, selalu §5 (tabel Kebutuhan Fungsional).
- Kolom **Bagian pendukung** = bagian lain PRD yang menjadi dasar AC — bukan sumber kebutuhan
  baru.
- Kolom **Tugas §17** = pemetaan FR → backlog tugas, dipakai `tg-auditor` untuk cek
  §18.1 "FR → Tugas" (setiap FR fase aktif muncul di ≥ 1 tugas).
- Tidak ada FR di luar FR-01..FR-41; tidak ada baris tanpa `prd_ref`.

| FR | prd_ref | Bagian pendukung | MoSCoW | Fase | Tugas §17 |
|---|---|---|---|---|---|
| FR-01 | §5 FR-01 | §0 D1; §13; §16.4 | M | P1 | T-101, T-102, T-103, T-191 |
| FR-02 | §5 FR-02 | §4.2; §9.4A; §17 T-007/T-104/T-012 | M | P1 | T-007, T-104, T-012 |
| FR-03 | §5 FR-03 | §10.1; §11 | M | P1 | T-111, T-113, T-117 |
| FR-04 | §5 FR-04 | §9.4C | M (peta) / S (elevasi) | P1 | T-112, T-113 |
| FR-05 | §5 FR-05 | §2.3; §6.2; §8; §10.3 | M | P1 | T-121, T-126, T-182 |
| FR-06 | §5 FR-06 | §6.4; §7.1; §10.3 | M | P1 | T-121, T-122, T-126, T-145 |
| FR-07 | §5 FR-07 | §0 D5; §6.4; §7.3; §9.4B | M | P1 | T-123, T-124, T-125, T-126, T-174, T-210 |
| FR-08 | §5 FR-08 | §0 D6; §6.1–§6.3 | M | P1 | T-131, T-132, T-133 |
| FR-09 | §5 FR-09 | §7.2; §11; §17 T-007 | M | P1 | T-007, T-141, T-142 |
| FR-10 | §5 FR-10 | §11; §12; §13 | M | P1 | T-143 |
| FR-11 | §5 FR-11 | §10.2 | M | P1 | T-144 |
| FR-12 | §5 FR-12 | §17 T-207 | S | P2 | T-207 |
| FR-13 | §5 FR-13 | §0 D4; §12; §13; §18.3 | M | P1 | T-151, T-152, T-153 |
| FR-14 | §5 FR-14 | §6.4; §10.2 | M | P1 | T-124, T-146, T-154 |
| FR-15 | §5 FR-15 | §10.4; §13; §17 T-007 | M | P1 | T-007, T-161 |
| FR-16 | §5 FR-16 | §0 D7; §8; §10.2; §18.3; §17 T-007 | M | P1 | T-007, T-162, T-163 |
| FR-17 | §5 FR-17 | §7.1; §9.4B; §14; §17 T-162/T-210 | M (manifest) / S (overdue) | P1/P2 | T-162, T-164, T-202, T-210 |
| FR-18 | §5 FR-18 | §8; §12 | M | P1 | T-171, T-172, T-173, T-174 |
| FR-19 | §5 FR-19 | §7.3; §9.4B | M | P1 | T-125, T-181, T-182, T-183 |
| FR-20 | §5 FR-20 | §9.4B; §10.2 | M | P1 | T-184 |
| FR-21 | §5 FR-21 | §2.2; §12 | S | P2 | T-201 |
| FR-22 | §5 FR-22 | §17 T-202/T-203/T-210 | S | P2 | T-202, T-203, T-210 |
| FR-23 | §5 FR-23 | §7.2 | S | P2 | T-204 |
| FR-24 | §5 FR-24 | §10.1 | S | P2 | T-205 |
| FR-25 | §5 FR-25 | §2.1; §6.2 | S | P2 | T-206 |
| FR-26 | §5 FR-26 | §8; §10.2 | M (ID) / S (EN) | P1/P2 | T-142, T-194, T-208 |
| FR-27 | §5 FR-27 | §8; §11; §13 | M | P1 | T-122, T-147, T-193 |
| FR-28 | §5 FR-28 | §4.2; §14 | M | P3 | T-301 |
| FR-29 | §5 FR-29 | §4.2 | S | P3 | T-302 |
| FR-30 | §5 FR-30 | §4.1; §14 | C | P3 | T-304 |
| FR-31 | §5 FR-31 | §12 | C | P3 | T-305 |
| FR-32 | §5 FR-32 | §11 | S | P3 | T-303 |
| FR-33 | §5 FR-33 | §0 D1; §4.2; §15 | M | P3 | T-307 |
| FR-34 | §5 FR-34 | §17 T-306 | C | P3 | T-306 |
| FR-35 | §5 FR-35 | §0 D2; §4.1; §4.3; §7.4 | M | P1 | T-009, T-103, T-115 |
| FR-36 | §5 FR-36 | §8; §10.2; §13 | M | P1 | T-143, T-192 |
| FR-37 | §5 FR-37 | §0 D9; §6.1 | M | P1 | T-004, T-114, T-132 |
| FR-38 | §5 FR-38 | §10.2 | S | P2 | T-209 |
| FR-39 | §5 FR-39 | §9.4A | M | P1 | T-010, T-011, T-012 |
| FR-40 | §5 FR-40 | §9.4B | M | P1 | T-185, T-186, T-187, T-188 |
| FR-41 | §5 FR-41 | §9.4C | M | P1 | T-116, T-117 |

**Total: 41 FR, 41 baris, 0 FR tanpa `prd_ref`.**

## Tugas tanpa FR tunggal (rujukan auditor §18.1)

Tugas berikut memang tidak menempel pada satu FR di kolom FR §17 dan karena itu tidak
menciptakan FR baru:

| Tugas | FR | Catatan |
|---|---|---|
| T-003 | semua | Dekomposisi PRD → FR/AC/user story (dokumen ini). |
| T-006 | semua | OpenAPI v1 skeleton — kontrak lintas FR. |
| T-199 | semua P1 | Rilis MVP — gate G5. |
| T-001, T-002, T-008, T-005, T-195, T-198, T-308 | — | Fondasi/infra/dokumen tanpa FR di PRD §17. |

## Label yang harus dipertahankan (rujukan cepat)

Dipakai verbatim di `FR.md`, tidak boleh diubah menjadi fakta:

- **[ASUMSI]** — §0 D3; §6.4 "satu kali gratis"; §8 "300 permintaan booking/detik";
  §14 harga lisensi template; §15 estimasi roadmap.
- **[VERIFIKASI]** — §0 D4 (konsultan hukum); §2.1 status terkini TNGGP/Semeru;
  §2.2 API status gunung api; §4.3 integrasi langsung sistem resmi; §6.3 rasio SOP Rinjani;
  §8 UU PDP dan lokasi data; §9.2 kebijakan tile OSM dan kompatibilitas Serwist;
  §9.4 nama field frontmatter agent; §14 mekanisme fee.
- **[REKOMENDASI]** — §9.4A keputusan membangun Tailwind/design system dari nol.
- **[FAKTA]** — §2.1–§2.2 klaim bersumber (dipakai sebagai konteks aturan, bukan klaim baru).
