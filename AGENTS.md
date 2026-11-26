# TrailGate — Aturan untuk semua agent

Sumber kebenaran produk: [`docs/prd/PRD.md`](docs/prd/PRD.md). Peta kepemilikan path: [`OWNERS.md`](OWNERS.md).

1. Baca `docs/prd/PRD.md` dan task card sebelum bekerja. Jangan bekerja di luar task card.
2. Hanya ubah path yang dimiliki perananmu (`OWNERS.md`). Butuh perubahan di path lain → tulis `needs_info` di yield.
3. Jangan menyetujui pekerjaanmu sendiri. Jangan memodifikasi papan status (hanya Orchestrator).
4. Setiap klaim aturan pendakian wajib punya `source_url` dan `verified_at`.
5. Kuota: invarian `reserved + sold <= effective_capacity`; semua tulis kuota lewat service `ReserveSlot`.
6. Uang: integer rupiah, tidak pernah float. Semua tulis eksternal idempoten.
7. Tenant: setiap query model tenant-scoped harus lewat global scope; jangan gunakan `withoutGlobalScopes` tanpa ADR.
8. Sebelum yield `done`: jalankan pint, phpstan, tes relevan, lampirkan hasil.
9. Kesepakatan antar-agent harus tertulis di repo (kontrak/ADR/task card), bukan hanya DM.
10. Paket baru: ajukan ke tg-security via task card; jangan install sendiri.
11. Jangan pernah menaruh rahasia, NIK nyata, atau data pendaki nyata di repo, log, atau fixture.
12. **Kartu gate** (penerimaan paket baru, mis. T-013/T-015) memakai jalur ringkas: keputusan tertulis pemilik gate (`tg-security`) + verifier `tg-auditor`; dua reviewer tidak wajib karena tidak ada artefak produk yang dibangun. Verdict + kondisi operasional tetap wajib tertulis di repo, dan paket tetap dilarang di-commit ke dependency produk tanpa keputusan itu.

## Loop kerja per tugas (§16.7 PRD)

`owner → BuildReport → Gate G2 (pint, phpstan, tes) → 2 reviewer (ReviewReport) → verifier (VerifyReport) → merge → done`.
Maksimal 2 putaran rework; putaran ke-3 → arbitrasi `tg-architect` → keputusan Andy (ADR).

## Status papan

`docs/board/STATUS.md` adalah papan tunggal. Hanya Orchestrator menulisnya.
