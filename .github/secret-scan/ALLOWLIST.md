# Allowlist secret-scan — path+commit scoped, TANPA nilai kunci.

## `apps/api/.env.testing`

| Atribut | Nilai |
|---|---|
| Path | `apps/api/.env.testing` |
| Commit | `f29df8848291c6fae3da4a756a597c4d3e51bb12` |
| Alasan | Scaffold T-001 commit `.env.testing` dengan `APP_KEY` base64 uji. |
| Nilai kunci di commit itu? | Ya, tetapi **tidak disalin ke file ini** (tg-security F-8). |
| Status saat ini | Sejak `dc58998` (T-001 rework round 1, secret hygiene) `APP_KEY=` dikosongkan; kunci uji dibuat acak per proses oleh `apps/api/bootstrap/phpunit-testing.php`. |
| Scope | Hanya commit itu. Commit lain di path yang sama tetap dipindai. |
| Referensi | Temuan tg-security T-001 **F-8**, `docs/board/tasks/T-008.yml` AC allowlist, kartu T-001 O-7. |

Tidak ada entri lain. Rule implementasi: `.github/secret-scan/gitleaks.toml` (path+commit-scoped,
nilai kunci tidak pernah muncul di file konfigurasi).
