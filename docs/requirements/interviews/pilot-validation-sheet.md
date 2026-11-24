# Lembar Validasi Pilot (kesediaan + syarat + ketentuan pilot gratis 3 bulan)

**Tugas:** T-009 · **FR terkait:** FR-35 + pendukung FR-05/07/13/16/19
**prd_ref:** §14 (monetisasi, paket Pilot "Gratis 3 bulan"), §15 (roadmap P0 → Gate G0: *2 pilot bersedia*), §20.2 (pertanyaan terbuka), §20.3 (asumsi P0)
**Aturan:** lembar ini **tanpa data pribadi nyata** — semua kolom identitas diisi kode placeholder (`PILOT-A`, `PILOT-B`). Kontak responden disimpan di luar repo. Isi kolom `[ ]` sebelum/ketika wawancara.

**Definisi ID asumsi:** ID `A-1` ... `A-5` diperkenalkan kit T-009 mengikuti urutan kalimat PRD §20.3; ID ini **bukan** milik PRD.

## 1. Identitas kandidat (placeholder)

| Field | PILOT-A | PILOT-B | PILOT-C (cadangan) |
|---|---|---|---|
| Kode kandidat | `PILOT-A` | `PILOT-B` | `PILOT-C` |
| Tipe tenant (§4.1) | `managed_basecamp / trek_operator` | `___` | `___` |
| Gunung / jalur usulan | `___` (contoh rekayasa: `Gunung Contoh`) | `___` | `___` |
| Responden dari skrip | `BASECAMP-0_` / `TO-0_` | `___` | `___` |
| Peran penanggung jawab | `___` | `___` | `___` |
| Perkiraan volume puncak | `___ pendaki/hari` | `___` | `___` |
| Tanggal wawancara | `___` | `___` | `___` |

## 2. Kriteria kesediaan pilot (ambang keputusan)

Kandidat **layak diusulkan** ke Gate G0 bila memenuhi semua baris **Wajib**, dan ≥2 baris **Nilai tambah**. Ambang ini usulan T-009 `[REKOMENDASI]`; G0 menetapkan keputusan final (manusia).

| # | Kriteria | Jenis | Bukti yang dicatat | A/B/C |
|---|---|---|---|---|
| K1 | Menjawab **setuju** pada pertanyaan kesediaan pilot (B23 basecamp / T19 TO) | Wajib | `ya / tidak / bersyarat: ____` | `___` |
| K2 | Punya ruang lingkup pilot yang jelas: **1 jalur/trip set + 1 gate/pos** untuk 1 tenant (basecamp atau TO) — §14 Pilot: "1 basecamp" | Wajib | `___` | `___` |
| K3 | Ada orang yang ditunjuk mengurus onboarding (bukan "nanti saja") | Wajib | peran, bukan nama: `___` | `___` |
| K4 | Volume cukup untuk menguji kuota (ada hari yang **dekat/penuh**) | Wajib | `___ pendaki/hari puncak` | `___` |
| K5 | Bersedia memberi umpan balik terstruktur (§14 Pilot) minimal **2×/bulan** dan 1 wawancara akhir pilot | Wajib | `ya / tidak` | `___` |
| K6 | Perangkat petugas pos memadai untuk PWA (§20.3 A-3) | Wajib | `Android ___ / lainnya` | `___` |
| K7 | Pendaki di lokasi bersedia bayar online (§20.3 A-4) | Wajib | `estimasi ___% sudah online` | `___` |
| K8 | Bisa menandatangani kesepakatan pilot (termasuk perlindungan data) | Wajib | `ya / tidak / perlu pengurus` | `___` |
| K9 | Punya kasus nyata jalur tutup/buka berulang untuk menguji Closure Desk (§7.3) | Nilai tambah | `___` | `___` |
| K10 | Punya kebutuhan rasio guide/porter → menguji FR-25 | Nilai tambah | `___` | `___` |
| K11 | Tertarik lanjut berbayar setelah pilot (sinyal §20.3 A-1/A-5) | Nilai tambah | `B21/T17 = ____` | `___` |
| K12 | Menyediakan atau menyetujui **data contoh** yang bukan data pribadi nyata | Nilai tambah | `___` | `___` |

**Syarat gugur (disqualify):** menolak perlindungan data/persetujuan pendaki; minta dana dititipkan ke platform (di luar MVP §4.3); tidak ada penanggung jawab onboarding.

## 3. Ketentuan pilot gratis 3 bulan (usulan T-009, selaras §14)

Paket **Pilot** menurut §14: *"Gratis 3 bulan — 1 basecamp, bantuan onboarding, umpan balik terstruktur."* Rincian berikut menurunkan paket itu menjadi syarat yang dapat ditandatangani. Baris `[REKOMENDASI]` = usulan T-009, **belum** keputusan PRD — wajib dikonfirmasi di G0.

| # | Ketentuan | Sumber / status |
|---|---|---|
| P1 | Durasi **3 bulan kalender**, mulai tanggal `___` (setelah onboarding selesai). | §14 |
| P2 | Cakupan: **1 jalur/trip set + 1 gate/pos** untuk 1 tenant (basecamp atau TO); tidak ada biaya langganan maupun fee transaksi selama masa pilot. | §14 `[REKOMENDASI]` detail cakupan |
| P3 | **Bantuan onboarding** dari tim TrailGate: impor data awal (Mountain Pack bertanda "DEMO" bila belum terverifikasi), pelatihan staf ±1 sesi, kanal dukungan. | §14, FR-37 |
| P4 | **Umpan balik terstruktur**: kuesioner + wawancara singkat 2×/bulan, dan satu wawancara penutup; kegagalan memberi umpan balik = alasan pilot dihentikan `[REKOMENDASI]`. | §14 |
| P5 | Pembayaran online memakai **akun Midtrans milik tenant (BYO)**; TrailGate tidak menahan dana pendaki. | §14 `[VERIFIKASI mekanisme]` |
| P6 | Data: peserta memberi consent; dokumen sensitif disimpan privat; **tidak ada data pribadi nyata** dalam demo, repo, atau log. | §13, FR-36, AGENTS.md #11 |
| P7 | Selama pilot, kuota tetap milik tenant; sistem tidak menutup jalur tanpa konfirmasi manusia (§7.3: "manusia wajib konfirmasi"). | §7.3 |
| P8 | Setelah 3 bulan: pilih **berbayar** (Basecamp Rp 299.000/bln + 1% **atau** Pro/TO Rp 899.000/bln + 1%), **lanjut sebagai Official Link Mode tanpa transaksi** (FR-35), atau **berhenti** — berhenti tanpa biaya. | §14, FR-35, §20.2 #7 `[REKOMENDASI]` opsi berhenti tanpa biaya |
| P9 | Ketersediaan target selama pilot: MVP 99,5%; jendela maintenance di luar jam buka kuota. | §8 |
| P10 | Bila target §8/performa tidak terpenuhi karena kesalahan TrailGate, masa pilot diperpanjang tanpa biaya `[REKOMENDASI]`. | usulan T-009 |
| P11 | Dispute/kegagalan pembayaran mengikuti kebijakan refund/reschedule tenant (§6.4, FR-14), bukan aturan platform baru. | §6.4, FR-14 |
| P12 | Batas tanggung jawab: sistem bukan satu-satunya sumber keputusan keselamatan; data cuaca/status memakai atribusi sumber (§20.1). | §20.1 |

## 4. Ekspektasi dua arah (ringkas, dibacakan sebelum tanda tangan)

**TrailGate memberi:** (a) gratis 3 bulan; (b) onboarding + impor data awal; (c) kanal dukungan; (d) hasil pengukuran metrik pilot §14 untuk tenant.

**Tenant memberi:** (a) penanggung jawab onboarding; (b) 1 jalur/gate untuk pilot; (c) umpan balik terstruktur 2×/bulan + wawancara penutup; (d) izin memakai data **agregat & anonim** untuk keputusan produk; (e) kepatuhan consent pendaki.

## 5. Metrik validasi pilot (dari §14 "Metrik sukses", target 90 hari setelah pilot)

| Metrik | Target | Hasil aktual (isi nanti) |
|---|---|---|
| Overbooking | 0 | `___` |
| Konversi hold → bayar | ≥ 60% | `___` |
| Waktu check-in per rombongan | < 60 detik | `___` |
| Disruption case selesai < 72 jam | ≥ 90% | `___` |
| Tenant aktif berbayar | 3 | `___` |
| Deteksi overdue → alert | < 15 menit | `___` |

## 6. Keputusan pilot & status Gate G0

| Field | Isi |
|---|---|
| Pilot terpilih (Gate G0 butuh **2 pilot bersedia** — §15) | `PILOT-__`, `PILOT-__` |
| Alasan singkat | `___` |
| Kandidat cadangan | `___` |
| Asumsi §20.3 yang masih **belum** terbukti setelah pilot | `A-1 __ / A-2 __ / A-3 __ / A-4 __ / A-5 __` |
| Ditandatangani tenant (placeholder, tidak dicatat di repo) | `PILOT-__` `___` |
| **Sign-off manusia (R2 = Andy)** | `[ ] belum / [ ] disetujui tanggal ____` |

## 7. Pelacakan asumsi §20.3 → pertanyaan kit → bukti pilot

| Asumsi §20.3 | Pertanyaan penguji | Bukti pilot yang diharapkan |
|---|---|---|
| A-1 Basecamp mau memakai sistem digital berbayar | B06–B09 (+ B21, K11) | Pilot berjalan sampai akhir 3 bulan; keputusan P8 |
| A-2 TO bersedia input peserta lewat link | T05–T08 | ≥1 trip diisi lewat link anggota; tingkat kelengkapan dokumen |
| A-3 Petugas pos bisa memakai PWA | B10–B13, T12–T13 | Check-in di pos nyata, termasuk ≥1 sesi tanpa sinyal |
| A-4 Pembayaran online diterima pendaki di basecamp target | B14–B17, T09–T11 | Konversi hold → bayar (target ≥ 60%) |
| A-5 Fee 1% + langganan cukup untuk unit economics | B18–B22a, T14–T18a (pertanyaan GMV: B22a / T18a) | Pilihan P8 dari tenant; angka toleran tertinggi |

**Catatan A-5:** kecukupan unit economics **dihitung dari model biaya internal TrailGate** (hosting, WhatsApp, Midtrans, dukungan) memakai **GMV + harga tiket rata-rata** dari B22a/T18a — **bukan** disimpulkan langsung dari jawaban tenant soal harga. Wawancara hanya memasok angka volume/harga; kesimpulan unit economics = analisis internal (dan keputusan G0).

## 8. Catatan gate (wajib)

- Reviewer R2 untuk T-009 adalah **Andy (manusia)**; sign-off manusia adalah item **gate G0** dan **tidak dapat dipenuhi agent** (T-009 notes; §15: *Gate G0: 2 pilot bersedia; keputusan D1–D10 dikonfirmasi*).
- Pertanyaan terbuka §20.2 #1–#7 tetap keputusan Andy; jawaban responden hanya **usulan**.
- Kit ini menyiapkan wawancara; pelaksanaan wawancara + keputusan pilot = **kerja manusia**.
