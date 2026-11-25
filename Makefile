# Makefile — target lokal yang mencerminkan pipeline CI.
# Port: MYSQL_PORT=33061 REDIS_PORT=63791 (host 3306/6379 sudah dipakai) — docker-compose.override.yml.
# Jalankan penuh: `make ci` (compose + semua check). Tanpa compose: `make pint phpstan test typecheck lint-web audit`.
# Alat pemindai (gitleaks/semgrep/playwright) tidak terpasang di host → target terkait
# skip dengan penanda `SKIP-FAIL-SAFE: <tool>` (job setara jalan di GHA; runner tidak tersedia di env ini).
# Jalankan `make ci-strict` untuk menggagalkan CI bila tool pemindai absen (mis. untuk gate rilis).

API_DIR  := apps/api
WEB_DIR  := apps/web
POS_DIR  := apps/pos

# Gitleaks image dipin digest (ADR-006 §3, F1B-5) — update digest via docker manifest inspect.
GITLEAKS_IMAGE := ghcr.io/gitleaks/gitleaks@sha256:5d0147dc25c78f8cc2b9861ff8f5c9b4a41419ed60a9ce2217de5a215270b42b

export COMPOSER_ALLOW_SUPERUSER ?= 1

# --- services (docker compose untuk mysql + redis) ---
.PHONY: services services-down
services:
	docker compose -f docker-compose.yml -f docker-compose.override.yml up -d mysql redis

services-down:
	docker compose -f docker-compose.yml -f docker-compose.override.yml down

# --- API ---
# pint — preset default, exclude bootstrap/cache (apps/api/pint.json)
.PHONY: pint
pint:
	cd $(API_DIR) && vendor/bin/pint --test

# phpstan — level 5 disepakati ADR-006 §2
.PHONY: phpstan
phpstan:
	cd $(API_DIR) && vendor/bin/phpstan analyse --no-progress --memory-limit=1G

# test — PHPUnit (APP_ENV=testing via .env.testing)
.PHONY: test
test:
	cd $(API_DIR) && php artisan test

# --- frontend ---
# typecheck — tsc --noEmit untuk web + pos + contracts (script "typecheck" di tiap package)
.PHONY: typecheck
typecheck:
	pnpm run typecheck

# lint-web — ESLint 9 flat config (apps/web/eslint.config.mjs)
.PHONY: lint-web
lint-web:
	cd $(WEB_DIR) && pnpm exec eslint app/ --max-warnings 0

# --- audit ---
# Level disepakati: gagal pada advisory 'moderate' ke atas (pnpm: --audit-level moderate;
# composer: audit-level default = semua advisory, fail bila ada). Sama dengan job CI.
.PHONY: audit audit-composer audit-npm
audit: audit-composer audit-npm

audit-composer:
	cd $(API_DIR) && composer audit --no-interaction

audit-npm:
	cd $(WEB_DIR) && pnpm audit --prod --audit-level moderate
	cd $(POS_DIR) && pnpm audit --prod --audit-level moderate

# --- secret scan ---
# Gitleaks image dipin digest; config path+commit-scoped. Host tanpa gitleaks →
# image docker (pin digest). Keduanya absen → `SKIP-FAIL-SAFE` + exit 0 (lokal),
# ATAU exit 1 saat CI_STRICT=1 (`make ci-strict`). Flag ini DIBACA di sini.
.PHONY: secret-scan
secret-scan:
	@if command -v gitleaks >/dev/null 2>&1; then \
		gitleaks detect --config .github/secret-scan/gitleaks.toml --no-banner --redact --verbose; \
	elif docker image inspect $$(echo $(GITLEAKS_IMAGE) | cut -d@ -f1-2) >/dev/null 2>&1 || \
	     docker pull $(GITLEAKS_IMAGE) >/dev/null 2>&1; then \
		docker run --rm -v "$$PWD:/repo" -w /repo \
			$(GITLEAKS_IMAGE) detect \
			--config .github/secret-scan/gitleaks.toml --no-banner --redact --verbose; \
	elif [ "$${CI_STRICT:-0}" = "1" ]; then \
		echo "STRICT: gitleaks missing — ci-strict gagal"; exit 1; \
	else \
		echo "SKIP-FAIL-SAFE: gitleaks (tidak tersedia di host, job setara jalan di CI)"; \
	fi

# --- security_scan ---
# Semgrep: exit code dipertahankan (REG-1) — perintah terakhir di cabang, tanpa
# echo di belakangnya yang menelan exit. `--error` agar temuan (bukan hanya error
# mesin) menggagalkan make/CI (F-1). CI_STRICT=1 → tool absen = exit 1.
.PHONY: security-scan
security-scan:
	@if command -v semgrep >/dev/null 2>&1; then \
		semgrep --config auto --json --output /tmp/semgrep-report.json --error $(API_DIR)/app $(WEB_DIR)/app; \
	elif [ "$${CI_STRICT:-0}" = "1" ]; then \
		echo "STRICT: semgrep missing — ci-strict gagal"; exit 1; \
	else \
		echo "SKIP-FAIL-SAFE: semgrep (tidak tersedia di host, job setara jalan di CI)"; \
	fi

# --- token pipeline (T-010, co-owner tg-devops) ---
# Spec: docs/ux/token-pipeline.md §7.
.PHONY: tokens
tokens:
	pnpm -C packages/design-tokens build
	git diff --exit-code packages/design-tokens/css

.PHONY: tokens-check
tokens-check:
	node packages/design-tokens/scripts/check-doc-parity.mjs
	node packages/design-tokens/scripts/check-no-hardcode.mjs
	node docs/ux/contrast-check.mjs
	node docs/ux/compare-tailwind-v4.mjs

.PHONY: tokens-budget
tokens-budget:
	pnpm --filter @trailgate/web build
	pnpm -C packages/design-tokens budget:require-app

# --- contracts (T-006, co-owner) ---
# Kontrak OpenAPI: validate, generate:check (drift), test (node --test), typecheck.
.PHONY: contracts
contracts:
	pnpm -C packages/contracts validate
	pnpm -C packages/contracts generate:check
	pnpm -C packages/contracts test
	pnpm -C packages/contracts typecheck

# --- playwright e2e smoke ---
# tests/e2e kosong (hook tg-qa/T-101). 0 spec → pass; setelah spec ada, kegagalan gagal.
.PHONY: e2e
e2e:
	@if [ -n "$$(find tests/e2e -name '*.spec.ts' 2>/dev/null)" ]; then \
		pnpm exec playwright test --config=tests/e2e/playwright.config.ts; \
	else \
		echo "SKIP-FAIL-SAFE: e2e (0 spec — placeholder, hook T-101)"; \
	fi

# --- tenant isolation (T-101 hook) ---
# placeholder eksplisit — belum ada tes; setelah T-101 ganti recipe ini dengan php artisan test --filter=TenantIsolation
.PHONY: tenant-isolation
tenant-isolation:
	@echo "placeholder eksplisit — belum ada tes; setelah T-101 ganti recipe ini dengan php artisan test --filter=TenantIsolation"
	@exit 0

# --- docker compose config (verifikasi) ---
.PHONY: compose-validate
compose-validate:
	docker compose -f docker-compose.yml config -q
	docker compose -f docker-compose.yml -f docker-compose.override.yml config -q
	@echo "compose-validate: OK"

# --- full CI (tanpa runner GHA) ---
# Urutan mengikuti job CI. Secret scan via image docker (pin digest).
.PHONY: ci
ci: compose-validate tokens tokens-check tokens-budget pint phpstan test typecheck lint-web audit contracts secret-scan security-scan e2e tenant-isolation
	@echo "=== CI local run complete ==="

.PHONY: ci-strict
ci-strict:
	@CI_STRICT=1 $(MAKE) ci; code=$$?; \
	if [ "$$code" -ne 0 ]; then \
		echo "ci-strict FAILED (exit $$code)"; exit $$code; \
	else \
		echo "=== CI strict run complete (all checks passed) ==="; \
	fi

.PHONY: help
help:
	@echo "services | services-down | pint | phpstan | test | typecheck | lint-web |"
	@echo "audit | secret-scan | security-scan | tokens | tokens-check | tokens-budget |"
	@echo "contracts | e2e | tenant-isolation | compose-validate | ci | ci-strict | help"
