// Titik masuk konsumen (@trailgate/web, @trailgate/pos, apps/api).
// Semua tipe di bawah berasal dari src/generated/openapi.d.ts (hasil `pnpm generate`).
// JANGAN menyunting src/generated/** secara manual dan JANGAN menyalin bentuk payload di app.
export type { paths, components, operations, webhooks, $defs } from './generated/openapi.js';
