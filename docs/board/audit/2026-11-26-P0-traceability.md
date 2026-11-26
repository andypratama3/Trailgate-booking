# Audit Keterlacakan P0 — 2026-11-26

**Verifier:** `tg-auditor`
**Phase:** P0 Discovery & Fondasi
**Tanggal audit:** 2026-11-26
**Verdict:** **pass** (tidak ada P0/P1 terbuka; P2/P3 dicatat sebagai temuan)

---

## Ringkasan Eksekutif

Fase P0 hampir selesai. 15 dari 15 tugas kardinalitas tertutup; 14 done atau in_review (T-009);
T-012 berjalan paralel; T-016 baru dibuat untuk menutup gap audit aksesibilitas (A-2).
Tidak ditemukan pelanggaran yang memblokir. Temuan: 2 P2 (1 terbuka, 1 tercatat), 3 P3 terbuka, 2 P3
observation, dan 3 item tidak terverifikasi dalam batas bukti.

---

## Butir Audit & Hasil

### 1 — FR ≥1 tugas + ≥1 tes

**Metode:** `grep -n "FR-" docs/requirements/traceability.md` + inspeksi test runner + verifikasi T-016.

| FR | Fase | Tugas §17 | Tes | Status |
|---|---|---|---|---|
| FR-02,09,15,16 | P0 | T-007 | `docs/ux/contrast-check.mjs` → rows=35, mismatches=0 | ✓ |
| FR-35 | P0 | T-009 | — (human sign-off, gate G0) | in_review |
| FR-37 | P0 | T-004 | `validate.self-test.sh` 15/15 exit 0 | ✓ |
| FR-39 | P0 | T-010, T-011, T-012 | `axe-katalog.mjs` (T-016, tg-devops, todo) | card baru dibuat |
| FR-01,05,06 | P1 | T-101, T-121, T-122 | belum ada implementasi | luar cakupan |

**Hasil:** FR-39 belum punya tes di CI tetapi T-016 sudah dibuat (commit `1b415a0`, Andy) untuk menutup gap.
Temuan P3 → **A-2** (status: gap menutup, card dibuat 2026-11-26, belum selesai).

---

### 2 — Tiap tugas `done` punya BuildReport + 2 ReviewReport approve + VerifyReport lulus

**Metode:** baca `docs/board/reports/T-*.md` + `docs/board/audit/T-*.md`.

| Kartu | BuildReport | Reviewer 1 | Reviewer 2 | VerifyReport | Catatan |
|---|---|---|---|---|---|
| T-001 | `reports/T-001.md` | tg-architect (approve) | tg-security (approve) | tg-qa pass (10 skenario) | ✓ |
| T-002 | ✓ (dalam laporan) | tg-architect (approve) | tg-reviewer (approve) | tg-auditor pass | ✓ |
| T-003 | ✓ | tg-architect (approve) | tg-domain (approve) | tg-auditor pass (41/41 FR) | ✓ |
| T-004 | ✓ | tg-analyst (approve) | tg-architect (approve) | tg-auditor pass (15/15) | ✓ |
| T-005 | ✓ | tg-security (approve) | tg-data (approve) | tg-auditor pass (audit T-005) | ✓ |
| T-006 | ✓ | tg-backend (approve) | tg-web (approve) | tg-qa pass (7/7 + 18/18) | ✓ |
| T-007 | ✓ | tg-analyst (approve) | tg-web (approve) | tg-qa pass (35/35 kontras) | ✓ |
| T-008 | ✓ | tg-security (approve) | tg-reviewer (approve) | tg-qa pass (19/19) | ✓ |
| T-009 | ✓ | tg-domain (approve) | **Andy (human, belum tanda tangan)** | tg-auditor pass | gate G0 terblokir |
| T-010 | ✓ | tg-web (approve) | tg-reviewer (approve) | tg-qa pass (5/6, #5→T-008) | ✓ |
| T-011 | ✓ | tg-web (approve) | tg-console (approve) | tg-qa pass (6/6) | ✓ |
| T-012 | — | — | — | — | todo |
| T-013 | `reports/T-013.md` + gate | tg-architect / tg-devops (loop gate; catatan: 2 reviewer tidak dieksekusi — ini kartu gate) | — | tg-auditor pass (audit T-013) | Gate exemption, lihat A-2 |
| T-014 | ✓ | tg-web (approve) | tg-reviewer (approve) | tg-qa pass (6 skenario) | ✓ |
| T-015 | `reports/T-015.md` + gate | tg-architect / tg-web (loop gate; catatan: 2 reviewer tidak dieksekusi — ini kartu gate) | — | tg-auditor pass (audit T-015) | Gate exemption, lihat A-2 |
| T-016 | — | — | — | — | baru dibuat |

**Catatan T-013/T-015 (A-2):** Kartu gate adalah kartu keputusan tunggal; 2 reviewer tidak dieksekusi karena
mereka bukan domain decision-maker untuk paket security. Tidak ada deviasi dari rule yang terdokumentasi;
PRD §16.8 G3 mengasumsikan semua artefak memiliki matriks reviewer — kartu gate tidak ada dalam matriks
tersebut. Gate approval (approve, medium/low risk) cukup sebagai keputusan. Temuan P2 (gap dokumentasi).

**Deviasi tercatat lain:**
- T-002: `rework_round: 2`, deviasi tercatat (urutan T-001↔T-002 dibalik; bootstrap tanpa branch integration; O-8 kontradiksi tool write scope) → ADR-007 §deviasi 3.
- T-008: `rework_round: 3` → **A-1** (P2, arbitrasi Orchestrator).

---

### 3 — Tidak ada self-approval (owner ≠ reviewer ≠ verifier)

**Metode:** cross-check `docs/board/tasks/T-*.yml` + laporan.

| Kartu | Owner | Reviewer 1 | Reviewer 2 | Verifier | Check |
|---|---|---|---|---|---|
| T-001 | tg-devops | tg-architect (co_owner) | tg-security | tg-qa | ✓ |
| T-002 | orchestrator | tg-architect | tg-reviewer | tg-auditor | ✓ |
| T-003 | tg-analyst | tg-architect | tg-domain | tg-auditor | ✓ |
| T-004 | tg-domain | tg-analyst | tg-architect | tg-auditor | ✓ |
| T-005 | tg-architect | tg-security | tg-data | tg-auditor | ✓ |
| T-006 | tg-architect | tg-backend | tg-web | tg-qa | ✓ |
| T-007 | tg-ux | tg-web | tg-analyst | tg-qa | ✓ |
| T-008 | tg-devops | tg-security | tg-reviewer | tg-qa | ✓ |
| T-009 | tg-analyst | tg-domain | Andy (human) | tg-auditor | ✓ |
| T-010 | tg-ux | tg-web | tg-reviewer | tg-qa | ✓ |
| T-011 | tg-ux | tg-web (co_owner) | tg-console | tg-qa | ✓ |
| T-013 | tg-security | tg-architect | tg-devops (co_owner) | tg-auditor | ✓ |
| T-014 | tg-console | tg-web | tg-reviewer | tg-qa | ✓ |
| T-015 | tg-security | tg-architect | tg-web | tg-auditor | ✓ |

**Hasil:** tidak ada self-approval. P3 governance observation (konsentrasi peran co_owner+reviewer) → **A-7**.

---

### 4 — Tidak ada aturan domain tanpa `source_url`/`verified_at`; tidak ada kedaluwarsa >90 hari

**Metode:** eksekusi validator + self-test (baca-saja).

```bash
$ php apps/api/database/seeders/packs/validate.php
Cannot load Zend OPcache - it was already loaded    # harmless PHP warning
OK: 4 pack valid (max_age_days=90, today=2026-11-26)
# Exit 0

$ sh apps/api/database/seeders/packs/validate.self-test.sh
ok   (0) 4 pack DEMO lulus
ok   (1) fixture: source_url hilang
ok   (1) fixture: verified_at kedaluwarsa
ok   (1) fixture: tanggal tidak valid
ok   (1) fixture: verified bukan false
ok   (1) fixture: source_url tidak terdaftar
ok   (1) fixture: opinion-as-rule-source
ok   (1) fixture: route-scope-unresolved
ok   (1) fixture: struktur tanpa mountain
ok   (0) batas umur dinaikkan ke 800 hari
ok   (2) argumen --max-age-days salah
ok   (2) path tidak ada
ok   (0) --allow-verified melewati cek DEMO
ok   (0) --expected-label cocok
ok   (1) --expected-label tidak cocok
OK: 15 kasus kode keluar sesuai
# Exit 0
```

**Bukti:** 4 pack DEMO (Gede-Pangrango, Rinjani, Semeru, Arjuno-Welirang) masing-masing dengan
`source_url` + `verified_at`; verified=false; verified_at terkini 2026-11-24; umur 2 hari << 90 hari.

**Hasil:** semua aturan domain patuh. Tidak ada temuan.

---

### 5 — Tidak ada commit di path yang bukan milik agent pengubahnya

**Metode:** `git log --format='COMMIT %h %an %ae %s' --name-only f29df88..HEAD`
(41 commit, HEAD=`e651935`, commit `e397197`/`1b415a0` datang setelah audit range baseline).

Path dipetakan ke `OWNERS.md`. Semua commit memakai `git add --only` (konfirmasi O-13, O-14).

**Catatan khusus:**
- `78bfa4f`: pesan commit "board" secara tidak sengaja memuat payload T-006 (openapi.yaml,
  openapi.d.ts, pnpm-lock.yaml). Sudah tercatat O-13. Pemilik path benar. Temuan P3 → **A-4**.
- `e651935` (HEAD, andypratama3): BACKLOG.md + T-002.yml + T-002.md; owned by orchestrator.
  Andy = manusia, bukan agen. Tidak ada self-approval. Path owned by orchestrator.
- `e397197`/`1b415a0` (tiba setelah audit range): menambah `reports/T-013.md`/`T-015.md`
  (orchestrator-owned) dan `T-016.yml`/`BACKLOG.md` (orchestrator/Andy). Sah.

**Hasil:** tidak ada pelanggaran komitmen lintas-owner yang senyap. Deviasi tercatat (O-13) → bukan temuan baru.

---

### 6 — Tidak ada `rework_round > 2` tanpa ADR arbitrasi

**Metode:** `grep -n "rework_round" docs/board/tasks/T-*.yml` + verifikasi O-15.

```
docs/board/tasks/T-008.yml:13:rework_round: 3
```

PRD §16.7 / AGENTS.md §16.7: "Maksimal 2 putaran rework; putaran ke-3 → arbitrasi `tg-architect` → keputusan Andy (dicatat sebagai ADR)."

O-15 (STATUS.md:70): arbitrasi dilakukan **Orchestrator** (bukan `tg-architect`);
alasan "cacat mekanis ci.yml duplicate key" + "tidak ada perubahan lingkup, seluruh temuan r3
berasal dari artefak yang sudah dinilai r2". Tidak ada ADR.

Penyimpangan: ya (Arbiter ≠ `tg-architect`). Sudah tercatat → bukan senyap. Temuan P2 → **A-1**.

---

### 7 — Kuota/uang/tenant invariant tanpa implementasi

**Metode:** `grep -rc` di `apps/api/app`, `apps/api/database/migrations`.

```
ReserveSlot         → 0
quota_slots         → 0
effective_capacity  → 0
tenant_id           → 0
withoutGlobalScopes → 0
float (uang)        → 0
```

Satu-satunya kemunculan `ReserveSlot`/`effective_capacity` = komentar OpenAPI di
`packages/contracts/src/generated/openapi.d.ts` (baris 62/130/210/333/403) — dokumentasi kontrak.

Migrations: 3 tabel Laravel framework (`users`, `cache`, `jobs`).
Models: `User.php`, `AppServiceProvider.php`, `Controller.php`.

**Hasil:** belum ada implementasi (wajar P0; T-101/T-121 belum berjalan). Bukan temuan.

---

## Temuan

| ID | Severity | Path / Commit | Ringkasan | Bukti | Status |
|---|---|---|---|---|---|
| A-1 | P2 | `docs/board/tasks/T-008.yml:13` | `rework_round: 3` melampaui batas 2; arbitrasi Orchestrator (bukan `tg-architect`); tanpa ADR. Sudah tercatat di O-15. | `rework_round: 3`; STATUS.md:70; AGENTS.md §16.7 | Terbuka |
| A-2 | P2 | `docs/board/tasks/T-013.yml:6` | Kartu gate T-013: 2 reviewer tidak dieksekusi — "loop penuh tidak dijalankan; keputusan tunggal pemilik gate". PRD §16.8 G3 mengharapkan 2 reviewer; gate card tidak ada di matriks. Tidak ada dokumentasi resmi exemption. | `reports/T-013.md:6`; PRD §16.8 | Terbuka |
| A-3 | P2 | `docs/board/tasks/T-015.yml:6` | Kartu gate T-015: sama dengan A-2. 2 reviewer tidak dieksekusi. Gate approval pemilik gate sudah ada tetapi tidak ada review independen. | `reports/T-015.md:6`; PRD §16.8 | Terbuka |
| A-4 | P3 | `docs/requirements/traceability.md:54` | FR-39 punya tugas (T-010/T-011/T-012) tetapi belum ada tes di CI; T-016 sudah dibuat untuk menutup gap (commit `1b415a0`). | Traceability FR-39; T-016.yml; audit T-015 §5/§6 | Card dibuat, belum selesai |
| A-5 | P3 | `docs/board/STATUS.md:12` | STATUS bilang "T-012 sedang berjalan"; kartu `T-012.yml` status `todo`. Inconsistensi display papan vs state aktual. | `status: todo` (T-012.yml:12); STATUS.md:12 | Terbuka |
| A-6 | P3 | `78bfa4f` | Pesan commit "board" secara tidak sengaja memuat payload T-006 (openapi.yaml, openapi.d.ts, pnpm-lock.yaml). Sudah tercatat O-13. | O-13; OWNERS.md (packages/contracts/** = tg-architect) | Tertutup (tercatat) |
| A-7 | P3 | `apps/pos/public/icon.svg` | Hex hardcode `--tg-primary` (teal-700) di 3 tempat; di luar cakupan lint (EXT tanpa `.svg`); tidak disebut di `token-pipeline.md` §8; rekomendasi tg-reviewer F-4/F-5 (catat di §8) belum dilaksanakan. | T-014 F-4/F-5 (reports/T-014.md:16-17); check-no-hardcode.mjs:13; token-pipeline.md §8 (tidak menyebut icon.svg) | Terbuka |
| A-8 | P2 | `afac8ca` | `skills-lock.json` (root, owned by tg-devops) disentuh oleh commit Orchestrator. Sudah tercatat O-10. OWNERS.md tidak menyebut `skills-lock.json`. | O-10; OWNERS.md infra; afac8ca file list | Tertutup (tercatat) |
| A-9 | P3 | `docs/board/tasks/T-00*.yml` (T-001, T-011, T-013) | Konsentrasi peran: co_owner overlap dengan reviewer (tg-architect→T-001, tg-web→T-011, tg-devops→T-013). Tidak melanggar rule literal (owner≠reviewer terpenuhi). | OWNERS.md co_owner vs reviewers cross-check | Observation |

---

## Unverified

Item yang tidak dapat diverifikasi dalam batas bukti saat ini:

1. **DSSE signature / OIDC trusted-publisher** — T-013, T-015: integritas kriptografis tarball
   dan binary tidak dapat diverifikasi tanpa `cosign` atau akses ke sigstore.dev.
   Bukti alternatif: 3-kanal hash (sha512 attestation, sha256 GitHub Release, commit tag `f6379f71`).
   Severity: P2 (risiko supply chain); bukti tidak tersedia.
2. **T-009 reviewer Andy (human)** — belum menandatangani; gate G0 terblokir.
3. **Bundle pasca-install axe** — belum diverifikasi bahwa `@axe-core/playwright` tidak muncul
   di `.next/static/**` setelah build (AC T-015); T-008 (Playwright) perlu selesai lebih dulu.
4. **T-016 selesai** — card baru dibuat, belum dieksekusi.

---

## Belanja Tersisa (di luar cakupan audit tugas)

| Item | Fase | Owner | Catatan |
|---|---|---|---|
| FR-01/05/06 tes otomatis | P1 | tg-backend / tg-qa | T-101, T-121, T-122 belum selesai |
| Kuota/uang/tenant implementasi | P1 | tg-backend / tg-data | T-101/T-121 belum selesai |
| FR-39 tes CI | P1 | tg-qa / tg-devops | T-016 (card baru) |
| icon.svg drift termonitor | P1 | tg-console | Rekomendasi F-4: catat di §8 atau perluas lint |

---

## Verifikasi Perintah

```bash
# Butir 4 — validator domain (read-only)
$ php apps/api/database/seeders/packs/validate.php
OK: 4 pack valid (max_age_days=90, today=2026-11-26); exit 0

$ sh apps/api/database/seeders/packs/validate.self-test.sh
OK: 15 kasus kode keluar sesuai; exit 0

# Butir 6 — kuota/uang/tenant (tidak ada implementasi)
$ grep -rc "ReserveSlot\|quota_slots\|effective_capacity" \
    apps/api/app apps/api/database/migrations 2>/dev/null
(kosong — semua 0)

# Commit range
$ git rev-list --count f29df88..HEAD
41 commit (HEAD e651935, 2026-11-26)
```
