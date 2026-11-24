# ADR — Architecture Decision Records (TrailGate)

Pemilik path: `tg-architect` (`OWNERS.md`). Sumber kebenaran produk tetap
[`docs/prd/PRD.md`](../prd/PRD.md).

Format tiap ADR: **Konteks · Keputusan · Alternatif yang ditolak · Konsekuensi · Status**
(`proposed | accepted | superseded`), sesuai pola yang diminta T-005.

## Indeks

| ADR | Judul | Status | File |
|---|---|---|---|
| ADR-001 | Tenancy: satu database bersama, `tenant_id` + global scope (`TENANT_MODE=single`) | accepted | [`ADR-001-tenancy.md`](ADR-001-tenancy.md) |
| ADR-002 | Pembayaran BYO Midtrans per tenant (platform tidak memegang dana) | accepted | [`ADR-002-byo-midtrans.md`](ADR-002-byo-midtrans.md) |
| ADR-003 | Kuota: `quota_slots` + transaksi atomik, Redis hanya pelengkap | accepted | [`ADR-003-quota-reservation.md`](ADR-003-quota-reservation.md) |
| ADR-004 | POS offline: app Next terpisah + antrean IndexedDB, first-scan-wins | accepted | [`ADR-004-offline-pos.md`](ADR-004-offline-pos.md) |
| ADR-005 | Enkripsi field identitas & dokumen (NIK/paspor, disk privat) | accepted | [`ADR-005-field-encryption.md`](ADR-005-field-encryption.md) |
| ADR-006 | Versi paket ter-pin, gate paket tg-security, level PHPStan, pin image | accepted | [`ADR-006-package-versions.md`](ADR-006-package-versions.md) |
| ADR-007 | Deviasi operating model saat bootstrap P0 (amandemen §16.1/§16.3/§16.5/§16.7/§16.15/§17) | accepted | [`ADR-007-governance-deviations.md`](ADR-007-governance-deviations.md) |

Urutan nomor = urutan tematik, bukan urutan waktu: ADR-001..006 ditulis oleh `T-005` (w2) setelah
ADR-007 ditulis lebih dulu saat bootstrap (T-002). Nomor tidak boleh diulang atau dirapikan lagi.

## Pemetaan keputusan inti PRD §0

| Keputusan | ADR |
|---|---|
| D1 (multi-tenant satu DB, `TENANT_MODE=single`) | ADR-001; dikutip ADR-005, ADR-006 |
| D4 (BYO Midtrans per tenant) | ADR-002; dikutip ADR-001, ADR-005, ADR-006 |
| D5 (engine kuota + closure = jantung produk) | ADR-003; dikutip ADR-002, ADR-004, ADR-006 |
| D7 (Laravel 12 + Next + MySQL 8 + Redis, PWA pos) | ADR-004, ADR-006; dikutip ADR-005 |

Setiap ADR memuat bagian **Konteks · Keputusan · Alternatif yang ditolak · Konsekuensi · Status**
plus tabel "Pemetaan keputusan inti PRD §0".

## Status

`proposed | accepted | superseded`. ADR-001..007 semuanya `accepted`. ADR baru, amendemen versi
(ADR-006), atau penggantian keputusan mengikuti aturan `OWNERS.md`: path ini milik `tg-architect`,
dan perubahan pada path yang sudah dipetakan PRD §16.4 memerlukan ADR baru.
