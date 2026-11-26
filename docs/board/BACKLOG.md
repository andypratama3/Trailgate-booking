# BACKLOG — TrailGate

Indeks tugas & status. **Detail tiap tugas ada di task card** `docs/board/tasks/T-xxx.yml`.
Sumber teks tugas: `docs/prd/PRD.md` §17. Kolom `Status` hanya diubah Orchestrator.

Status: `todo` · `in_progress` · `in_review` · `changes_requested` · `approved` · `verifying` · `integrated` · `done` · `blocked`
Ukuran: S ≤ 0,5 hari · M ≈ 1–2 hari · L ≈ 3–5 hari (kerja agent + review).
`auditor` memeriksa seluruh tugas (tidak diulang tiap baris).

## P0 — Discovery & Fondasi

| ID | Tugas | FR | Owner | R1 | R2 | V | Dep | Uk | Status |
|---|---|---|---|---|---|---|---|---|---|
| T-001 | Scaffold monorepo (api/web/pos/contracts), Docker compose dev, AGENTS.md, OWNERS.md | — | tg-devops | tg-architect | tg-security | tg-qa | — | M | done |
| T-002 | Roster agent `.omp/agents`, papan `docs/board`, skema yield, konfigurasi model | — | Orchestrator | tg-architect | tg-reviewer | tg-auditor | T-001 *(dibalik — lihat `deviation` di T-002.yml)* | M | done |
| T-003 | Pecah PRD jadi FR-ID + AC terukur + user story | semua | tg-analyst | tg-architect | tg-domain | tg-auditor | — | M | done |
| T-004 | Skema Mountain Pack + validator sumber + 4 pack referensi demo (Gede-Pangrango, Rinjani, Semeru, Arjuno-Welirang) berlabel DEMO | FR-37 | tg-domain | tg-analyst | tg-architect | tg-auditor | T-003 | L | done |
| T-005 | ADR: tenancy, BYO Midtrans, kuota, offline POS, enkripsi field, versi paket | — | tg-architect | tg-security | tg-data | tg-auditor | T-003 | M | done |
| T-006 | OpenAPI v1 skeleton + generator tipe TS + tes kontrak | semua | tg-architect | tg-backend | tg-web | tg-qa | T-005 | L | done |
| T-007 | Token desain, wireframe alur booking, status jalur, closure desk, POS | FR-02,09,15,16 | tg-ux | tg-web | tg-analyst | tg-qa | T-003 | L | done |
| T-008 | CI: pint, phpstan, tes, tsc, lint, Playwright smoke, `composer/npm audit`, secret scan, `security_scan` | — | tg-devops | tg-security | tg-reviewer | tg-qa | T-001 | M | done |
| T-009 | Skrip wawancara + lembar validasi pilot (5 basecamp, 3 TO) | FR-35 | tg-analyst | tg-domain | Andy | tg-auditor | — | S | in_review |
| T-010 | Setup Tailwind v4 CSS-first + pipeline token + budget ukuran CSS di CI | FR-39 | tg-ux (token) + tg-devops (pipeline) | tg-web | tg-reviewer | tg-qa | T-001 | M | done |
| T-011 | `packages/ui` milik sendiri: komponen dasar + katalog + axe + state loading/empty/error | FR-39 | tg-ux | tg-web | tg-console | tg-qa | T-010 | L | done |
| T-012 | Tema tenant runtime + validator kontras WCAG AA + mode gelap | FR-39,02 | tg-web | tg-ux | tg-security | tg-qa | T-011 | M | done |
| T-013 | Gate paket CLI `@alibaba-group/open-code-review` (ocr) untuk seat tg-ocr (AGENTS.md #10) | — | tg-security | tg-architect | tg-devops | tg-auditor | — | S | done |
| T-014 | Manifest PWA POS — hilangkan hex hardcode atau pengecualian terdokumentasi | FR-39,16 | tg-console | tg-web | tg-reviewer | tg-qa | T-010 | S | done |
| T-015 | Gate paket — tooling aksesibilitas axe untuk T-011 (katalog komponen) | FR-39 | tg-security | tg-architect | tg-web | tg-auditor | T-011 | S | done |
| T-016 | Wiring audit axe katalog ke CI (job e2e) + target Makefile | FR-39 | tg-devops | tg-reviewer | tg-ux | tg-qa | T-008,T-011 | S | done |

## P1 — MVP

### E1 Tenancy & Auth

| ID | Tugas | FR | Owner | R1 | R2 | V | Dep | Uk | Status |
|---|---|---|---|---|---|---|---|---|---|
| T-101 | Model tenant + global scope + tes isolasi otomatis | FR-01 | tg-backend | tg-security | tg-reviewer | tg-qa | T-006 | L | todo |
| T-102 | Auth Sanctum + RBAC ter-scope tenant + MFA admin | FR-01 | tg-backend | tg-security | tg-reviewer | tg-qa | T-101 | M | todo |
| T-103 | Onboarding tenant (wizard) + tipe tenant | FR-01,35 | tg-console | tg-ux | tg-reviewer | tg-qa | T-102 | M | todo |
| T-104 | Branding tenant + subdomain | FR-02 | tg-web | tg-ux | tg-reviewer | tg-qa | T-103 | M | todo |

### E2 Katalog

| ID | Tugas | FR | Owner | R1 | R2 | V | Dep | Uk | Status |
|---|---|---|---|---|---|---|---|---|---|
| T-111 | Skema + CRUD gunung/jalur/gate/pos/camp | FR-03 | tg-data (skema) → tg-backend (CRUD) | tg-architect | tg-reviewer | tg-qa | T-101 | L | todo |
| T-112 | Unggah + validasi GeoJSON, profil elevasi | FR-04 | tg-backend | tg-reviewer | tg-data | tg-qa | T-111 | M | todo |
| T-113 | Halaman katalog + peta MapLibre (SSR/SEO) | FR-03,04 | tg-web | tg-ux | tg-reviewer | tg-qa | T-111 | L | todo |
| T-114 | Import Mountain Pack ke tenant demo + badge "perlu verifikasi" | FR-37 | tg-backend | tg-domain | tg-reviewer | tg-auditor | T-004,T-111 | M | todo |
| T-115 | **Official Link Mode**: halaman status + deep-link + langganan alert | FR-35 | tg-web | tg-domain | tg-ux | tg-qa | T-113 | M | todo |
| T-116 | Landing pemasaran TrailGate: struktur §9.4C, copy bersumber, hero status/kuota DEMO, SEO, tracking | FR-41 | tg-web | tg-ux | tg-analyst | tg-qa (Lighthouse di CI) | T-011 | L | todo |
| T-117 | Landing tenant berbasis blok + halaman jalur per gunung dari Mountain Pack | FR-41,03 | tg-web | tg-ux | tg-reviewer | tg-qa | T-116,T-114 | L | todo |

### E3 Kuota & Closure

| ID | Tugas | FR | Owner | R1 | R2 | V | Dep | Uk | Status |
|---|---|---|---|---|---|---|---|---|---|
| T-121 | Skema `quota_slots` + service `ReserveSlot` atomik | FR-05,06 | tg-data + tg-backend | tg-architect | tg-reviewer | tg-qa | T-101 | L | todo |
| T-122 | Hold TTL + job pelepas + idempotensi | FR-06,27 | tg-backend | tg-reviewer | tg-data | tg-qa | T-121 | M | todo |
| T-123 | Closure (`block_new_bookings`/`cancel_existing`) + `effective_capacity` | FR-07 | tg-backend | tg-reviewer | tg-domain | tg-qa | T-121 | L | todo |
| T-124 | Disruption Case: daftar terdampak, tautan pilihan, eksekusi reschedule/refund | FR-07,14 | tg-backend | tg-reviewer | tg-analyst | tg-qa | T-123,T-154 | L | todo |
| T-125 | Konsol Closure Desk | FR-07,19 | tg-console | tg-ux | tg-domain | tg-qa | T-123 | M | todo |
| T-126 | Suite konkurensi (500 paralel/kapasitas 10, closure saat bayar, hold kedaluwarsa) | FR-05,06,07 | tg-qa | tg-reviewer | tg-backend | tg-auditor | T-122,T-123 | M | todo |

### E4 Rule Engine

| ID | Tugas | FR | Owner | R1 | R2 | V | Dep | Uk | Status |
|---|---|---|---|---|---|---|---|---|---|
| T-131 | Skema `requirement_rules` + evaluator tipe aturan §6.2 + pesan ID/EN | FR-08 | tg-backend | tg-domain | tg-reviewer | tg-qa | T-111 | L | todo |
| T-132 | UI kelola aturan + tanggal verifikasi + peringatan kedaluwarsa | FR-08,37 | tg-console | tg-ux | tg-domain | tg-qa | T-131 | M | todo |
| T-133 | Tes tabel-keputusan aturan dari pack referensi | FR-08 | tg-qa | tg-domain | tg-reviewer | tg-auditor | T-131,T-004 | M | todo |

### E5 Booking

| ID | Tugas | FR | Owner | R1 | R2 | V | Dep | Uk | Status |
|---|---|---|---|---|---|---|---|---|---|
| T-141 | API booking: hold, ketua+anggota, kontak darurat, link anggota | FR-09 | tg-backend | tg-reviewer | tg-architect | tg-qa | T-122,T-131 | L | todo |
| T-142 | Wizard booking (mobile-first, simpan progres) | FR-09,26 | tg-web | tg-ux | tg-reviewer | tg-qa | T-141,T-007 | L | todo |
| T-143 | Unggah dokumen privat + signed URL + pemindaian tipe/ukuran | FR-10,36 | tg-integrations | tg-security | tg-reviewer | tg-qa | T-141 | M | todo |
| T-144 | Pricing engine (WNI/WNA, weekday/libur, promo) + uang integer | FR-11 | tg-backend | tg-reviewer | tg-analyst | tg-qa | T-111 | M | todo |
| T-145 | State machine booking + job kedaluwarsa | FR-06 | tg-backend | tg-reviewer | tg-architect | tg-qa | T-141 | M | todo |
| T-146 | Kelola booking mandiri (reschedule/batal sesuai policy) | FR-14 | tg-backend | tg-reviewer | tg-analyst | tg-qa | T-145 | M | todo |
| T-147 | Perlindungan lonjakan: rate limit, antrean, batas booking per identitas | FR-27 | tg-backend + tg-devops | tg-security | tg-reviewer | tg-qa | T-122 | L | todo |

### E6 Pembayaran

| ID | Tugas | FR | Owner | R1 | R2 | V | Dep | Uk | Status |
|---|---|---|---|---|---|---|---|---|---|
| T-151 | Midtrans Snap (BYO merchant): kunci terenkripsi, buat transaksi | FR-13 | tg-integrations | tg-security | tg-reviewer | tg-qa | T-145 | M | todo |
| T-152 | Webhook: signature, idempoten, cek status, tes duplikat/out-of-order | FR-13 | tg-integrations | tg-security | tg-reviewer | tg-qa | T-151 | L | todo |
| T-153 | Rekonsiliasi harian + alert selisih | FR-13 | tg-integrations | tg-reviewer | tg-backend | tg-qa | T-152 | M | todo |
| T-154 | Policy engine refund/reschedule + ledger append-only | FR-14 | tg-backend | tg-reviewer | tg-security | tg-qa | T-152 | L | todo |

### E7 E-tiket & POS

| ID | Tugas | FR | Owner | R1 | R2 | V | Dep | Uk | Status |
|---|---|---|---|---|---|---|---|---|---|
| T-161 | Token QR bertanda tangan + PDF tiket + revoke list | FR-15 | tg-backend | tg-security | tg-reviewer | tg-qa | T-152 | M | todo |
| T-162 | PWA POS: scan, check-in/out, daftar manifest | FR-16,17 | tg-console | tg-ux | tg-reviewer | tg-qa | T-161 | L | todo |
| T-163 | Offline: antrean IndexedDB, sinkron batch `client_event_id`, konflik | FR-16 | tg-console + tg-backend (endpoint) | tg-reviewer | tg-architect | tg-qa | T-162 | L | todo |
| T-164 | Manifest + headcount real-time | FR-17 | tg-backend | tg-reviewer | tg-data | tg-qa | T-163 | M | todo |

### E8 Notifikasi

| ID | Tugas | FR | Owner | R1 | R2 | V | Dep | Uk | Status |
|---|---|---|---|---|---|---|---|---|---|
| T-171 | Layanan notifikasi + template + preferensi + opt-in | FR-18 | tg-backend | tg-reviewer | tg-security | tg-qa | T-145 | M | todo |
| T-172 | WhatsApp Cloud API (template terdaftar, retry, status) | FR-18 | tg-integrations | tg-security | tg-reviewer | tg-qa | T-171 | M | todo |
| T-173 | Email (tiket, pengingat H-1) | FR-18 | tg-integrations | tg-reviewer | tg-ux | tg-qa | T-171 | S | todo |
| T-174 | Broadcast closure ke terdampak + pelanggan alert | FR-07,18 | tg-backend | tg-reviewer | tg-analyst | tg-qa | T-123,T-172 | M | todo |

### E9 Konsol Admin

| ID | Tugas | FR | Owner | R1 | R2 | V | Dep | Uk | Status |
|---|---|---|---|---|---|---|---|---|---|
| T-181 | Dashboard (okupansi, pendapatan, kasus terbuka) | FR-19 | tg-console | tg-ux | tg-reviewer | tg-qa | T-145 | M | todo |
| T-182 | Kelola kuota/kalender/booking/pencarian | FR-05,19 | tg-console | tg-ux | tg-reviewer | tg-qa | T-121 | L | todo |
| T-183 | Laporan Excel/PDF (harian, per jalur, rekonsiliasi) | FR-19 | tg-backend | tg-reviewer | tg-analyst | tg-qa | T-154 | M | todo |
| T-184 | Audit log + penampil | FR-20 | tg-backend (log) + tg-console (UI) | tg-security | tg-reviewer | tg-qa | T-102 | M | todo |
| T-185 | Shell dashboard: sidebar/topbar, nav RBAC, command palette, notifikasi | FR-40 | tg-console | tg-ux | tg-reviewer | tg-qa | T-011,T-102 | L | todo |
| T-186 | DataTable generik (TanStack Table) | FR-40 | tg-console | tg-ux | tg-reviewer | tg-qa | T-185 | M | todo |
| T-187 | Widget operasional + endpoint agregasi | FR-40 | tg-console + tg-backend (endpoint) | tg-ux | tg-reviewer | tg-qa | T-186,T-164 | L | todo |
| T-188 | Dashboard super admin: tenant, kesehatan queue/webhook, flag fitur | FR-40 | tg-console | tg-security | tg-reviewer | tg-qa | T-185 | M | todo |

### E10 Kualitas & Keamanan

| ID | Tugas | FR | Owner | R1 | R2 | V | Dep | Uk | Status |
|---|---|---|---|---|---|---|---|---|---|
| T-191 | Uji isolasi tenant lanjutan (IDOR, cache/queue/storage) | FR-01 | tg-security | tg-reviewer | tg-architect | tg-auditor | T-101..T-184 | M | todo |
| T-192 | Enkripsi field NIK/paspor + retensi + ekspor/hapus data | FR-36 | tg-backend | tg-security | tg-data | tg-qa | T-141 | M | todo |
| T-193 | Load test pembukaan kuota (k6) + tuning | FR-27 | tg-qa | tg-devops | tg-backend | tg-auditor | T-147 | M | todo |
| T-194 | Audit a11y + performa 4G low-end | FR-26 | tg-qa | tg-ux | tg-web | tg-auditor | T-142 | M | todo |
| T-195 | Backup + latihan restore | — | tg-devops | tg-security | tg-reviewer | tg-qa | T-008 | S | todo |

### E11 Rilis MVP

| ID | Tugas | FR | Owner | R1 | R2 | V | Dep | Uk | Status |
|---|---|---|---|---|---|---|---|---|---|
| T-198 | Runbook (insiden, closure darurat, webhook gagal, restore) + panduan tenant | — | tg-docs | tg-devops | tg-analyst | tg-auditor | semua P1 | M | todo |
| T-199 | Staging → produksi pilot, canary, rollback teruji, **Gate G5** | semua P1 | tg-devops | tg-security | tg-reviewer | tg-qa | T-191..T-198 | M | todo |

## P2 — Safety & Ops

| ID | Tugas | FR | Owner | R1 | R2 | V | Dep | Uk | Status |
|---|---|---|---|---|---|---|---|---|---|
| T-201 | Cuaca BMKG per jalur, cache, atribusi, fallback | FR-21 | tg-integrations | tg-reviewer | tg-domain | tg-qa | P1 | M | todo |
| T-202 | Deteksi overdue + eskalasi | FR-17,22 | tg-backend | tg-reviewer | tg-security | tg-qa | T-164 | M | todo |
| T-203 | Ekspor manifest + SOS untuk SAR | FR-22 | tg-console | tg-security | tg-reviewer | tg-qa | T-202 | M | todo |
| T-204 | Briefing digital + kuis sebelum tiket aktif | FR-23 | tg-web | tg-ux | tg-domain | tg-qa | P1 | M | todo |
| T-205 | Profil guide/porter + sertifikasi + ketersediaan | FR-24 | tg-backend | tg-reviewer | tg-domain | tg-qa | P1 | L | todo |
| T-206 | Penugasan + validasi rasio otomatis | FR-25 | tg-backend | tg-domain | tg-reviewer | tg-qa | T-205,T-131 | M | todo |
| T-207 | Item tambahan (sewa alat, transport, asuransi) di booking | FR-12 | tg-backend | tg-reviewer | tg-analyst | tg-qa | P1 | L | todo |
| T-208 | Lokalisasi EN + alur paspor/WNA | FR-26 | tg-web | tg-ux | tg-reviewer | tg-qa | P1 | M | todo |
| T-209 | Deklarasi logistik/sampah + deposit | FR-38 | tg-backend | tg-domain | tg-reviewer | tg-qa | P1 | M | todo |
| T-210 | Uji insiden simulasi end-to-end, **Gate G5 P2** | FR-17,22,07 | tg-qa | tg-security | tg-devops | tg-auditor | T-201..T-209 | M | todo |

## P3 — Marketplace & SaaS

| ID | Tugas | FR | Owner | R1 | R2 | V | Dep | Uk | Status |
|---|---|---|---|---|---|---|---|---|---|
| T-301 | Billing langganan + metering + invoice + suspend/reaktivasi | FR-28 | tg-backend | tg-security | tg-reviewer | tg-qa | P2 | L | todo |
| T-302 | Domain kustom + SSL otomatis | FR-29 | tg-devops | tg-security | tg-reviewer | tg-qa | P2 | M | todo |
| T-303 | API publik + widget embed | FR-32 | tg-backend + tg-web | tg-security | tg-reviewer | tg-qa | P2 | L | todo |
| T-304 | Open trip (gabung, patungan) | FR-30 | tg-backend | tg-reviewer | tg-analyst | tg-qa | P2 | L | todo |
| T-305 | Inventori sewa alat & homestay | FR-31 | tg-backend | tg-reviewer | tg-data | tg-qa | P2 | L | todo |
| T-306 | Laporan kondisi jalur + ulasan (moderasi) | FR-34 | tg-web | tg-security | tg-ux | tg-qa | P2 | M | todo |
| T-307 | **Paket template**: `TENANT_MODE=single`, installer, seed bersih, lisensi, panduan | FR-33 | tg-devops | tg-docs | tg-security | tg-qa (instal di server bersih < 30 mnt) | P2 | L | todo |
| T-308 | Dokumentasi publik tenant + video onboarding | — | tg-docs | tg-analyst | tg-ux | tg-auditor | T-301 | M | todo |
