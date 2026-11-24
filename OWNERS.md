# OWNERS — peta path → agent pemilik

`owner_agent` pada setiap temuan **diturunkan dari peta ini oleh Orchestrator**, bukan ditebak reviewer.
Satu owner per path. Reviewer tidak boleh mengedit file owner.

```
apps/api/database/migrations/**        tg-data
apps/api/database/seeders/packs/**     tg-domain
apps/api/database/**  (sisa setelah migrations/** dan seeders/packs/**)  tg-data
apps/api/app/Domain/**                 tg-backend
apps/api/app/Integrations/**           tg-integrations
apps/api/routes/**                     tg-backend
apps/web/app/(public)/**               tg-web
apps/web/app/(console)/**              tg-console
apps/pos/**                            tg-console
packages/contracts/**                  tg-architect
packages/design-tokens/**              tg-ux
packages/ui/**                         tg-ux
docs/prd/** docs/requirements/**       tg-analyst
docs/adr/**                            tg-architect
docs/domain/**                         tg-domain
docs/ux/**                             tg-ux
docs/qa/** tests/e2e/** tests/load/**  tg-qa
docs/security/** tests/security/**     tg-security
.github/** infra/** docker/**          tg-devops
docs/api/** docs/runbooks/** docs/guides/**  tg-docs
docs/board/**  (kecuali audit/**)                     orchestrator
docs/board/audit/**                    tg-auditor
```


Reviewer mesin tidak memiliki path tulis: `tg-ocr` (skill `open-code-review`) mengeluarkan ReviewReport
ke Orchestrator; `tg-reviewer` juga tanpa hak tulis. Laporan audit verifier = `docs/board/audit/**` (tg-auditor).

## Path infra yang tidak terdaftar di PRD §16.4 (keputusan Orchestrator)

```
apps/api/app/**        (sisa setelah app/Domain/** dan app/Integrations/**)     tg-backend
apps/api/tests/**                                                              tg-backend
apps/api/config/**  apps/api/bootstrap/**  apps/api/*.json  apps/api/*.xml     tg-devops
apps/web/**            (sisa setelah (public)/** dan (console)/**)             tg-web
docker-compose*.yml, Makefile, *.mk, .gitignore, .dockerignore, README.md, .env.example, .env.testing  (root)  tg-devops
package.json, pnpm-workspace.yaml, pnpm-lock.yaml, tsconfig*.json                     (root)  tg-devops
apps/api/**  (sisa setelah baris di atas: artisan, vite.config.js, composer.lock,        tg-devops
              resources/**, public/**, dotfiles; BUKAN app/Domain|Integrations, database/**, config/**)
.omp/**  AGENTS.md  OWNERS.md                                                  orchestrator
PROMPT.md (dihapus saat bootstrap → isi pindah ke docs/prd/PRD.md yang tetap milik tg-analyst)   orchestrator
```
Alasan: §16.4 hanya memetakan path produk; file build/runtime dasar perlu owner eksplisit agar auditor
tidak menandai commit tanpa pemilik. Perubahan memerlukan ADR bila menyentuh path yang sudah dipetakan.
