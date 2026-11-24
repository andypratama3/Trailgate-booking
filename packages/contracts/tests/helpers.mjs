// Utilitas tes kontrak: memuat openapi.yaml, menyelesaikan $ref, dan menyiapkan validator
// JSON Schema 2020-12 (dialek OpenAPI 3.1) untuk memvalidasi contoh payload.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
export const spec = YAML.parse(readFileSync(join(pkgRoot, 'openapi.yaml'), 'utf8'));

export const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'];
export const WRITE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

/** Semua operasi dalam bentuk datar: {path, method, op, item}. */
export function operations() {
  const out = [];
  for (const [path, item] of Object.entries(spec.paths)) {
    for (const method of HTTP_METHODS) {
      if (item[method]) out.push({ path, method, op: item[method], item });
    }
  }
  return out;
}

/** Ambil nilai di dalam dokumen dari pointer JSON seperti `#/components/schemas/Error`. */
export function get(pointer) {
  return pointer
    .split('/')
    .slice(1)
    .reduce((acc, key) => (acc == null ? acc : acc[key]), spec);
}

/** Selesaikan rantai `$ref` internal (external `$ref` sengaja tidak didukung). */
export function resolveRef(node) {
  let cur = node;
  const seen = new Set();
  while (cur && typeof cur === 'object' && cur.$ref) {
    if (seen.has(cur.$ref)) throw new Error(`$ref melingkar: ${cur.$ref}`);
    seen.add(cur.$ref);
    cur = get(cur.$ref);
    if (cur === undefined) throw new Error(`$ref tak terpecahkan: ${[...seen].pop()}`);
  }
  return cur;
}

/** Parameter operasi + path-item (path-level dulu, sesuai aturan OpenAPI). */
export function paramsOf(op, item) {
  return [...(item.parameters ?? []), ...(op.parameters ?? [])].map(resolveRef);
}

export function securityOf(op) {
  return op.security ?? [];
}

const DOC_ID = 'https://trailgate.local/openapi';
const ajv = new Ajv2020({
  strict: false,
  allErrors: true,
  validateFormats: true,
  allowUnionTypes: true,
});
addFormats(ajv);
// `int64` bukan format JSON Schema bawaan; dipetakan ke integer agar semantik OpenAPI terjaga.
ajv.addFormat('int64', { type: 'number', validate: Number.isInteger });
ajv.addSchema({
  $id: DOC_ID,
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  components: spec.components,
});

const validators = new Map();

/** Validator untuk satu komponen skema, mis. `#/components/schemas/Booking`. */
export function validatorFor(pointer) {
  if (!validators.has(pointer)) {
    validators.set(pointer, ajv.compile({ $ref: `${DOC_ID}${pointer}` }));
  }
  return validators.get(pointer);
}

export function validateAgainst(pointer, value) {
  const validate = validatorFor(pointer);
  const ok = validate(value) === true;
  return { ok, errors: validate.errors ?? [] };
}

/** Nama properti yang wajib memakai skema uang `Money`. */
export const MONEY_PROPERTY = /(amount|price|fee|refund|deposit|balance)$/;
