# Mountain Pack — skema, kebijakan sumber, validator

Status: **DEMO** · Owner: `tg-domain` · FR-37 · Task T-004 · Diakses: 2026-11-24

Berkas ini menjelaskan format paket rujukan domain (Mountain Pack), aturan provenance yang
dikuatkan validator, dan cara menjalankannya. Sumber kebenaran produk tetap
[`docs/prd/PRD.md`](../prd/PRD.md) (§2 riset domain, §5 FR-37, §6.1/§6.2 rule engine,
§10.2 tabel `requirement_rules`, §16.2 prinsip operasi, §18.3 DoD domain pack).

---

## 1. Tujuan

Mountain Pack adalah data domain yang siap diimpor ke tenant (FR-37, FR-03 katalog, FR-08
rule engine) dan mengandung klaim aturan pendakian yang **wajib bersumber**. Tiga tujuan:

1. Klaim aturan pendakian tidak pernah masuk tanpa bukti (PRD §6.1, §18.1 baris "Domain").
2. Pengguna bisa melihat kapan suatu aturan terakhir diverifikasi (badge "perlu verifikasi"
   setelah 90 hari, PRD §6.1/AC-37.2).
3. Pack yang belum dikonfirmasi pengelola/pilot tetap dipakai sebagai rujukan internal,
   bukan dianggap fakta (PRD §18.3, §20.2 #1).

## 2. Layout berkas

```
apps/api/database/seeders/packs/
├── schema/mountain-pack.schema.json   # JSON Schema (sumber kebenaran struktur)
├── validate.php                       # validator sumber (stdlib PHP, tanpa bootstrap)
├── validate.self-test.sh              # self-test: kode keluar per skenario (0/1/2)
├── gede-pangrango.json                # 4 pack rujukan DEMO
├── rinjani.json
├── semeru.json
├── arjuno-welirang.json
└── fixtures/                          # paket negatif untuk validator (BUKAN data domain)
    ├── missing-source-url.json
    ├── expired-verified-at.json
    ├── invalid-date.json
    ├── verified-true.json
    ├── undeclared-source-url.json
    ├── opinion-as-rule-source.json
    ├── route-scope-unresolved.json
    └── missing-mountain.json
```

`fixtures/` tidak ikut dipindai validator saat tanpa argumen (validator hanya memindai
`*.json` langsung di direktori target, bukan rekursif). Skrip `validate.self-test.sh`
menjalankan lima belas kasus sekaligus dan memberi bukti satu perintah untuk §6.3.

## 3. Skema

Dokumen skema: [`schema/mountain-pack.schema.json`](../../apps/api/database/seeders/packs/schema/mountain-pack.schema.json)
(JSON Schema draft 2020-12). Pemakai lain (impor T-114, editor) boleh membaca langsung; validator
memakai skema yang sama sehingga struktur tidak berkembang ganda.

### 3.1 Properti level pack

| Properti | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `pack_version` | string `X.Y.Z` | ✓ | Versi format pack. |
| `label` | string (pola `^[A-Z0-9][A-Z0-9_-]{1,31}$`) | ✓ | Nilai lazim `"DEMO"`. Validator menuntut `DEMO` kecuali dijalankan dengan `--expected-label`/`--allow-verified` (§6.1, §7); mengganti label wajib ADR. |
| `verified` | boolean | ✓ | **`false`** untuk pack DEMO (§18.3). `true` hanya setelah konfirmasi manusia, dan jalankan validator dengan `--allow-verified` (§7). |
| `generated_at` | date | ✓ | Tanggal pack dibuat (2026-11-24 = tanggal akses Lampiran A). |
| `mountain` | object | ✓ | `slug`, `name`, `manager` (persis tertulis di §2.1), `booking_systems[]`, `notes[]`. |
| `routes[]` | array | ✓ (boleh kosong) | `slug`, `name`, `source_url`, `verified_at`, `note`. |
| `gates[]` | array | ✓ (boleh kosong) | `slug`, `name`, `route_slug` (nullable), `source_url`, `verified_at`, `note`. |
| `checkpoints[]` | array | ✓ (boleh kosong) | Seperti gate, plus `kind` ∈ `pos|junction|limit|summit|camp|other`. |
| `camp_areas[]` | array | ✓ (boleh kosong) | Seperti gate. |
| `quota[]` | array | ✓ (minimal 1) | `scope` ∈ `mountain|route`, `route_slug` (nullable), `capacity_per_day` (integer ≥1 **atau `null`**), `unit`, `gate_count`, `open_schedule`, `source_url`, `verified_at`, `note`. |
| `closure_drafts[]` | array | opsional | Usulan penutupan; selalu `status: "draft"` dan `confirmed_by: null`. |
| `requirement_rules[]` | array | ✓ (minimal 1) | Lihat §3.2. |
| `sources[]` | array | ✓ (minimal 1) | `id` (`S<n>`), `url`, `title`, `accessed_at`, `paraphrase`, `kind` ∈ `regulation|news|research|official_site|opinion`. |

Catatan desain:

- **`gates`/`checkpoints`/`camp_areas` berada di level pack, bukan bersarang di `routes`** (lihat
  §10.1 ERD: `ROUTE ||--o{ GATE|CHECKPOINT` → setiap entri memakai `route_slug` nullable).
  Bentuk flat dipakai agar satu jalur yang belum bernama tetap bisa memakai seluruh katalog
  tanpa membuat entitas fiktif.
- **`quota` berupa array**, bukan objek tunggal: PRD §10.2 mendefinisikan kuota per
  `(route_id, date)`, dan satu pack bisa memuat beberapa jalur.
- `notes[]` memakai bentuk `{text, source_url, verified_at}` — catatan faktual di pack juga
  harus bersumber, bukan hanya `requirement_rules`.

### 3.2 `requirement_rules[]`

Setiap aturan **wajib** memuat semua kunci berikut (`additionalProperties: false`):

```json
{
  "scope": "mountain",
  "route_slug": null,
  "type": "health_cert_max_age_hours",
  "params": { "hours": 24 },
  "severity": "block",
  "source_url": "https://lestari.kompas.com/read/2025/08/13/225800186/...",
  "verified_at": "2026-11-24",
  "effective_from": null,
  "effective_to": null,
  "note": "PRD §2.1: surat sehat diperoleh sehari sebelum mendaki. Dimodelkan 24 jam ..."
}
```

| Kunci | Aturan |
|---|---|
| `scope` | `tenant\|mountain\|route` (PRD §6.1). |
| `route_slug` | Wajib bila `scope: "route"`; harus ada di `routes[]` (dicek validator). |
| `type` | Enum ketat = daftar PRD §6.2. Normalisasi: PRD §6.2 menulis `required_documents[]`, skema memakai `required_documents` (tanpa kurung siku) karena hanya nilainya yang disimpan. Tipe baru hanya lewat ADR. |
| `params` | Objek; **bentuk per tipe tidak ditegakkan skema** — kontrak tertulis di §3.2.1 dan divalidasi rule engine/impor (T-114). |
| `severity` | `block\|warn` (PRD §6.1). |
| **`source_url`** | **NOT NULL** (PRD §6.1, §10.2). Wajib berupa `https?://...` yang terdaftar di `sources[]` — dicocokkan validator. Pola `^https?://` juga dituntut skema untuk semua properti URL (`sources[].url`, `booking_systems[].url`), sehingga `mailto:` ditolak keduanya. |
| **`verified_at`** | **NOT NULL**, format `YYYY-MM-DD`. Lebih dari 90 hari dari tanggal acuan → validator gagal (§6.1). |
| **`effective_from` / `effective_to`** | Keduanya wajib dideklarasikan (§6.1 "masa berlaku"). Boleh `null`; `effective_to: null` = masa akhir tidak diketahui. `effective_from > effective_to` → validator gagal. |

#### 3.2.1 Kontrak `params` per tipe

Skema hanya menuntut `params` berupa objek; bentuk per tipe **tidak ditegakkan skema**
(`oneOf` sengaja tidak dipakai agar skema tetap mudah dibaca pemakai lain). Kontrak yang
dipakai pack DEMO sekarang:

| `type` | `params` | Dipakai di |
|---|---|---|
| `min_age_unaccompanied` | `{ "min_age": int }` | — |
| `minor_requires_guardian_consent` | `{ "under_age": int }` | Rinjani (17) |
| `beginner_requires_guide` | `{ "required": bool }` | Rinjani |
| `health_cert_max_age_hours` | `{ "hours": int }` | Rinjani (24, [ASUMSI]) |
| `informed_consent_required` | `{ "required": bool }` | Rinjani |
| `insurance_info_required` | `{ "required": bool }` | Rinjani |
| `guide_ratio` | `{ "max_hikers_per_guide": int }` | Rinjani (4, [ASUMSI]) |
| `porter_ratio` | `{ "foreign": int, "domestic": int }` | Rinjani (2/3) |
| `max_group_size` | `{ "max_group_size": int }` | — |
| `min_group_size` | `{ "min_group_size": int }` | — |
| `booking_window_days` | `{ "days": int }` | — |
| `booking_cutoff_hours` | `{ "hours": int }` | Semeru (48, [ASUMSI]) |
| `max_stay_nights` | `{ "max_stay_nights": int }` | — |
| `required_documents` | `{ "documents": string[] }` | Gede-Pangrango, Semeru |
| `reschedule_policy` | kunci yang dipakai pack DEMO: `members_immutable` bool, `max_group_reschedules_per_day` int, `requires_assessment` bool | Semeru, Arjuno-Welirang |
| `refund_policy` | kunci yang dipakai pack DEMO: belum ada (tidak ada pack memuat refund) | — |
| `quota_open_schedule` | kunci yang dipakai pack DEMO: belum ada; fakta pembukaan TNGGP dicatat di `mountain.notes[]` (A-F1) | — |

Nilai yang ditandai `[ASUMSI]` bukan angka dari sumber; `note` pada rule menjelaskan
interpretasinya (§4 butir 4). Validasi `params` per tipe menjadi tanggung jawab rule
engine/impor FR-08 (T-114); tabel ini adalah kontrak tertulisnya.

Aturan tanpa sumber **tidak pernah** dipertahankan: bila tidak ada sumber yang benar, pack
tidak dibuat untuk aturan itu (jangan mengisi `note` tanpa `source_url`).

### 3.3 `closure_drafts[]`

Penutupan jalur adalah kejadian normal (PRD §2.3 #1–#2), jadi pack membawa usulan penutupan
yang dirujuk. Tiga jaminan otomatis:

- `status` konstan `"draft"` (skema `const`),
- `confirmed_by` konstan `null` — hanya manusia yang mengisi setelah konfirmasi,
- `mode` hanya `block_new_bookings` atau `cancel_existing` (PRD §2.3 #2).

Draft **tidak** masuk `requirement_rules[]` dan tidak mengubah status jalur apa pun.

## 4. Kebijakan provenance

Berlaku untuk seluruh isi pack dan diverifikasi validator + reviewer `tg-analyst`/`tg-architect`.

1. **Setiap klaim domain punya `source_url` + `verified_at`.** Berlaku untuk
   `requirement_rules[]`, `quota[]`, `routes[]`, `gates[]`, `checkpoints[]`, `camp_areas[]`,
   `mountain.booking_systems[]`, `mountain.notes[]`, dan `closure_drafts[]`.
2. **`verified_at` = tanggal akses sumber, bukan tanggal publikasi.** Untuk 4 pack ini semua
   `2026-11-24` — tanggal akses seluruh sumber di Lampiran A PRD. Publikasi 2025-08-13 pada
   URL Kompas **tidak** dipakai sebagai `verified_at`.
3. **`kind: "opinion"` tidak pernah menjadi sumber `requirement_rules[]`.** Opini tata
   kelola/daya dukung (`retizen.republika.co.id/posts/777454`) dideklarasikan untuk
   transparansi pada pack Rinjani tetapi tidak dipakai; opini skripsi UGM 2024 hanya masuk
   `mountain.notes[]` sebagai kutipan riset. Aturan ini **dicek validator**: rule yang
   `source_url`-nya menunjuk sumber `kind: "opinion"` → exit 1 (bukti: fixture
   `opinion-as-rule-source.json`, §6.4).
4. **Tidak ada angka yang dikarang; yang diturunkan sendiri ditandai `[ASUMSI]`.**
   Dua kelas label dipakai dan tidak boleh tertukar:
   - `[ASUMSI]` = nilai yang kita turunkan sendiri dari teks PRD (interpretasi atau
     presisi yang tidak ditulis sumber): H-2 → 48 jam, "sehari sebelum" → 24 jam,
     "sejak Jan 2026" → `effective_from: 2026-01-01`, tahun pada tanggal tanpa tahun di
     kolom "Dinamika 2026", slug/nama jalur `ranu-pani`, `kind` checkpoint (`pos`/`limit`),
     nama `params`, dan rasio guide 4 (sumber juga menyebut 5).
   - `[VERIFIKASI]` = fakta dari sumber yang masih perlu dikonfirmasi ke pengelola
     (status penutupan terkini, hidup-tidaknya host booking, rasio guide terbaru).
   Yang **tidak** ada di PRD sengaja dibiarkan kosong: elevasi, nama gate, area camp,
   kuota harian Rinjani, tanggal pasti penutupan Semeru ("awal Sep 2026").
5. **URL dibentuk dari Lampiran A apa adanya** dengan prefiks `https://` saja; tidak ada
   host, path, atau parameter yang ditambah. Dua entri Lampiran A sengaja **tidak** dipakai:
   `idntimes.com (pendakian-gunung-semeru-buka-lagi-ini-aturan-terbarunya)` tidak punya URL
   lengkap, dan opini `retizen` (lihat butir 3).
   Untuk sumber yang diambil dari PRD §2.1 (bukan dari daftar Lampiran A: `booking.gedepangrango.org`,
   `booking.bromotenggersemeru.org`, `bromotenggersemeru.id`), `accessed_at` tetap `2026-11-24`
   — yaitu tanggal akses Lampiran A, bukan akses langsung ke host itu. Perbedaan ini dinyatakan
   eksplisit di `sources[].paraphrase`.
6. **Label DEMO + escape hatch.** `label: "DEMO"` + `verified: false` di keempat pack:
   pengelola/pilot belum diputuskan (PRD §20.2 #1), jadi data ini rujukan internal, bukan
   fakta tenant (§18.3). Validator menolak pack yang tidak memenuhi keduanya **kecuali**
   dijalankan dengan `--allow-verified` (pack yang sudah dikonfirmasi manusia) atau
   `--expected-label=X` (label lain setelah ADR); lihat §7.
7. **Akronim pengelola tidak diekspansi.** `BB TNGGP`, `BTNGR`, `BB TNBTS`, `Tahura Raden
   Soerjo` ditulis persis seperti PRD §2.1.
8. **Usulan penutupan = draft** (§3.3). Tidak ada closure yang ditandai dikonfirmasi.

## 5. Isi 4 pack dan yang sengaja kosong

| Pack | routes | gates | checkpoints | camp_areas | quota | rules | closures | sources |
|---|---|---|---|---|---|---|---|---|
| `gede-pangrango.json` | 0 | 0 | 0 | 0 | 1 (300/hari, 3 pintu) | 1 | 1 | 7 |
| `rinjani.json` | 1 (Senaru) | 0 | 0 | 0 | 1 (`capacity_per_day: null`) | 7 | 2 | 6 |
| `semeru.json` | 1 (Ranu Pani) | 0 | 2 (Ranu Pani check-in, Ranu Kumbolo batas) | 0 | 1 (200/hari) | 3 | 2 | 4 |
| `arjuno-welirang.json` | 0 | 0 | 0 | 0 | 1 (550/hari) | 1 | 2 | 4 |

Angka per pack mengikuti PRD §2.1: 300/hari + 3 pintu (TNGGP), 200/hari + batas Ranu Kumbolo
(Semeru), 550/hari (Arjuno-Welirang), dan **tidak ada** kuota harian Rinjani di §2 → `null`.
Rasio guide 4 dan porter 2/3, batas umur 17 tahun, surat sehat 24 jam, dan aturan reschedule
Semeru semuanya berasal dari baris Rinjani/Semeru di PRD §2.1. Fakta pembukaan TNGGP
(13 Apr 2026, gelang RFID, kuota 300/hari) dicatat di `mountain.notes[]`, bukan sebagai
rule: PRD §2.1 tidak mencatat jendela kuota TNGGP dan pembukaan itu bukan syarat blokir.

`camp_areas[]` kosong di semua pack: PRD §2.1 tidak mencatat nama area camp. Ranu Kumbolo
dicatat sebagai `checkpoints[].kind: "limit"` karena hanya disebut sebagai batas pendakian;
ia tidak dipromosikan jadi camp area tanpa sumber. Isinya menyusul setelah wawancara/verifikasi
pengelola (T-009).

## 6. Validator

Berkas: `apps/api/database/seeders/packs/validate.php`. **Hanya PHP stdlib** — tanpa bootstrap
Laravel, tanpa Composer, tanpa database — sehingga bisa jalan di CI sebagai pemeriksaan awal.

### 6.1 Perintah

```bash
# 4 pack di direktori packs/ (default)
php apps/api/database/seeders/packs/validate.php

# satu pack / sejumlah pack / direktori lain
php apps/api/database/seeders/packs/validate.php apps/api/database/seeders/packs/rinjani.json

# batas umur diubah (default 90 hari, PRD §6.1)
php apps/api/database/seeders/packs/validate.php --max-age-days=180

# acuan waktu diubah (perlu untuk tes yang deterministik). Default 'today' dipin ke
# Asia/Jakarta agar hasil tidak bergantung pada date.timezone php.ini di mesin/CI.
php apps/api/database/seeders/packs/validate.php --today=2027-01-01

# skema lain
php apps/api/database/seeders/packs/validate.php --schema=apps/api/database/seeders/packs/schema/mountain-pack.schema.json

# pack pilot yang sudah dikonfirmasi manusia (lihat §7): lewati cek DEMO + verified=false
php apps/api/database/seeders/packs/validate.php --allow-verified

# label selain DEMO (mis. setelah ADR mengganti label)
php apps/api/database/seeders/packs/validate.php --expected-label=PILOT
```

### 6.2 Yang diperiksa

| # | Pemeriksaan | Sumber aturan |
|---|---|---|
| 1 | Struktur pack sesuai JSON Schema (`required`, `additionalProperties: false`, `format: date`, `pattern` termasuk `^https?://`, `enum` ketat, `minItems`) | §10.2, §6.2 |
| 2 | `requirement_rules[]` tanpa `source_url` / `verified_at` / `effective_from` / `effective_to` → ditolak (baik lewat skema maupun pemeriksaan domain) | §6.1 |
| 3 | Setiap entri bersumber (`requirement_rules[]`, `quota[]`, `routes[]`, `gates[]`, `checkpoints[]`, `camp_areas[]`, `mountain.booking_systems[]`, `mountain.notes[]`, `closure_drafts[]`): `source_url` harus URL terisi dan terdaftar di `sources[]`, `verified_at` harus ada | §6.1, §2.3 #7 |
| 4 | `verified_at` bukan tanggal `YYYY-MM-DD` valid (termasuk 2026-02-30) → ditolak | §6.1 |
| 5 | `verified_at` lebih tua dari N hari (default 90) → ditolak untuk setiap entri bersumber | §6.1, AC-37.2 |
| 6 | `verified_at` setelah tanggal acuan (dibandingkan sebagai teks `Y-m-d`) → ditolak | §6.1 |
| 7 | `effective_from > effective_to` → ditolak | §6.1 |
| 8 | `verified` bukan `false`, atau `label` bukan `DEMO` → ditolak; dilewati `--allow-verified`, label diganti `--expected-label` | §18.3 |
| 9 | `route_slug` pada gate/checkpoint/camp_area/quota/closure/rule tidak ada di `routes[]` → ditolak; rule `scope: "route"` tanpa `route_slug` → ditolak | §6.1, §10.1 |
| 10 | Rule dengan `source_url` ber-kind `opinion` → ditolak (opini bukan fakta bersumber) | §6.1, §2.3 #7 |
| 11 | `slug` duplikat dalam satu koleksi (`routes[]`/`gates[]`/`checkpoints[]`/`camp_areas[]`) atau `sources[].id` duplikat → ditolak | §10.1 |
| 12 | `params` per tipe **tidak** ditegakkan skema; kontrak tertulis di §3.2.1, divalidasi rule engine/impor (T-114) | FR-08 |

Format pesan: `<path berkas>: <lokasi di pack>: <penjelasan>` — satu baris per galat, ke stderr.

### 6.3 Kode keluar

| Kode | Arti |
|---|---|
| `0` | Semua pack lulus. |
| `1` | Ada minimal satu pack bermasalah (ada baris galat). |
| `2` | Argumen/path/schema salah (tidak ada pack diperiksa). |

### 6.4 Bukti

```console
$ php apps/api/database/seeders/packs/validate.php; echo "exit=$?"
OK: 4 pack valid (max_age_days=90, today=2026-11-24)
exit=0
```

Pack negatif (satu per pemeriksaan; masing-masing exit 1):

```console
$ php apps/api/database/seeders/packs/validate.php apps/api/database/seeders/packs/fixtures/missing-source-url.json
apps/api/database/seeders/packs/fixtures/missing-source-url.json: requirement_rules[0]: hilang properti wajib 'source_url'
apps/api/database/seeders/packs/fixtures/missing-source-url.json: requirement_rules[0]: hilang 'source_url' — aturan tanpa sumber tidak boleh masuk (PRD §6.1)
FAIL: 1 pack bermasalah dari 1 pack diperiksa (max_age_days=90, today=2026-11-24)
exit=1

$ php apps/api/database/seeders/packs/validate.php apps/api/database/seeders/packs/fixtures/expired-verified-at.json
apps/api/database/seeders/packs/fixtures/expired-verified-at.json: requirement_rules[0].verified_at 2025-01-01 berumur 692 hari (> 90) — verifikasi ulang diperlukan (PRD §6.1)
FAIL: 1 pack bermasalah dari 1 pack diperiksa (max_age_days=90, today=2026-11-24)
exit=1

$ php apps/api/database/seeders/packs/validate.php apps/api/database/seeders/packs/fixtures/invalid-date.json
apps/api/database/seeders/packs/fixtures/invalid-date.json: requirement_rules[0].verified_at: format tidak valid untuk 'date', dapat '24-11-2026'
FAIL: 1 pack bermasalah dari 1 pack diperiksa (max_age_days=90, today=2026-11-24)
exit=1

$ php apps/api/database/seeders/packs/validate.php apps/api/database/seeders/packs/fixtures/verified-true.json
apps/api/database/seeders/packs/fixtures/verified-true.json: pack: 'verified' harus false — pack DEMO belum dikonfirmasi tenant (PRD §18.3)
FAIL: 1 pack bermasalah dari 1 pack diperiksa (max_age_days=90, today=2026-11-24)
exit=1

$ php apps/api/database/seeders/packs/validate.php apps/api/database/seeders/packs/fixtures/missing-mountain.json
apps/api/database/seeders/packs/fixtures/missing-mountain.json: pack: hilang properti wajib 'mountain'
FAIL: 1 pack bermasalah dari 1 pack diperiksa (max_age_days=90, today=2026-11-24)
exit=1

$ php apps/api/database/seeders/packs/validate.php apps/api/database/seeders/packs/fixtures/opinion-as-rule-source.json
apps/api/database/seeders/packs/fixtures/opinion-as-rule-source.json: requirement_rules[0].source_url memakai sumber kind=opinion: https://example.invalid/fixture-opini — opini bukan fakta bersumber dan tidak boleh menjadi aturan (PRD §6.1, docs/domain/mountain-pack.md §4.3)
FAIL: 1 pack bermasalah dari 1 pack diperiksa (max_age_days=90, today=2026-11-24)
exit=1

$ php apps/api/database/seeders/packs/validate.php apps/api/database/seeders/packs/fixtures/route-scope-unresolved.json
apps/api/database/seeders/packs/fixtures/route-scope-unresolved.json: requirement_rules[1]: scope 'route' wajib mengisi route_slug yang ada di routes[] (PRD §6.1, §10.1)
apps/api/database/seeders/packs/fixtures/route-scope-unresolved.json: requirement_rules[0].route_slug 'jalur-hantu' tidak ada di routes[]
FAIL: 1 pack bermasalah dari 1 pack diperiksa (max_age_days=90, today=2026-11-24)
exit=1

$ php apps/api/database/seeders/packs/validate.php apps/api/database/seeders/packs/fixtures/undeclared-source-url.json
apps/api/database/seeders/packs/fixtures/undeclared-source-url.json: requirement_rules[0].source_url tidak dideklarasikan di sources[]: https://example.invalid/tidak-dideklarasikan
FAIL: 1 pack bermasalah dari 1 pack diperiksa (max_age_days=90, today=2026-11-24)
exit=1
```

Batas umur yang bisa dikonfigurasi:

```console
$ php apps/api/database/seeders/packs/validate.php --max-age-days=800 apps/api/database/seeders/packs/fixtures/expired-verified-at.json; echo "exit=$?"
OK: 1 pack valid (max_age_days=800, today=2026-11-24)
exit=0
```

Argumen salah → exit 2 (tanpa pack diperiksa):

```console
$ php apps/api/database/seeders/packs/validate.php --max-age-days=abc; echo "exit=$?"
error: --max-age-days butuh integer >= 1, dapat 'abc'
exit=2

$ php apps/api/database/seeders/packs/validate.php apps/api/database/seeders/packs/tidak-ada.json; echo "exit=$?"
error: path tidak ditemukan: apps/api/database/seeders/packs/tidak-ada.json
exit=2
```

### 6.5 Menambah pack negatif

Salin `fixtures/missing-source-url.json` lalu ubah hanya satu hal. Validator menolak semua
pack di `fixtures/`, sehingga jalur galat baru langsung terbukti. Pack produksi tidak boleh
ditulis di `fixtures/`: direktori itu dikecualikan pemindaian default dan tidak dipakai
seeder.

### 6.6 Self-test satu perintah

```console
$ sh apps/api/database/seeders/packs/validate.self-test.sh; echo "exit=$?"
ok   (0) 4 pack DEMO lulus
ok   (1) fixture: source_url hilang
ok   (1) fixture: verified_at kedaluwarsa
ok   (1) fixture: tanggal tidak valid
ok   (1) fixture: verified bukan false
ok   (1) fixture: source_url tidak terdaftar di sources[]
ok   (1) fixture: sumber kind=opinion jadi aturan
ok   (1) fixture: scope=route dengan route_slug tak terselesaikan
ok   (1) fixture: struktur tanpa mountain
ok   (0) batas umur dinaikkan ke 800 hari
ok   (2) argumen --max-age-days salah
ok   (2) path tidak ada
ok   (0) escape hatch: --allow-verified melewati cek DEMO
ok   (0) escape hatch: --expected-label cocok dengan label pack
ok   (1) escape hatch: --expected-label tidak cocok dengan label pack
OK: 15 kasus kode keluar sesuai
exit=0
```

Skrip ini memakai `sh` + `php` saja, tanpa PHPUnit: `apps/api/tests/**` dimiliki `tg-backend`
(`OWNERS.md`) sehingga di luar lingkup T-004. Pemeriksaan ini adalah penerimaan AC "validator
punya tes". Bila repo kemudian membungkusnya dalam PHPUnit, pindahkan kasusnya ke
`apps/api/tests` lewat task tg-backend.

## 7. Menaikkan pack ke terverifikasi

Langkah manusia, bukan otomatis (tidak ada kode yang mengubah `verified` sendiri):

1. Verifikasi tiap `source_url` + `verified_at` terhadap dokumen resmi pengelola; perbarui
   `verified_at` (melewati 90 hari otomatis gagal di validator).
2. Isi `mountain.notes[]`/`quota.note` untuk setiap gap yang dulu ditulis `[VERIFIKASI]`,
   dan ganti nilai `[ASUMSI]` dengan angka/sumber resmi bila sudah tersedia.
3. Bila data dikonfirmasi pengelola/pilot, ubah `verified` ke `true`, ganti `label` sesuai
   ADR, dan isi `closure_drafts[].confirmed_by` untuk closure yang sudah dikonfirmasi.
4. Jalankan validator lagi **dengan flag escape hatch** — cek DEMO/`verified` berhenti
   menolak pack terverifikasi:

   ```bash
   php apps/api/database/seeders/packs/validate.php --allow-verified --expected-label=PILOT
   ```

   Tanpa flag itu, validator selalu menolak `verified: true` (memang disengaja: tanpa
   konfirmasi manusia pack tidak boleh dianggap terverifikasi). Mengganti label tetap
   memerlukan ADR; `--expected-label` hanya mengikatkan validator ke label yang sudah
   disepakati itu.

## 8. Hubungan tugas lain

- **T-114** (tg-backend): importer + badge "perlu verifikasi" per FR-37/AC-37.2. T-114 memanggil
  `validate.php` (atau mengulang pemeriksaannya) dan menggagalkan `db:seed` bila exit ≠ 0 (AC-37.1).
  Pack di direktori ini adalah inputnya, bukan diproduksinya.
- **T-009** (tg-analyst): wawancara 5 basecamp + 3 TO — pengisi `gates`/`checkpoints`/
  `camp_areas` dan verifikasi pack pilot; sampai wawancara jalan, `camp_areas[]` tetap kosong
  (PRD §20.2 #1 masih belum diputuskan).
- **ADR**: format `mountain-pack.schema.json` bisa berubah hanya dengan ADR (§6.2 melarang
  tipe aturan baru tanpa ADR; penambahan properti pack = amandemen format).
