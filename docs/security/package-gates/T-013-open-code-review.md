# T-013 — Gate paket: `@alibaba-group/open-code-review` (CLI `ocr`)

| | |
|---|---|
| Paket ter-pin | `@alibaba-group/open-code-review@1.14.3` |
| Verdict | **approve** |
| Risk level | **medium** |
| Pemilik gate | tg-security |
| Kartu | `docs/board/tasks/T-013.yml` (acceptance: keputusan tertulis + catatan global-install + aliran data + larangan kredensial di repo) |
| Seat pemakai | `tg-ocr` (`.omp/agents/tg-ocr.md`, reviewer mesin, tanpa hak tulis) |
| Tanggal review | 2026-11-25 |

## 1. Ringkasan

CLI AI code-review yang dipakai seat reviewer read-only: `ocr review` membaca diff git lokal,
mengirim perubahan ke provider LLM yang dikonfigurasi pengguna, lalu menulis output laporan
(mis. `--output /tmp/ocr_out.txt`). Tidak menyentuh runtime aplikasi trailGate, tidak masuk
`pnpm-lock.yaml`/`package.json` produk.

Metadata paket (npm registry):

- license: `Apache-2.0`; maintainers: `lizhengfeng.lzf`, `ninan.nn` (`@alibaba-inc.com`)
- `dependencies`: **tidak ada**; `optionalDependencies`: 6 paket binary per-platform
  (`@alibaba-group/ocr-{linux,darwin,win32}-{x64,arm64}@1.14.3`)
- `bin.ocr` → `bin/ocr.js`; `engines.node >= 14` (host: node v22.23.5 — OK)
- cadence rilis cepat: 144 versi sejak 2026-05-21 → alasan pin eksak

## 2. Bukti provenance / integritas

| Item | Nilai | Verifikasi |
|---|---|---|
| Tarball `open-code-review-1.14.3.tgz` sha512 | `a133b0d0869f071be34eae416961d25fb8cde0b1ad104c055083dfd2e55b1f8b5ba5b5314a1ddd5b0b10ad987107f01dfcad5354de19743779b809be704ce1f8` | **cocok persis** dengan digest pada SLSA provenance attestation npm (`.../-/npm/v1/attestations/@alibaba-group%2Fopen-code-review@1.14.3`) |
| Tarball sha1 | `535847aa81d2bc2bf51d1641c54be8fbcb7b8191` | cocok dengan `dist.shasum` registry |
| Attestation | `@slsa.dev/provenance/v1` + `npm/attestation publish/v0.1` | builder `github.com/actions/runner/github-hosted`, source `github.com/alibaba/open-code-review`, ref `refs/tags/v1.14.3`, workflow `release.yml`, commit `f6379f71edba1e59dbc056e8f455df1f84396498` |
| Publishing | npm **trusted publisher** OIDC (`_npmUser: GitHub Actions`) | tidak ada token publish manual |
| Binary platform `@alibaba-group/ocr-linux-x64@1.14.3` | `dist.integrity` sha512 `Zy+8ICSP0hgGONlEMiuQ01DieO26sIY3hobuHkTYE7rhk54chjm541/n3ogow20TrgqS+vnwFy6J/GDK+ESXug==` | punya SLSA v1 + publish attestation, source repo/tag sama |
| Binary `package/bin/opencodereview` | ELF 64-bit x86-64, Go, statically linked, stripped, 62.423.202 byte, sha256 `17ee32cdf0af6c006a199d758defb6c2abe05ec5b4d164df3a703c0208d5155e` | **identik** dengan aset `opencodereview-linux-amd64` di GitHub Release `v1.14.3/sha256sum.txt` (byte-size sama) |

Kesimpulan: binary yang dieksekusi berasal dari source publik pada tag tertag, dibangun GitHub
Actions, dan hash-nya dapat diverifikasi silang dari tiga kanal independen (npm attestation,
npm integrity paket platform, checksum GitHub Release).

## 3. Supply chain saat install

- `postinstall: node scripts/install.js` — hanya mengunduh binary native bila paket platform
  tidak tersedia; unduhan lewat HTTPS dari GitHub Releases (`package.json` `ocrConfig.urlPattern`)
  dan **diverifikasi sha256** terhadap `sha256sum.txt` sebelum dipakai; gagal → binary dihapus
  dan install gagal (`scripts/install.js:160-165`, `:198-251`).
- Tidak ada dependency npm transiitif → permukaan supplai terbatas pada 1 launcher JS + 1 binary Go.
- Tidak ada rahasia tertanam: pemindaian pola `sk-*`, `sk-ant-*`, `sk-proj-*`, `AIza*`, `AKIA*`,
  `ghp_*` pada seluruh file paket dan `strings` binary → **bersih**.
- Binary tidak memuat endpoint telemetri/vendor Alibaba; host yang muncul hanya endpoint provider
  LLM (mis. `api.anthropic.com`, `api.openai.com`, `dashscope.aliyuncs.com`) — semuanya
  user-configured.

## 4. Temuan utama (P1): self-upgrade otomatis tanpa persetujuan

`bin/ocr.js:89-110` — setiap invokasi `ocr` (tanpa `OCR_NO_UPDATE`) menjalankan
`scripts/update.js` sebagai child `detached` (cooldown 18 menit, dapat diubah lewat
`OCR_UPDATE_INTERVAL`). `scripts/update.js:152-159` — bila ada versi lebih baru di registry,
CLI menjalankan:

```
npm i -g @alibaba-group/open-code-review@<latest>
```

Artinya binary native baru dapat terpasang dan dieksekusi tanpa gate Security — jalur
supply-chain yang melewati keputusan ini. **Mitigasi wajib (kondisi 2): `OCR_NO_UPDATE=1`.**
Temuan ini juga memaksa pin eksak (kondisi 1) dan re-gate pada perubahan versi (kondisi 6).

## 5. Data yang dikirim ke provider LLM

- Yang dikirim: **diff git** + isi file yang dibaca agent lewat tool (`file_read`,
  `file_read_diff`, `file_find`, `code_search`). Hanya via HTTPS ke endpoint provider aktif.
- Tool agent **read-only** dan menolak path rahasia: `.env`/`.env.*`, `.netrc`, `.npmrc`,
  `.pypirc`, `credentials`, `id_rsa*`, `id_ed25519*`, `*.pem|key|p12|pfx`, `.git-credentials`,
  `.docker/config.json`, `.ssh/.aws/.gnupg` (`internal/behaviortask/code.go:133-147`,
  `internal/config/allowlist/secret_path.go:71`).
- Penulisan hanya ke `~/.opencodereview/` (config, sessions, transcript) —
  `internal/session/persist.go:24,119`, `internal/session/list.go:109`; repo yang direview
  tidak ditulis.
- Telemetry OpenTelemetry **default OFF** (`internal/telemetry/config.go:34 Enabled: false`),
  tanpa endpoint default; bila diaktifkan hanya ekspor shape (counter/histogram/span attribute),
  **tidak pernah prompt/isi kode** (`docs telemetry: "never the actual prompts or responses"`).
  `telemetry.content_logging` masih reserved/no-op; `OCR_RAW_LOGGING=1` (default off) menulis
  body request/response mentah ke `~/.opencodereview/raw/` → jangan diaktifkan.
- `mcp_servers` dapat dikonfigurasi (binary ter-link MCP SDK) → bila diaktifkan, kode bisa
  dikirim ke MCP server arbitrer → jangan dikonfigurasi.

## 6. Kondisi operasional (wajib, apa adanya)

1. Install **hanya global di host** dengan versi ter-pin eksak:
   `npm i -g @alibaba-group/open-code-review@1.14.3`. **Dilarang** masuk workspace,
   `package.json`, `.npmrc`, atau `pnpm-lock.yaml`.
2. Set `OCR_NO_UPDATE=1` pada environment seat `tg-ocr` (matikan self-upgrade `npm i -g @latest`).
   Upgrade versi berikutnya wajib melalui re-gate Security.
3. Telemetry tetap OFF: jangan set `OCR_ENABLE_TELEMETRY` / `telemetry.enabled`,
   dan jangan set `OCR_RAW_LOGGING=1`.
4. Provider LLM wajib disetujui Security (dan persetujuan Andy untuk repo privat);
   jangan mengirim diff berisi data pendaki/PII ke provider yang belum disetujui.
   Preferens: endpoint self-host/lokal (mis. Ollama) atau provider yang sudah lulus gate.
5. Jangan mengonfigurasi `mcp_servers` untuk `ocr`.
6. Re-gate bila versi berubah, maintainer/publisher berubah, atau ada peristiwa
   supply-chain (mis. advisory pada paket).
7. Kredensial OCR (API key/token) **tidak boleh** disimpan di repo, log, atau fixture
   (AGENTS.md #11); gunakan env var host atau `~/.opencodereview/config.json` dengan izin
   file ketat, di luar repo.

## 7. Status implementasi

- **Gate Security: SELESAI** — keputusan approve + kondisi tertulis di artefak ini.
- **Install global ter-pin: BELUM dilakukan oleh tg-security.** Install dilakukan Orchestrator
  setelah artefak ini (lihat commit). Bukti prasyarat saat review: `ocr` belum ada di PATH
  (`which ocr` kosong) dan `~/.opencodereview/` belum ada.
- **Provider LLM: BELUM dikonfigurasi** (tidak ada key di environment). Wajib persetujuan Andy
  sebelum dipakai pada repo privat — lihat acceptance `docs/board/tasks/T-013.yml` butir 3.
- **Seat `tg-ocr`: belum dapat dijalankan** sampai dua butir di atas terpenuhi.

## 8. Repro (untuk auditor)

```bash
# metadata + provenance
curl -s https://registry.npmjs.org/@alibaba-group%2Fopen-code-review/1.14.3 | jq '{license,maintainers,optionalDependencies,scripts,dist}'
curl -s "https://registry.npmjs.org/-/npm/v1/attestations/@alibaba-group%2Fopen-code-review@1.14.3" \
  | jq -r '.attestations[1].bundle.dsseEnvelope.payload' | base64 -d | jq '.predicateType,.subject'
# integritas tarball (harus == sha512 attested di atas)
curl -sO https://registry.npmjs.org/@alibaba-group/open-code-review/-/open-code-review-1.14.3.tgz && sha512sum open-code-review-1.14.3.tgz
# binary platform == aset GitHub Release
curl -sO https://registry.npmjs.org/@alibaba-group/ocr-linux-x64/-/ocr-linux-x64-1.14.3.tgz
tar xzf ocr-linux-x64-1.14.3.tgz && sha256sum package/bin/opencodereview
curl -sL https://github.com/alibaba/open-code-review/releases/download/v1.14.3/sha256sum.txt
```

Catatan: pemeriksaan di atas dijalankan read-only di `/tmp`; tidak ada file repo yang diubah
selain artefak ini (tanpa `git commit`).
