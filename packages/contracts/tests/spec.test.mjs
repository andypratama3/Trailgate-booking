// Tes kontrak: memvalidasi struktur openapi.yaml sendiri (aturan yang dijanjikan PRD §11,
// ADR-001..005, dan kartu T-006). Gagal di sini = kontrak berubah tanpa ADR.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  spec,
  operations,
  get,
  resolveRef,
  paramsOf,
  securityOf,
  WRITE_METHODS,
  MONEY_PROPERTY,
} from './helpers.mjs';

const WEBHOOK_PATH = '/v1/webhooks/midtrans/{tenant}';

/** x-auth → skema keamanan yang wajib dipakai operasi (OR bila lebih dari satu). */
const AUTH_TO_SECURITY = {
  none: [],
  signed_webhook: [],
  link_token: [{ bookingLinkToken: [] }],
  session: [{ sessionCookie: [] }],
  pos_device: [{ posDeviceToken: [] }],
  platform_admin: [{ platformAdminToken: [] }],
  link_token_or_session: [{ bookingLinkToken: [] }, { sessionCookie: [] }],
};

/** x-auth → peran FR-01 yang boleh memanggil operasi itu. */
const AUTH_TO_ROLES = {
  none: ['anonymous'],
  signed_webhook: ['midtrans_webhook'],
  link_token: ['hiker'],
  session: ['tenant_admin', 'kasir', 'guide'],
  pos_device: ['pos_officer'],
  platform_admin: ['super_admin'],
  link_token_or_session: ['hiker', 'tenant_admin', 'kasir', 'guide'],
};

/** Cakupan §11 PRD → operationId (checklist sekaligus penjaga regresi). */
const PRD_SECTION_11 = {
  Publik: ['listRoutes', 'getRoute', 'getRouteAvailability', 'getRouteStatus'],
  Booking: [
    'createBookingHold',
    'updateBookingMember',
    'payBooking',
    'rescheduleBooking',
    'cancelBooking',
  ],
  Dokumen: ['createDocumentUpload', 'getDocumentUrl'],
  Pembayaran: ['midtransWebhook'],
  Konsol: [
    'listQuotaSlots',
    'listClosures',
    'listDisruptions',
    'listConsoleBookings',
    'getReport',
    'listRules',
  ],
  POS: ['syncPosEvents', 'getPosManifest', 'getPosRevocations'],
  'Super admin': ['listTenants', 'listBillingInvoices'],
};

const DATE_ONLY_NAMES = new Set([
  'from',
  'to',
  'period_start',
  'period_end',
  'effective_from',
  'effective_to',
  'new_date',
]);

const ops = operations();
const byOperationId = new Map(ops.map((o) => [o.op.operationId, o]));

function isDateOnlyName(name) {
  return name === 'date' || name.endsWith('_date') || DATE_ONLY_NAMES.has(name);
}

function walk(node, visit, seen = new Set()) {
  if (node === null || typeof node !== 'object' || seen.has(node)) return;
  seen.add(node);
  if (Array.isArray(node)) {
    for (const item of node) walk(item, visit, seen);
    return;
  }
  visit(node);
  for (const value of Object.values(node)) walk(value, visit, seen);
}

test('OpenAPI 3.1, versi 1.x, semua path ber-prefix /v1', () => {
  assert.equal(spec.openapi, '3.1.0');
  assert.match(spec.info.version, /^1\./, 'info.version harus 1.x (versi v1)');
  for (const path of Object.keys(spec.paths)) {
    assert.match(path, /^\/v1\//, `path harus di bawah /v1: ${path}`);
  }
  const description = spec.info.description;
  assert.match(description, /contracts-first/);
  assert.match(description, /TENANT_MODE=single/, 'TENANT_MODE=single wajib terdokumentasi');
  assert.match(description, /Idempotency-Key/);
  assert.match(description, /\{code, message, details\}/, 'amplop galat standar wajib terdokumentasi');
  assert.match(description, /routes\.timezone/, 'zona waktu jalur wajib disebut (AC-26.4)');
  assert.match(description, /integer rupiah/, 'uang = integer rupiah wajib dinyatakan');
});

test('operationId unik, summary/tags/security/x-auth/x-rbac-scopes wajib ada', () => {
  const ids = new Set();
  const declaredTags = new Set(spec.tags.map((t) => t.name));
  for (const { op, path, method } of ops) {
    const where = `${method.toUpperCase()} ${path}`;
    assert.ok(op.operationId, `${where}: operationId wajib`);
    assert.ok(!ids.has(op.operationId), `operationId duplikat: ${op.operationId}`);
    ids.add(op.operationId);
    assert.ok(op.summary, `${where}: summary wajib`);
    assert.ok(Array.isArray(op.tags) && op.tags.length > 0, `${where}: tags wajib`);
    for (const tag of op.tags) assert.ok(declaredTags.has(tag), `${where}: tag tak terdaftar ${tag}`);
    assert.ok(Array.isArray(op.security), `${where}: security wajib dideklarasikan eksplisit`);
    assert.ok(
      Array.isArray(op['x-rbac-scopes']) && op['x-rbac-scopes'].length > 0,
      `${where}: x-rbac-scopes wajib`,
    );
    assert.ok(op['x-auth'], `${where}: x-auth wajib`);
    assert.ok(op.responses && Object.keys(op.responses).length > 0, `${where}: minimal satu respons`);
  }
});

test('x-auth konsisten dengan skema security operasi', () => {
  for (const { op, path, method } of ops) {
    const where = `${method.toUpperCase()} ${path}`;
    assert.ok(
      Object.hasOwn(AUTH_TO_SECURITY, op['x-auth']),
      `${where}: x-auth tidak dikenal: ${op['x-auth']}`,
    );
    assert.deepEqual(
      securityOf(op),
      AUTH_TO_SECURITY[op['x-auth']],
      `${where}: security harus ${JSON.stringify(AUTH_TO_SECURITY[op['x-auth']])} untuk x-auth=${op['x-auth']}`,
    );
    for (const requirement of securityOf(op)) {
      for (const scheme of Object.keys(requirement)) {
        assert.ok(spec.components.securitySchemes[scheme], `${where}: skema tak terdaftar ${scheme}`);
      }
    }
  }
});

test('scope RBAC terdaftar dan setiap operasi terjangkau oleh peran berwenang', () => {
  const vocabulary = spec['x-rbac-scopes'];
  const roles = spec['x-rbac-roles'];
  assert.ok(vocabulary && roles, 'x-rbac-scopes dan x-rbac-roles wajib ada di root');

  for (const [role, scopes] of Object.entries(roles)) {
    assert.ok(Array.isArray(scopes) && scopes.length > 0, `peran ${role} harus punya scope`);
    for (const scope of scopes) {
      assert.ok(Object.hasOwn(vocabulary, scope), `scope tak dikenal di peran ${role}: ${scope}`);
    }
  }

  for (const { op, path, method } of ops) {
    const where = `${method.toUpperCase()} ${path}`;
    const allowed = AUTH_TO_ROLES[op['x-auth']];
    assert.ok(allowed, `${where}: mapping peran untuk x-auth=${op['x-auth']} belum ada`);
    const granted = new Set(allowed.flatMap((role) => roles[role] ?? []));
    for (const scope of op['x-rbac-scopes']) {
      assert.ok(Object.hasOwn(vocabulary, scope), `${where}: scope tak dikenal ${scope}`);
      assert.ok(granted.has(scope), `${where}: scope ${scope} tidak dimiliki peran ${allowed.join('/')}`);
    }
  }

  // FR-01 AC-01.2 — matriks peran × endpoint yang dituntut eksplisit.
  assert.deepEqual(roles.pos_officer, ['pos.scan'], 'petugas pos hanya boleh endpoint /v1/pos/*');
  assert.ok(!roles.kasir.includes('console.rules.write'), 'kasir tidak boleh mengubah rules (AC-01.2)');
  assert.ok(!roles.kasir.includes('console.quota.write'), 'kasir tidak boleh mengubah kuota');
  for (const [role, scopes] of Object.entries(roles)) {
    if (role === 'super_admin') continue;
    assert.ok(
      scopes.every((s) => !s.startsWith('admin.')),
      `scope admin.* hanya untuk super_admin, bukan ${role}`,
    );
  }
  for (const scope of roles.super_admin) {
    assert.ok(scope.startsWith('admin.'), `super_admin hanya scope lintas-tenant, dapat ${scope}`);
  }
});

test('pagination konsisten: parameter page/per_page + amplop {data, meta}', () => {
  const paginated = ops.filter(({ op }) => op['x-paginated']);
  assert.ok(paginated.length > 0, 'minimal ada operasi ber-paginasi');
  for (const { op, item, path, method } of paginated) {
    const where = `${method.toUpperCase()} ${path}`;
    const names = paramsOf(op, item).map((p) => p.name);
    assert.ok(names.includes('page'), `${where}: parameter page wajib`);
    assert.ok(names.includes('per_page'), `${where}: parameter per_page wajib`);

    const schema = resolveRef(op.responses['200'].content['application/json'].schema);
    assert.equal(schema.properties.data?.type, 'array', `${where}: 200 harus memuat data[]`);
    assert.equal(
      schema.properties.meta?.$ref,
      '#/components/schemas/PageMeta',
      `${where}: meta harus $ref PageMeta`,
    );
    for (const field of ['data', 'meta']) {
      assert.ok(schema.required.includes(field), `${where}: ${field} wajib terdaftar di required`);
    }
  }
});

test('Idempotency-Key terdokumentasi pada semua operasi tulis', () => {
  for (const { op, item, path, method } of ops) {
    if (!WRITE_METHODS.has(method)) continue;
    const where = `${method.toUpperCase()} ${path}`;
    const param = paramsOf(op, item).find((p) => p.name === 'Idempotency-Key' && p.in === 'header');
    assert.ok(param, `${where}: header Idempotency-Key wajib (PRD §10.3/§11)`);
    assert.ok(param.description, `${where}: Idempotency-Key wajib berdeskripsi`);
    if (path === WEBHOOK_PATH) {
      assert.equal(param.required, false, `${where}: webhook dipanggil penyedia; key opsional`);
      assert.match(param.description, /Midtrans/i, `${where}: alasan pengecualian wajib tertulis`);
    } else {
      assert.equal(param.required, true, `${where}: Idempotency-Key wajib (required)`);
    }
  }
});

test('galat terstandar {code, message, details} dan respons 4xx/5xx di semua operasi', () => {
  const error = get('#/components/schemas/Error');
  assert.deepEqual(error.required, ['code', 'message']);
  assert.equal(error.additionalProperties, false, 'Error harus tertutup');
  assert.equal(error.properties.code.$ref, '#/components/schemas/ErrorCode');
  assert.equal(error.properties.message.type, 'string');
  assert.ok(error.properties.details.type.includes('null'), 'details boleh null');

  const codes = new Set(get('#/components/schemas/ErrorCode').enum);
  assert.ok(codes.size > 10, 'ErrorCode harus daftar tertutup');
  assert.ok(codes.has(error.example.code), `contoh code harus ada di enum: ${error.example.code}`);

  const shared = spec.components.responses;
  for (const [name, response] of Object.entries(shared)) {
    assert.equal(
      response.content['application/json'].schema.$ref,
      '#/components/schemas/Error',
      `components.responses.${name} harus memakai skema Error`,
    );
  }

  for (const { op, path, method } of ops) {
    const where = `${method.toUpperCase()} ${path}`;
    const statuses = Object.keys(op.responses);
    assert.ok(statuses.some((s) => s.startsWith('4')), `${where}: wajib punya respons 4xx`);
    assert.ok(statuses.some((s) => s.startsWith('5')), `${where}: wajib punya respons 5xx`);
    for (const status of statuses.filter((s) => /^[45]/.test(s))) {
      const response = resolveRef(op.responses[status]);
      assert.ok(response.description, `${where} ${status}: description wajib`);
      const schema = response.content?.['application/json']?.schema;
      assert.ok(schema, `${where} ${status}: harus punya konten application/json`);
      assert.equal(
        schema.$ref,
        '#/components/schemas/Error',
        `${where} ${status}: skema galat harus $ref Error`,
      );
    }
  }
});

test('uang = integer rupiah, tidak ada float/double (ADR-002 keputusan 9)', () => {
  const money = get('#/components/schemas/Money');
  assert.equal(money.type, 'integer');
  assert.equal(money.format, 'int64');
  assert.equal(money.minimum, 0);
  assert.equal(money['x-money'], true);
  assert.equal(spec['x-money'].representation, 'integer');
  assert.equal(spec['x-money'].currency, 'IDR');

  walk(spec, (node) => {
    assert.notEqual(node.type, 'number', `type: number dilarang untuk uang: ${JSON.stringify(node)}`);
    assert.ok(
      node.format !== 'float' && node.format !== 'double',
      `format float/double dilarang: ${JSON.stringify(node)}`,
    );
  });

  for (const [schemaName, schema] of Object.entries(spec.components.schemas)) {
    for (const [propName, prop] of Object.entries(schema.properties ?? {})) {
      if (!MONEY_PROPERTY.test(propName)) continue;
      assert.equal(
        prop.$ref,
        '#/components/schemas/Money',
        `${schemaName}.${propName} harus $ref Money (integer rupiah)`,
      );
    }
  }
});

test('tanggal/timestamp berformat eksplisit + zona waktu jalur (AC-26.4)', () => {
  const semantics = spec['x-time-semantics'];
  assert.equal(semantics.storage, 'UTC');
  assert.equal(semantics.evaluation, 'route-local');
  assert.equal(semantics.route_timezone_field, 'routes.timezone');
  assert.equal(semantics.reference_timezone, 'Asia/Makassar');

  const dateTime = get('#/components/schemas/DateTime');
  const localDate = get('#/components/schemas/LocalDate');
  const timezone = get('#/components/schemas/Timezone');
  assert.equal(dateTime.format, 'date-time');
  assert.equal(localDate.format, 'date');
  assert.match(dateTime.description, /routes\.timezone/);
  assert.match(localDate.description, /routes\.timezone/);
  assert.equal(timezone.example, semantics.reference_timezone, 'contoh zona harus sama dengan referensi');

  for (const [schemaName, schema] of Object.entries(spec.components.schemas)) {
    for (const [propName, prop] of Object.entries(schema.properties ?? {})) {
      const resolved = resolveRef(prop);
      if (propName.endsWith('_at')) {
        if (propName === 'verified_at') {
          // Tanggal verifikasi aturan = tanggal kalender (PRD §6.1), bukan timestamp.
          assert.equal(resolved.format, 'date', `${schemaName}.${propName} harus tanggal (LocalDate)`);
          continue;
        }
        assert.ok(
          resolved.type.includes('string') && resolved.format === 'date-time',
          `${schemaName}.${propName} harus RFC 3339 date-time`,
        );
      }
      if (isDateOnlyName(propName)) {
        assert.equal(resolved.format, 'date', `${schemaName}.${propName} harus LocalDate`);
      }
    }
  }

  for (const { op, item, path, method } of ops) {
    for (const param of paramsOf(op, item)) {
      if (!isDateOnlyName(param.name) && !param.name.endsWith('_at')) continue;
      const resolved = resolveRef(param.schema);
      const expected = param.name.endsWith('_at') ? 'date-time' : 'date';
      assert.equal(
        resolved.format,
        expected,
        `${method.toUpperCase()} ${path}: parameter ${param.name} harus format ${expected}`,
      );
    }
  }
});

test('tenant di-resolve dari host/token, bukan path (kecuali webhook Midtrans)', () => {
  const tenancy = spec['x-tenancy'];
  assert.ok(tenancy, 'x-tenancy wajib ada');
  assert.equal(tenancy.path_parameter, false, 'tenant tidak boleh jadi path parameter');
  assert.match(tenancy.resolution, /host|token/);
  assert.deepEqual(tenancy.path_exceptions, [WEBHOOK_PATH]);
  assert.match(tenancy.modes.single, /TENANT_MODE=single/, 'mode single wajib terdokumentasi (ADR-001)');
  assert.match(tenancy.modes.saas, /global scope|tenant_id/, 'mode saas wajib menjelaskan scope (ADR-001)');

  for (const path of Object.keys(spec.paths)) {
    if (!path.includes('{tenant}')) continue;
    assert.ok(
      tenancy.path_exceptions.includes(path),
      `path dengan {tenant} harus tercantum di x-tenancy.path_exceptions: ${path}`,
    );
  }
  assert.match(spec.info.description, /Host/, 'info.description wajib menyebut resolusi via Host header');
});

test('cakupan PRD §11 terpetakan ke operasi di spec', () => {
  const missing = [];
  for (const [row, operationIds] of Object.entries(PRD_SECTION_11)) {
    for (const operationId of operationIds) {
      if (!byOperationId.has(operationId)) missing.push(`${row} → ${operationId}`);
    }
  }
  assert.deepEqual(missing, [], `operasi PRD §11 hilang: ${missing.join(', ')}`);

  // Endpoint tambahan di luar §11 yang dipakai AC lain (FR-35 alert, FR-01 tenant admin).
  for (const operationId of ['subscribeRouteAlert', 'getTenant', 'updateTenant']) {
    assert.ok(byOperationId.has(operationId), `operasi pendukung hilang: ${operationId}`);
  }
});

test('TenantType mengikuti PRD §4.1; SaaS/template adalah mode delivery, bukan tipe', () => {
  assert.deepEqual(get('#/components/schemas/TenantType').enum, [
    'managed_basecamp',
    'trek_operator',
    'official_link',
    'white_label_authority',
  ]);
  assert.equal(spec['x-tenancy'].tenant_type_field, 'tenants.type');
  assert.equal(spec['x-tenancy'].tenant_types_source, '#/components/schemas/TenantType');
  assert.match(spec['x-tenancy'].delivery_modes_note, /bukan tipe tenant/);
});

test('tidak ada scope peran yang mati dan field internal tidak bocor ke API', () => {
  const usedScopes = new Set(ops.flatMap(({ op }) => op['x-rbac-scopes']));
  for (const [role, scopes] of Object.entries(spec['x-rbac-roles'])) {
    for (const scope of scopes) {
      assert.ok(usedScopes.has(scope), `scope ${scope} pada peran ${role} tidak dipakai operasi mana pun`);
    }
  }
  assert.ok(
    !('object_key' in get('#/components/schemas/Document').properties),
    'object_key adalah field internal — tidak boleh muncul di respons API',
  );
});

test('batas rentang availability 62 hari dinyatakan di skema dan di 422', () => {
  assert.equal(get('#/components/schemas/AvailabilityResponse').properties.days.maxItems, 62);
  const entry = byOperationId.get('getRouteAvailability');
  assert.match(entry.op.responses['422'].description, /62 hari/);
});
