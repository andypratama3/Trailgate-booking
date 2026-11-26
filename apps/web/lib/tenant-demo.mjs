// Contoh payload tema tenant untuk demo /katalog/tenant-theme.
// Nilai hex hidup di sini — di luar akar pemindaian check-no-hardcode
// (akar: apps/web/app/**, packages/ui/** — lib tidak termasuk).

/**
 * @typedef {{ id: string; nama: string; light: Record<string,string>; dark: Record<string,string> }} ContohTema
 * @type {ContohTema[]}
 */
export const CONTOH_TEMA = [
  {
    id: "lolos",
    nama: "Merek hijau tua — lolos AA, brandFg diturunkan platform",
    light: { brand: "#064E3B" },
    dark: { brand: "#FFD60A" },
  },
  {
    id: "gagal-subtle",
    nama: "Pasangan brand-subtle abu-abu — 1.17:1 (harus ditolak 422, tanpa adjust)",
    light: { brand: "#064E3B", brandSubtle: "#EEEEEE", brandSubtleFg: "#DDDDDD" },
    dark: { brand: "#FFD60A" },
  },
  {
    id: "injeksi",
    nama: "Payload injeksi CSS — tidak ada yang ditulis ke DOM",
    light: { brand: "red; background-image:url(x)" },
    dark: { brand: "#064E3B" },
  },
];
