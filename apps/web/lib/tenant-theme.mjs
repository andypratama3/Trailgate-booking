// Validasi warna merek tenant + injeksi CSS variables saat runtime (T-012; FR-02 AC-02.1/AC-02.2,
// FR-39 AC-39.2). Sumber aturan: docs/ux/design-tokens.md §1.5 (validator kontras, tolak-422,
// tanpa auto-adjust) dan §7 (kontrak injeksi tema tenant).
//
// KEPUTUSAN KEAMANAN (reviewer R2 = tg-security; sumber dibaca: docs/adr/ADR-001-tenancy.md,
// docs/adr/ADR-005-field-encryption.md — allowlist, bukan sanitasi bebas):
//
// 1. Allowlist variabel: HANYA variabel §7 yang boleh di-override. Nama variabel dikunci di
//    THEME_VARS (konstanta kode) dan TIDAK PERNAH berasal dari input; input hanya nilai warna.
// 2. Normalisasi ketat: parser menerima `#RRGGBB`/`#RRGGBBAA` (alpha diabaikan — merek harus
//    opak) serta `rgb()/rgba()/hsl()/hsla()` numerik, lalu menghasilkan `#RRGGBB`. Di depan
//    parser, FORBIDDEN_RE menolak `;`, `{`, `}`, `<`, `>`, `\`, NUL, newline, `url(`,
//    `expression(`, `javascript:` — payload CSS/JS tidak pernah lolos parser, dan semua
//    jalur lain (regex berjangkar, parseInt bernilai 0..255) menolak apa pun yang bukan warna.
// 3. Titik masuk DOM hanya dua, keduanya tanpa string bebas:
//      - `document.createElement("style")` diisi lewat `textContent` (bukan `innerHTML`) dengan
//        teks yang dibangun dari NAMA VARIABEL WHITELIST + nilai `#RRGGBB` yang sudah lolos
//        HEX_RE, lalu diverifikasi ulang sekali lagi sebelum dipakai (defence in depth);
//      - tidak ada `setProperty` untuk nilai tenant: `style` inline pada `<html>` menang atas
//        `[data-theme="dark"]`, jadi satu-satunya mekanisme adalah elemen `<style>` ber-scope
//        `:root` + `[data-theme="dark"]` agar mode gelap tetap utuh.
// 4. Kegagalan aman: bila validasi gagal (bukan warna, atau kontras < ambang), TIDAK ADA yang
//    ditulis — bukan fallback, bukan penyesuaian otomatis. `injectTenantTheme` mengembalikan
//    `{ ok: false }` + pesan berisi rasio terukur; nilai gagal tidak pernah menyentuh DOM/CSS.
// 5. `brand-fg` diturunkan platform (§1.5): SELALU `deriveBrandFg(brand)`, bahkan bila tenant
//    mengirim brandFg. Nilai tenant diterima (format wajib warna sah) tetapi TIDAK PERNAH
//    dipakai sebagai nilai keluaran — §1.5 F-3 R1 Orchestrator decision.

export const AA_TEXT = 4.5;
export const AA_NON_TEXT = 3;

/** Whitelist variabel §7 yang boleh di-override tenant; nama tidak pernah dari input. */
export const THEME_VARS = Object.freeze({
  brand: "--tg-brand",
  brandFg: "--tg-brand-fg",
  brandSubtle: "--tg-brand-subtle",
  brandSubtleFg: "--tg-brand-subtle-fg",
});

const HEX_OUT_RE = /^#[0-9A-F]{6}$/;
const HEX_IN_RE = /^#([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?$/;
const RGB_RE =
  /^rgba?\(\s*([0-9.]{1,8})\s*[, ]\s*([0-9.]{1,8})\s*[, ]\s*([0-9.]{1,8})\s*(?:[,/]\s*([0-9.]{1,8}%?)\s*)?\)$/;
const HSL_RE =
  /^hsla?\(\s*(-?[0-9.]{1,8})(?:deg)?\s*[, ]\s*([0-9.]{1,8})%\s*[, ]\s*([0-9.]{1,8})%\s*(?:[,/]\s*([0-9.]{1,8}%?)\s*)?\)$/;
const FORBIDDEN_RE = /[;{}<>\\]|url\(|expression\(|javascript:|\n|\r|\0/i;
const NAME_RE = /^--[a-z0-9-]+$/i; // F-10: nama variabel harus literal kode, bukan input tenant

const WHITE = "#FFFFFF";
const BLACK = "#000000";

function toHex(r, g, b) {
  const c = (n) => {
    if (!Number.isFinite(n)) return null;
    const v = Math.round(Math.min(255, Math.max(0, n)));
    return v.toString(16).padStart(2, "0").toUpperCase();
  };
  const parts = [c(r), c(g), c(b)];
  return parts.every((p) => p !== null) ? `#${parts.join("")}` : null;
}

function hslToHex(hRaw, sRaw, lRaw) {
  const h = Number(hRaw);
  const s = Number(sRaw);
  const l = Number(lRaw);
  if (![h, s, l].every(Number.isFinite) || s < 0 || s > 100 || l < 0 || l > 100) return null;
  const hn = ((((h % 360) + 360) % 360) / 360) * 12;
  const sn = s / 100;
  const ln = l / 100;
  const f = (n) => {
    const k = (n + hn) % 12;
    const a = sn * Math.min(ln, 1 - ln);
    return (ln - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))) * 255;
  };
  return toHex(f(0), f(8), f(4));
}

/**
 * @param {unknown} raw nilai warna apa pun dari input tenant.
 * @returns {string|null} `#RRGGBB` ternormalisasi, atau null bila bukan warna / payload.
 */
export function parseColor(raw) {
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (s.length === 0 || s.length > 64 || FORBIDDEN_RE.test(s)) return null;
  const hex = HEX_IN_RE.exec(s);
  if (hex) return `#${hex[1].toUpperCase()}`; // #RRGGBBAA → alpha diabaikan (merek opak)
  const rgb = RGB_RE.exec(s);
  if (rgb) {
    const [r, g, b] = [rgb[1], rgb[2], rgb[3]].map(Number);
    if (![r, g, b].every((n) => Number.isFinite(n) && n >= 0 && n <= 255)) return null;
    return toHex(r, g, b);
  }
  const hsl = HSL_RE.exec(s);
  if (hsl) return hslToHex(hsl[1], hsl[2], hsl[3]);
  return null; // kontrak JSDoc: string|null — jangan biarkan undefined lolos ke validator
}

/** Luminance relatif WCAG 2.x dari `#RRGGBB` tervalidasi. */
export function luminance(hex) {
  if (typeof hex !== "string" || !HEX_OUT_RE.test(hex)) {
    throw new TypeError(`bukan #RRGGBB: ${String(hex)}`);
  }
  const channel = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

/** Rasio kontras WCAG (≥ 1) untuk dua warna `#RRGGBB`. */
export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Pasangan (fg, bg) + ambang → hasil terukur. `min`: AA_TEXT (teks) atau AA_NON_TEXT (UI). */
export function validatePair(fg, bg, min = AA_TEXT) {
  const ratio = Math.round(contrastRatio(fg, bg) * 100) / 100;
  return { fg, bg, ratio, required: min, pass: ratio >= min };
}

/** `brand-fg` diturunkan platform: hanya putih/kehitaman, mana yang rasionya lebih tinggi (§1.5). */
export function deriveBrandFg(brand) {
  return contrastRatio(brand, WHITE) >= contrastRatio(brand, BLACK) ? WHITE : BLACK;
}

/**
 * Validasi tema tenant (satu tema). Bentuk "tolak, bukan sesuaikan" (§1.5):
 * `ok: false` berarti HTTP 422 — warna TIDAK disimpan, TIDAK ditulis, TIDAK disesuaikan.
 *
 * §1.5 F-3: brand-fg SELALU turunan platform; nilai brandFg dari tenant DITERIMA
 * (format wajib warna sah) tetapi TIDAK PERNAH dipakai sebagai nilai keluaran.
 *
 * @param {{ brand?: unknown, brandFg?: unknown, brandSubtle?: unknown, brandSubtleFg?: unknown }} input
 * @param {{ backgrounds?: { canvas?: string, surface?: string } }} [opts] latar non-teks (3:1)
 *   (canvas/surface tema yang bersangkutan, resolusi dari token platform).
 * @returns {{ ok: true, value: Record<string,string>, checks: ReturnType<typeof validatePair>[] }
 *          | { ok: false, status: 422, errors: string[],
 *              details: { contrast_ratio: number, required: number, pair: string } | null }}
 */
export function validateTenantTheme(input = {}, opts = {}) {
  const errors = [];
  const value = {};
  const provided = (key) => input[key] !== undefined && input[key] !== "";

  const brand = provided("brand") ? parseColor(input.brand) : null;
  if (provided("brand") && brand === null)
    errors.push("warna merek bukan format warna yang diizinkan (#RRGGBB / #RRGGBBAA / rgb() / hsl())");
  if (brand === null)
    return { ok: false, status: 422, errors: errors.length ? errors : ["warna merek wajib diisi"], details: null };
  value.brand = brand;

  // §1.5 F-3 (Orchestrator decision): brand-fg SELALU turunan platform, bahkan bila tenant
  // mengirimnya. Nilai tenant diterima (format warna sah) tetapi TIDAK PERNAH menjadi keluaran.
  if (provided("brandFg")) {
    const fg = parseColor(input.brandFg);
    if (fg === null) {
      errors.push("warna teks merek bukan format warna yang diizinkan");
    }
    // brandFg dari tenant DIABAIKAN — §1.5: platform turunkan lebih dulu, validasi atas turunan.
  }
  value.brandFg = deriveBrandFg(brand);

  const hasSubtle = provided("brandSubtle");
  const hasSubtleFg = provided("brandSubtleFg");
  if (hasSubtle !== hasSubtleFg) {
    errors.push("brand-subtle dan brand-subtle-fg harus diisi berdua");
  } else if (hasSubtle && hasSubtleFg) {
    const subtle = parseColor(input.brandSubtle);
    const subtleFg = parseColor(input.brandSubtleFg);
    if (subtle === null || subtleFg === null) {
      errors.push("brand-subtle / brand-subtle-fg bukan format warna yang diizinkan");
    } else {
      value.brandSubtle = subtle;
      value.brandSubtleFg = subtleFg;
    }
  }

  // F-9: latar non-teks berasal dari token platform, tetapi validator tetap gagal aman (422)
  // bila nilainya bukan warna — bukan melempar TypeError dari contrastRatio.
  const canvas = opts.backgrounds?.canvas === undefined ? null : parseColor(opts.backgrounds.canvas);
  if (opts.backgrounds?.canvas !== undefined && canvas === null)
    errors.push("latar canvas bukan format warna yang diizinkan (#RRGGBB / rgb() / hsl())");
  const surface = opts.backgrounds?.surface === undefined ? null : parseColor(opts.backgrounds.surface);
  if (opts.backgrounds?.surface !== undefined && surface === null)
    errors.push("latar surface bukan format warna yang diizinkan (#RRGGBB / rgb() / hsl())");

  if (errors.length > 0) return { ok: false, status: 422, errors, details: null };

  // §1.5 F-1: pemeriksaan 3:1 non-teks mandatori terhadap latar tema yang bersangkutan.
  const checks = [validatePair(value.brand, value.brandFg, AA_TEXT)];
  if (value.brandSubtle && value.brandSubtleFg)
    checks.push(validatePair(value.brandSubtleFg, value.brandSubtle, AA_TEXT));
  if (canvas) checks.push(validatePair(value.brand, canvas, AA_NON_TEXT));
  if (surface) checks.push(validatePair(value.brand, surface, AA_NON_TEXT));

  const failed = checks.filter((c) => !c.pass);
  if (failed.length === 0) return { ok: true, value, checks };

  const first = failed[0];
  errors.push(
    `Kontras ${first.fg} di atas ${first.bg} = ${first.ratio}:1 — minimal ${first.required}:1`,
  );
  return {
    ok: false,
    status: 422,
    errors,
    details: { contrast_ratio: first.ratio, required: first.required, pair: `${first.fg}/${first.bg}` },
  };
}

/**
 * Bangun teks CSS injeksi untuk kedua tema. Nama variabel dari whitelist; nilai sudah `#RRGGBB`
 * dan diverifikasi ulang. F-1: latar canvas+surface kedua tema wajib disediakan —
 * pemeriksaan non-teks 3:1 mandatori (bukan dependen pemanggil). Bila latar kosong atau
 * salah satu tema gagal → `{ ok: false }` (kegagalan aman, tanpa CSS parsial).
 *
 * @param {Record<string,string>} light  { brand, brandFg?, brandSubtle?, brandSubtleFg? } terang.
 * @param {Record<string,string>} dark   sama, untuk `[data-theme="dark"]`.
 * @param {{ lightBg?: { canvas: string, surface: string }, darkBg?: { canvas: string, surface: string } }} [bgs]
 *   Latar canvas+surface masing-masing tema untuk pemeriksaan non-teks 3:1 (SC 1.4.11).
 * @returns {{ ok: true, css: string, light: Record<string,string>, dark: Record<string,string> }
 *          | { ok: false, errors: string[], css: null }}
 */
export function buildTenantThemeCss(light, dark, bgs = {}) {
  const { lightBg, darkBg } = bgs;
  if (!lightBg?.canvas || !lightBg?.surface || !darkBg?.canvas || !darkBg?.surface) {
    return {
      ok: false,
      status: 422,
      css: null,
      errors: [
        "latar canvas+surface untuk tema terang dan gelap wajib disediakan — " +
          "pemeriksaan non-teks 3:1 mandatori (SC 1.4.11, F-1)",
      ],
    };
  }
  const l = validateTenantTheme(light, { backgrounds: lightBg });
  const d = validateTenantTheme(dark, { backgrounds: darkBg });
  if (!l.ok)
    return { ok: false, status: 422, errors: [...l.errors], details: l.details, css: null };
  if (!d.ok)
    return { ok: false, status: 422, errors: [...d.errors], details: d.details, css: null };

  const decls = (theme) =>
    Object.entries(theme.value)
      .map(([key, v]) => {
        if (!THEME_VARS[key] || !HEX_OUT_RE.test(v))
          throw new TypeError(`nilai injeksi tidak sah: ${key}`);
        return `${THEME_VARS[key]}:${v};`;
      })
      .join("");
  const css = `:root{${decls(l)}}[data-theme="dark"]{${decls(d)}}`;
  return { ok: true, css, light: l.value, dark: d.value };
}

/**
 * Terapkan tema tenant ke DOM saat runtime (tanpa rebuild). F-1: thread latar kedua tema.
 * Hanya menulis lewat elemen `<style>` ber-`textContent`; tidak ada string bebas dari input
 * yang menyentuh DOM. Kegagalan aman: validasi gagal → TIDAK ada yang ditulis (elemen lama
 * dibiarkan apa adanya).
 *
 * @param {Document} doc     dokumen target (client-side).
 * @param {Record<string,string>} light  { brand, brandFg?, brandSubtle?, brandSubtleFg? } terang.
 * @param {Record<string,string>} dark   sama, untuk `[data-theme="dark"]`.
 * @param {{ lightBg?: { canvas: string, surface: string }, darkBg?: { canvas: string, surface: string } }} [bgs]
 *   Latar canvas+surface masing-masing tema untuk pemeriksaan 3:1.
 * @returns {{ ok: true, css: string } | { ok: false, errors: string[] }}
 */
export function injectTenantTheme(doc, light, dark, bgs) {
  const built = buildTenantThemeCss(light, dark, bgs);
  if (!built.ok) return { ok: false, errors: built.errors };
  const el = doc.createElement("style");
  el.setAttribute("data-tg-tenant-theme", "");
  el.textContent = built.css; // textContent, bukan innerHTML (keputusan keamanan #3)
  const prev = doc.head.querySelector("style[data-tg-tenant-theme]");
  if (prev) prev.replaceWith(el);
  else doc.head.appendChild(el);
  return { ok: true, css: built.css };
}

/**
 * Baca warna yang sedang aktif dari token platform (untuk prafill form demo, tanpa hardcode):
 * resolusi via elemen probe (tanpa string bebas yang ditulis). Probe mewarisi variabel dari
 * html, jadi nilai yang dikembalikan bergantung pada nilai atribut `data-theme` pada html.
 *
 * F-2: overload `theme` mengizinkan probing latar tema tertentu secara terpisah —
 * probe disisipkan di bawah html dengan data-theme attribute sementara, lalu dihapus.
 *
 * F-10: `name` BUKAN input tenant — harus literal nama variabel dari KODE (`/^--[a-z0-9-]+$/i`).
 * Nama tidak sah melempar `TypeError` (fail loud) agar nilai dari luar tak pernah sampai ke probe.
 *
 * @param {Document} doc
 * @param {string} name nama CSS variable literal dari kode, mis. `--tg-canvas` (BUKAN input tenant).
 * @param {"light"|"dark"|null} [theme] bila diisi, probe mengukur variabel sotto tema itu
 *   (mengatur sementara `data-theme` pada html, lalu mengembalikan ke semula).
 * @returns {string} `#RRGGBB` atau "" bila variabel tidak terdefinisi.
 */
export function resolveColorVar(doc, name, theme = null) {
  if (typeof name !== "string" || !NAME_RE.test(name)) {
    throw new TypeError(`nama variabel bukan literal kode (--[a-z0-9-]+): ${String(name)}`);
  }
  const savedTheme = doc.documentElement.dataset.theme ?? null;
  let probe = null;
  try {
    if (theme) doc.documentElement.dataset.theme = theme;
    probe = doc.createElement("span");
    probe.style.cssText = "position:absolute;visibility:hidden";
    probe.style.backgroundColor = `var(${name}, initial)`;
    doc.documentElement.appendChild(probe);
    const bg = doc.defaultView?.getComputedStyle(probe).backgroundColor ?? "";
    return bg === "rgba(0, 0, 0, 0)" ? "" : (parseColor(bg) ?? "");
  } finally {
    // F-8: probe SELALU dibersihkan (bahkan bila createElement/appendChild/getComputedStyle
    // melempar) dan tema aktif dipulihkan.
    probe?.remove();
    if (savedTheme === null) delete doc.documentElement.dataset.theme;
    else doc.documentElement.dataset.theme = savedTheme;
  }
}
