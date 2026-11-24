# @trailgate/contracts

Kontrak API TrailGate v1. **`openapi.yaml` adalah sumber kebenaran** (contracts-first, PRD §11);
tipe TypeScript di `src/generated/openapi.d.ts` di-*generate* dari file itu.

Pemilik path: `tg-architect` (`OWNERS.md`). Perubahan kontrak = ADR baru, bukan suntingan diam-diam
(`AGENTS.md` aturan 14/16.2, kartu T-006).

## Perintah

```bash
pnpm -C packages/contracts validate        # redocly lint openapi.yaml (validasi 3.1 + lint)
pnpm -C packages/contracts generate        # regenerate src/generated/openapi.d.ts
pnpm -C packages/contracts generate:check  # gagal bila output tidak sinkron dengan openapi.yaml (dipakai CI)
pnpm -C packages/contracts test            # tes kontrak (node --test): struktur spec + contoh payload valid/invalid
pnpm -C packages/contracts typecheck       # tsc --noEmit atas tipe ter-generate
```

Versi tool dipin eksak di `package.json`: `openapi-typescript 7.13.0` (generator),
`@redocly/cli 2.83.0` (validator), `ajv 8.20.0` + `ajv-formats 3.0.1` (validasi contoh payload),
`yaml 2.9.1`, `typescript 5.9.3`. Pencatatan resmi paket dev ini ada di ADR-006 (amendemen).

## Konvensi yang diuji tes kontrak

- Semua path di bawah `/v1` (versi di URL).
- **Tenant bukan path parameter**: di-resolve dari host/subdomain atau token (ADR-001);
  pengecualian tunggal `/v1/webhooks/midtrans/{tenant}` (PRD §11, ADR-002). Mode
  `TENANT_MODE=single` memakai kontrak yang sama (ADR-001 keputusan 6).
- **Uang = integer rupiah** (`Money`); `float`/`double` dilarang (ADR-002 keputusan 9).
- **Waktu**: `DateTime` (RFC 3339, offset eksplisit) dan `LocalDate` (zona waktu jalur,
  `routes.timezone`, AC-26.4).
- `Idempotency-Key` wajib di semua operasi tulis; opsional hanya pada webhook Midtrans (PRD §10.3/§11).
- Amplop galat selalu `{code, message, details}` dengan `code` dari `ErrorCode` tertutup.
- Pagination seragam: `page` + `per_page` → `{data, meta: PageMeta}`.
- Setiap operasi punya `security`, `x-auth`, dan `x-rbac-scopes`; peran FR-01 ada di `x-rbac-roles`.

## Dipakai konsumen

```ts
import type { components, paths, operations } from '@trailgate/contracts';

type Booking = components['schemas']['Booking'];
type HoldBody = components['schemas']['BookingHoldRequest'];
```

`src/generated/**` tidak boleh disunting manual; jangan menyalin bentuk payload ke app —
ubah `openapi.yaml`, jalankan `generate`, lalu konsumsi tipe hasilnya.
