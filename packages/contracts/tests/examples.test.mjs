// Tes kontrak: menjalankan validator (JSON Schema 2020-12, dialek OpenAPI 3.1) terhadap
// contoh payload yang ada di openapi.yaml, dan memastikan payload yang melanggar aturan
// benar-benar ditolak. Contoh hidup di `components.schemas.*.example` supaya ada satu
// sumber contoh untuk dokumentasi dan tes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { get, resolveRef, operations, validateAgainst } from './helpers.mjs';

const CORE_OPERATION_IDS = new Set([
  // PRD §11
  'listRoutes',
  'getRoute',
  'getRouteAvailability',
  'getRouteStatus',
  'createBookingHold',
  'updateBookingMember',
  'payBooking',
  'rescheduleBooking',
  'cancelBooking',
  'createDocumentUpload',
  'getDocumentUrl',
  'midtransWebhook',
  'listQuotaSlots',
  'listClosures',
  'listDisruptions',
  'listConsoleBookings',
  'getReport',
  'listRules',
  'syncPosEvents',
  'getPosManifest',
  'getPosRevocations',
  'listTenants',
  'listBillingInvoices',
  // pendukung AC lain: update kuota/closure/rules/booking, alert FR-35, tenant admin
  'updateQuotaSlot',
  'createClosure',
  'updateClosure',
  'resolveDisruption',
  'getConsoleBooking',
  'createRule',
  'updateRule',
  'subscribeRouteAlert',
  'createTenant',
  'getTenant',
  'updateTenant',
  'createTenant',
]);

const ops = operations();

function exampleOf(mediaType) {
  if (mediaType.example !== undefined) return mediaType.example;
  const resolved = resolveRef(mediaType.schema);
  return resolved.example;
}

/** Kumpulan contoh per operasi: request body dan respons 2xx ber-JSON. */
function exampleCases(op) {
  const cases = [];
  for (const [contentType, mediaType] of Object.entries(
    op.requestBody?.content ?? {},
  )) {
    cases.push({
      kind: 'request',
      contentType,
      pointer: mediaType.schema.$ref,
      value: exampleOf(mediaType),
    });
  }
  for (const [status, response] of Object.entries(op.responses)) {
    if (!status.startsWith('2')) continue;
    const mediaType = response.content?.['application/json'];
    if (!mediaType) continue;
    cases.push({
      kind: 'response',
      status,
      contentType: 'application/json',
      pointer: mediaType.schema.$ref,
      value: exampleOf(mediaType),
    });
  }
  return cases;
}

test('setiap operasi tulis/menghasilkan JSON punya contoh request/response yang valid', () => {
  for (const { op, path, method } of ops) {
    const where = `${method.toUpperCase()} ${path} (${op.operationId})`;
    const cases = exampleCases(op);

    if (op.requestBody) {
      assert.ok(
        cases.some((c) => c.kind === 'request' && c.value !== undefined),
        `${where}: contoh request wajib ada`,
      );
    }
    const jsonSuccess = Object.keys(op.responses).filter((s) => s.startsWith('2'));
    if (jsonSuccess.length > 0) {
      assert.ok(
        cases.some((c) => c.kind === 'response' && c.value !== undefined),
        `${where}: contoh respons 2xx wajib ada`,
      );
    }

    for (const c of cases) {
      if (c.value === undefined) continue;
      assert.ok(c.pointer, `${where}: skema ${c.kind} harus $ref komponen bernama`);
      const { ok, errors } = validateAgainst(c.pointer, c.value);
      assert.ok(
        ok,
        `${where}: contoh ${c.kind} ${c.status ?? ''} gagal validasi terhadap ${c.pointer}\n${JSON.stringify(errors, null, 2)}`,
      );
    }
  }
});

test('setiap endpoint inti punya contoh request (bila ada body) dan respons', () => {
  for (const operationId of CORE_OPERATION_IDS) {
    const entry = ops.find(({ op }) => op.operationId === operationId);
    assert.ok(entry, `operasi inti tidak ada: ${operationId}`);
    const cases = exampleCases(entry.op);
    if (entry.op.requestBody) {
      assert.ok(
        cases.some((c) => c.kind === 'request' && c.value !== undefined),
        `${operationId}: contoh request wajib ada`,
      );
    }
    assert.ok(
      cases.some((c) => c.kind === 'response' && c.value !== undefined),
      `${operationId}: contoh respons wajib ada`,
    );
  }
});

test('contoh galat (Error) valid dan contoh bersama komponen lain konsisten', () => {
  const error = get('#/components/schemas/Error');
  assert.ok(validateAgainst('#/components/schemas/Error', error.example).ok);
  for (const [name, schema] of Object.entries(get('#/components/schemas'))) {
    if (schema.example === undefined || schema.type === 'string' || schema.type === 'integer') continue;
    const { ok, errors } = validateAgainst(`#/components/schemas/${name}`, schema.example);
    assert.ok(ok, `contoh ${name} gagal validasi: ${JSON.stringify(errors)}`);
  }
});

test('payload yang melanggar aturan ditolak validator', () => {
  const validHold = get('#/components/schemas/BookingHoldRequest').example;
  const validEvent = get('#/components/schemas/PosEvent').example;

  const invalidCases = [
    {
      pointer: '#/components/schemas/Error',
      why: 'kode galat di luar daftar tertutup',
      payload: { code: 'teapot', message: 'Tidak ada kopi.' },
    },
    {
      pointer: '#/components/schemas/Error',
      why: 'message bukan string',
      payload: { code: 'not_found', message: 42 },
    },
    {
      pointer: '#/components/schemas/Error',
      why: 'field di luar {code, message, details}',
      payload: { code: 'not_found', message: 'x', extra: true },
    },
    { pointer: '#/components/schemas/Money', why: 'rupiah pecahan', payload: 350000.5 },
    { pointer: '#/components/schemas/Money', why: 'rupiah negatif', payload: -1 },
    { pointer: '#/components/schemas/LocalDate', why: 'urutan tanggal salah', payload: '31-12-2026' },
    {
      pointer: '#/components/schemas/DateTime',
      why: 'timestamp tanpa offset eksplisit',
      payload: '2026-12-31 01:00:00',
    },
    { pointer: '#/components/schemas/Timezone', why: 'bukan zona IANA', payload: 'WITA' },
    {
      pointer: '#/components/schemas/BookingHoldRequest',
      why: 'party_size melampaui batas kontrak',
      payload: { ...validHold, party_size: 31 },
    },
    {
      pointer: '#/components/schemas/BookingHoldRequest',
      why: 'ketua tanpa nomor identitas',
      payload: { ...validHold, leader: { ...validHold.leader, identity_number: undefined } },
    },
    { pointer: '#/components/schemas/QuotaUpdateRequest', why: 'kapasitas negatif', payload: { capacity: -1 } },
    {
      pointer: '#/components/schemas/PosSyncRequest',
      why: 'batch kosong',
      payload: { device_id: 'pos-sembalun-01', events: [] },
    },
    {
      pointer: '#/components/schemas/PosEvent',
      why: 'client_event_id bukan UUID',
      payload: { ...validEvent, client_event_id: 'bukan-uuid' },
    },
    {
      pointer: '#/components/schemas/DocumentCreateRequest',
      why: 'jenis dokumen di luar daftar',
      payload: {
        type: 'vaccine_card',
        filename: 'kartu.pdf',
        content_type: 'application/pdf',
        size_bytes: 1024,
      },
    },
    {
      pointer: '#/components/schemas/DocumentCreateRequest',
      why: 'content_type tidak diizinkan',
      payload: {
        type: 'health_cert',
        filename: 'surat.txt',
        content_type: 'text/plain',
        size_bytes: 1024,
      },
    },
    {
      pointer: '#/components/schemas/RequirementRule',
      why: 'rule tanpa source_url (PRD §6.1)',
      payload: {
        id: 1,
        scope: 'route',
        type: 'guide_ratio',
        params: { max_hikers_per_guide: 4 },
        severity: 'block',
        verified_at: '2026-11-01',
        effective_from: '2026-11-01',
      },
    },
    {
      pointer: '#/components/schemas/MidtransNotification',
      why: 'signature_key bukan 128 hex',
      payload: {
        order_id: 'TG-7QK2M9',
        status_code: '200',
        gross_amount_raw: '350000.00',
        transaction_status: 'settlement',
        signature_key: 'tidak-valid',
      },
    },
    {
      pointer: '#/components/schemas/MidtransNotification',
      why: 'transaction_status tak dikenal',
      payload: {
        order_id: 'TG-7QK2M9',
        status_code: '200',
        gross_amount_raw: '350000.00',
        transaction_status: 'sukses-banget',
        signature_key: '8f14e45fceea167a5a36dedd4bea2543',
      },
    },
    {
      pointer: '#/components/schemas/MemberUpdateRequest',
      why: 'email tidak valid',
      payload: { email: 'bukan-email' },
    },
    { pointer: '#/components/schemas/MemberUpdateRequest', why: 'payload kosong', payload: {} },
    {
      pointer: '#/components/schemas/ClosureCreateRequest',
      why: 'closure tanpa sumber surat resmi',
      payload: {
        route_slug: 'rinjani-sembalun',
        starts_at: '2026-12-01T00:00:00+08:00',
        mode: 'block_new_bookings',
        reason: 'Karhutla.',
      },
    },
    {
      pointer: '#/components/schemas/PageMeta',
      why: 'total negatif',
      payload: { page: 1, per_page: 20, total: -1, total_pages: 1 },
    },
  ];

  for (const { pointer, why, payload } of invalidCases) {
    const { ok, errors } = validateAgainst(pointer, payload);
    assert.equal(
      ok,
      false,
      `payload seharusnya ditolak (${pointer}): ${why} — payload=${JSON.stringify(payload)}`,
    );
    assert.ok(errors.length > 0, `validator harus melaporkan galat: ${pointer} (${why})`);
  }
});
