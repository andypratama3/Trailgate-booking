// Playwright smoke — owner: tg-qa (tests/e2e/** per OWNERS.md).
// Dipakai CI job `e2e` dan `make e2e`. Base URL dari env (default dev web :13000).
import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:13000';

export default defineConfig({
  testDir: '.',
  testMatch: /.*\.spec\.ts/,
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  // Smoke: web publik harus merespons. Setelah T-101/tg-qa menambah spec,
  // job ini gagal bila tes gagal (sesuai AC T-008).
  webServer: process.env.E2E_NO_WEBSERVER
    ? undefined
    : {
        command: 'pnpm --filter @trailgate/web exec next dev -p 13000',
        url: 'http://127.0.0.1:13000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
