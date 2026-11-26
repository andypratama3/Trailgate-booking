// Tes T-012 acceptance #5 untuk apps/web/lib/tenant-theme.mjs.
// Menjalankan: node --test (tanpa framework; node:test builtin).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AA_TEXT,
  AA_NON_TEXT,
  THEME_VARS,
  parseColor,
  luminance,
  contrastRatio,
  validatePair,
  deriveBrandFg,
  validateTenantTheme,
  buildTenantThemeCss,
  injectTenantTheme,
  resolveColorVar,
} from "./tenant-theme.mjs";

// --- parseColor: format warna yang diizinkan → ternormalisasi #RRGGBB -------------------
test("parseColor menerima warna sah dan menormalkan ke #RRGGBB", () => {
  const cases = [
    ["#064E3B", "#064E3B"],
    ["#064e3b", "#064E3B"], // huruf kecil → huruf besar
    ["  #064E3B  ", "#064E3B"], // spasi tepi dibuang
    ["#064E3BAA", "#064E3B"], // alpha diabaikan (merek opak)
    ["rgb(6, 78, 59)", "#064E3B"],
    ["rgba(6, 78, 59, 0.5)", "#064E3B"], // alpha diabaikan
    ["rgba(0, 0, 0, 0.3)", "#000000"],
    ["hsl(155, 85%, 16%)", "#064B2F"], // konversi CSS hsl→rgb, lalu huruf besar
  ];
  for (const [input, expected] of cases) {
    assert.equal(parseColor(input), expected, `parseColor(${input})`);
  }
});

test("parseColor menolak format di luar allowlist", () => {
  for (const bad of [
    "#fff", // 3-digit tidak di allowlist
    "blue", // nama CSS bukan di allowlist
    "064E3B", // tanpa #
    "rgb 6,78,59", // sintaks rusak
    "hsl(155,85%,16%) extra",
  ]) {
    assert.ok(!parseColor(bad), `seharusnya null/undefined untuk ${JSON.stringify(bad)}`);
  }
});

test("parseColor menghitung luminance & contrastRatio sesuai WCAG 2.x", () => {
  assert.equal(luminance("#000000"), 0);
  assert.equal(luminance("#FFFFFF"), 1);
  assert.ok(Math.abs(contrastRatio("#FFFFFF", "#000000") - 21) < 1e-9);
  assert.ok(Math.abs(contrastRatio("#000000", "#FFFFFF") - 21) < 1e-9);
});

// --- validasi AA ------------------------------------------------------------------------

// F-3 R1 Orchestrator decision: brand-fg SELALU turunan platform, nilai tenant DIABAIKAN.
test("F-3: brandFg '#000000' dari tenant diterima tapi diabaikan — keluaran = #FFFFFF", () => {
  // repro: brand #064E3B + brandFg #000000 lama = 422 (rasio 1.48:1).
  // Sekarang: brandFg diabaikan, derive → #FFFFFF, rasio 9.72:1 → lolOS.
  const res = validateTenantTheme({ brand: "#064E3B", brandFg: "#000000" });
  assert.equal(res.ok, true, JSON.stringify(res));
  assert.equal(res.value.brand, "#064E3B");
  assert.equal(res.value.brandFg, "#FFFFFF"); // derived, not tenant-sent #000000
  assert.ok(res.checks.every((c) => c.pass), "semua pemeriksaan harus lolos");
});

test("warna yang lolos AA diterima, brand-fg diturunkan platform", () => {
  const res = validateTenantTheme({ brand: "#064E3B" });
  assert.equal(res.ok, true);
  assert.equal(res.value.brand, "#064E3B");
  assert.equal(res.value.brandFg, "#FFFFFF"); // derived (rasio 9.72 vs putih)
  assert.ok(res.checks.every((c) => c.pass));
});

test("brand terang menurunkan brand-fg hitam", () => {
  const res = validateTenantTheme({ brand: "#FFD60A" });
  assert.equal(res.ok, true);
  assert.equal(res.value.brandFg, "#000000"); // rasio 14.88 vs hitam
});

test("brandFg tenant '#FFFFFF' (warna sah) diterima tapi diabaikan — keluaran tetap turunan", () => {
  const res = validateTenantTheme({ brand: "#064E3B", brandFg: "#FFFFFF" });
  assert.equal(res.ok, true);
  assert.equal(res.value.brandFg, "#FFFFFF"); // sama dengan derived — coincidence
});

test("brandFg tenant '#FF0000' (warna sah, bukan B/W) diterima tapi diabaikan — §1.5 F-3", () => {
  // Tidak 422 karena §1.5: "terima tapi jangan pakai"; derive → #FFFFFF, valid.
  const res = validateTenantTheme({ brand: "#064E3B", brandFg: "#FF0000" });
  assert.equal(res.ok, true);
  assert.equal(res.value.brandFg, "#FFFFFF"); // derived, NOT #FF0000
  assert.ok(res.checks.every((c) => c.pass));
});

test("brandFg tenant payload non-warna ditolak 422 (bukan format warna)", () => {
  const res = validateTenantTheme({ brand: "#064E3B", brandFg: "red; background-image:url(x)" });
  assert.equal(res.ok, false);
  assert.equal(res.status, 422);
  assert.ok(res.errors.some((e) => e.includes("format warna")));
});

test("warna yang gagal AA ditolak dengan status 422 + rasio terukur (latar canvas)", () => {
  // brand #AAAAAA vs canvas #FFFFFF = 2.32:1 < 3 (non-teks SC 1.4.11)
  const res = validateTenantTheme({ brand: "#AAAAAA" }, { backgrounds: { canvas: "#FFFFFF" } });
  assert.equal(res.ok, false);
  assert.equal(res.status, 422);
  assert.equal(typeof res.details.contrast_ratio, "number");
  assert.ok(res.details.contrast_ratio < 3);
  assert.ok(Math.abs(res.details.contrast_ratio - 2.323) < 0.01);
});

test("pasangan brand-subtle yang gagal AA ditolak (422) tanpa auto-adjust", () => {
  const res = validateTenantTheme({
    brand: "#064E3B",
    brandSubtle: "#EEEEEE",
    brandSubtleFg: "#DDDDDD", // 1.17:1 < 4.5
  });
  assert.equal(res.ok, false);
  assert.equal(res.status, 422);
  assert.equal(typeof res.details.contrast_ratio, "number");
  assert.ok(res.details.contrast_ratio < 4.5);
  assert.ok(res.errors.some((e) => e.includes("Kontras")));
});

test("validatePair: ambang teks 4.5 dan non-teks 3", () => {
  assert.equal(AA_TEXT, 4.5);
  assert.equal(AA_NON_TEXT, 3);
  assert.equal(validatePair("#FFFFFF", "#000000").pass, true);
  assert.equal(validatePair("#FF0000", "#FFFFFF").pass, false); // 4.00 < 4.5
  assert.equal(validatePair("#FF0000", "#FFFFFF", AA_NON_TEXT).pass, true); // 4.00 >= 3
});

test("deriveBrandFg memilih warna dengan rasio tertinggi", () => {
  assert.equal(deriveBrandFg("#064E3B"), "#FFFFFF");
  assert.equal(deriveBrandFg("#FFD60A"), "#000000");
  assert.equal(deriveBrandFg("#808080"), "#000000");
});

// --- F-1: non-teks 3:1 mandatori dalam buildTenantThemeCss (bukan dependen pemanggil) -------
test("F-1: buildTenantThemeCss MENOLAK bila latar canvas/surface tidak disediakan", () => {
  // Reprosentasi bug asli: buildTenantThemeCss called tanpa opts.backgrounds →
  // pemeriksaan non-teks 3:1 tidak pernah berjalan. Perbaikan: wajib disediakan.
  const res = buildTenantThemeCss({ brand: "#064E3B" }, { brand: "#FFD60A" });
  assert.equal(res.ok, false, JSON.stringify(res));
  assert.ok(res.errors.some((e) => e.includes("SC 1.4.11")), `errors: ${res.errors}`);
  assert.equal(res.css, null);
});

test("F-1: buildTenantThemeCss memeriksa non-teks 3:1 terhadap latar masing-masing tema", () => {
  // Light bg: #FAFAF9 (canvas) + #FFFFFF (surface) — #064E3B → both ≥ 3:1 ✓
  // Dark bg: #0C0A09 (canvas) + #1C1917 (surface) — #FFD60A → both ≥ 3:1 ✓
  const res = buildTenantThemeCss(
    { brand: "#064E3B" },
    { brand: "#FFD60A" },
    {
      lightBg: { canvas: "#FAFAF9", surface: "#FFFFFF" },
      darkBg: { canvas: "#0C0A09", surface: "#1C1917" },
    },
  );
  assert.equal(res.ok, true, JSON.stringify(res));
  assert.ok(res.css.includes('[data-theme="dark"]'));
  assert.equal(res.light.brandFg, "#FFFFFF");
  assert.equal(res.dark.brandFg, "#000000");
});

test("F-1: buildTenantThemeCss gagal 422 bila light bg → brand fails 3:1", () => {
  // #AAAAAA vs light canvas #FFFFFF = 2.32:1 < 3 (non-teks SC 1.4.11) → light theme ditolak.
  // dark theme #FFD60A vs dark canvas = 14.9:1 ✓ — light theme gagal duluan (errors light).
  const res = buildTenantThemeCss(
    { brand: "#AAAAAA" }, // 2.32:1 vs #FFFFFF → <3 → fail
    { brand: "#FFD60A" }, // 14.9:1 vs dark canvas → pass
    {
      lightBg: { canvas: "#FAFAF9", surface: "#FFFFFF" },
      darkBg: { canvas: "#0C0A09", surface: "#1C1917" },
    },
  );
  assert.equal(res.ok, false);
  assert.equal(res.status, 422);
  assert.ok(res.errors.some((e) => e.includes("Kontras")));
});

test("F-1/F-2: buildTenantThemeCss gagal 422 bila dark bg → brand fails 3:1", () => {
  // #064E3B lolos tema terang (9.31:1 vs canvas #FAFAF9, 9.72:1 vs surface #FFFFFF)
  // tetapi GAGAL tema gelap: 2.03:1 vs canvas #0C0A09 (< 3, SC 1.4.11).
  const res = buildTenantThemeCss(
    { brand: "#064E3B" }, // passes light
    { brand: "#064E3B" }, // fails dark canvas
    {
      lightBg: { canvas: "#FAFAF9", surface: "#FFFFFF" },
      darkBg: { canvas: "#0C0A09", surface: "#1C1917" },
    },
  );
  assert.equal(res.ok, false);
  assert.equal(res.status, 422);
  assert.ok(res.errors.some((e) => e.includes("2.03")), `errors: ${res.errors}`);
});
// --- F-2: validasi per tema terhadap latarnya sendiri ------------------------------------
test("F-2: mode gelap aktif tidak boleh membuat merek terang 422 palsu", () => {
  // Regresi: dulu page memvalidasi t.light terhadap latar yang SEDANG aktif. Saat mode gelap
  // aktif, #064E3B diukur vs canvas gelap #0C0A09 → 2.03:1 → 422 palsu.
  const lightBg = { canvas: "#FAFAF9", surface: "#FFFFFF" };
  const darkBg = { canvas: "#0C0A09", surface: "#1C1917" };
  const light = validateTenantTheme({ brand: "#064E3B" }, { backgrounds: lightBg });
  const dark = validateTenantTheme({ brand: "#FFD60A" }, { backgrounds: darkBg });
  assert.equal(light.ok, true, JSON.stringify(light));
  assert.equal(dark.ok, true, JSON.stringify(dark));
  // dan bukti bahwa memakai latar gelap untuk tema terang memang gagal (sumber bug lama):
  const salah = validateTenantTheme({ brand: "#064E3B" }, { backgrounds: darkBg });
  assert.equal(salah.ok, false);
  assert.ok(salah.details.contrast_ratio < 3);
});
// --- injeksi non-warna ditolak -----------------------------------------------------------
const INJECTION_PAYLOADS = [
  "red; background-image:url(x)",
  "</style><script>alert(1)</script>",
  "rgb(0,0,0)}body{display:none",
  '#fff", x: y',
  "javascript:alert(1)",
  "\\6a avascript:", // pelolosan hex backslash
  "#GGGGGG",
  "#" + "0".repeat(198), // string 200 karakter (> max 64 parser)
];
test("parseColor mengembalikan null/undefined untuk payload injeksi", () => {
  for (const payload of INJECTION_PAYLOADS) {
    assert.ok(!parseColor(payload), `payload tidak boleh jadi warna: ${JSON.stringify(payload)}`);
  }
});

test("validateTenantTheme menolak payload injeksi (422, tidak menulis apa pun)", () => {
  for (const payload of INJECTION_PAYLOADS) {
    const res = validateTenantTheme({ brand: payload });
    assert.equal(res.ok, false, `payload: ${payload}`);
    assert.equal(res.status, 422, `payload: ${payload}`);
  }
});

// --- mode gelap: nilai tenant tidak menimpa [data-theme="dark"] ---------------------------

// F-1: buildTenantThemeCss now requires backgrounds; test updated.
test('buildTenantThemeCss ber-scope :root + [data-theme="dark"], tanpa nilai mentah lain', () => {
  const res = buildTenantThemeCss(
    { brand: "#064E3B" },
    { brand: "#FFD60A" },
    {
      lightBg: { canvas: "#FAFAF9", surface: "#FFFFFF" },
      darkBg: { canvas: "#0C0A09", surface: "#1C1917" },
    },
  );
  assert.equal(res.ok, true);
  // Brand-fg light: #064E3B → derive → #FFFFFF (rasio 9.72 vs putih ✓).
  // Brand-fg dark: #FFD60A → derive → #000000 (rasio 14.88 vs hitam ✓).
  assert.equal(
    res.css,
    ':root{--tg-brand:#064E3B;--tg-brand-fg:#FFFFFF;}[data-theme="dark"]{--tg-brand:#FFD60A;--tg-brand-fg:#000000;}',
  );
  assert.ok(res.css.startsWith(":root{"));
  assert.ok(res.css.includes('[data-theme="dark"]{'));
  for (const forbidden of ["url(", "<", ">", "javascript:", "alert(", "\\"]) {
    assert.ok(!res.css.includes(forbidden), `css tidak boleh memuat ${forbidden}`);
  }
  const decls = [...res.css.matchAll(/(--tg-[a-z-]+):#([0-9A-F]{6})/g)];
  assert.equal(decls.length, 4);
  for (const [, name, hex] of decls) {
    assert.ok(Object.values(THEME_VARS).includes(name), `variabel whitelist: ${name}`);
    assert.match(hex, /^[0-9A-F]{6}$/);
  }
});

test("buildTenantThemeCss gagal aman bila salah satu tema invalid (tanpa CSS parsial)", () => {
  const res = buildTenantThemeCss(
    { brand: "#064E3B" },
    { brand: "red; background-image:url(x)" },
    {
      lightBg: { canvas: "#FAFAF9", surface: "#FFFFFF" },
      darkBg: { canvas: "#0C0A09", surface: "#1C1917" },
    },
  );
  assert.equal(res.ok, false);
  assert.equal(res.css, null);
  assert.ok(res.errors.length > 0);
});

// --- injector DOM: hanya lewat createElement("style") + textContent ------------------------
function createFakeDoc() {
  const styles = [];
  const makeEl = (tag) => {
    const el = {
      tagName: tag.toUpperCase(),
      attrs: {},
      _text: "",
      _innerWrites: 0,
      setAttribute(k, v) {
        this.attrs[k] = v;
      },
      getAttribute(k) {
        return this.attrs[k] ?? null;
      },
      get textContent() {
        return this._text;
      },
      set textContent(v) {
        this._text = String(v ?? "");
      },
      get innerHTML() {
        return this._text;
      },
      set innerHTML(_v) {
        this._innerWrites++; // harus tetap 0: injektor dilarang pakai innerHTML
      },
    };
    return el;
  };
  const head = {
    querySelector() {
      return styles.at(-1) ?? null;
    },
    appendChild(el) {
      if (el.tagName === "STYLE") styles.push(el);
    },
    replaceChild(newEl, oldEl) {
      const idx = styles.indexOf(oldEl);
      if (idx !== -1) styles[idx] = newEl;
    },
  };
  const root = makeEl("html");
  return {
    documentElement: root,
    head,
    styles,
    createElement: makeEl,
    appendChild() {},
  };
}

// F-2: injectTenantTheme now requires backgrounds — test updated.
test("injectTenantTheme menulis style via textContent (bukan innerHTML), dua selector", () => {
  const doc = createFakeDoc();
  const res = injectTenantTheme(
    doc,
    { brand: "#064E3B" },
    { brand: "#FFD60A" },
    {
      lightBg: { canvas: "#FAFAF9", surface: "#FFFFFF" },
      darkBg: { canvas: "#0C0A09", surface: "#1C1917" },
    },
  );
  assert.equal(res.ok, true);
  assert.equal(doc.styles.length, 1);
  const el = doc.styles[0];
  assert.equal(el.getAttribute("data-tg-tenant-theme"), "");
  assert.equal(
    el.textContent,
    ':root{--tg-brand:#064E3B;--tg-brand-fg:#FFFFFF;}[data-theme="dark"]{--tg-brand:#FFD60A;--tg-brand-fg:#000000;}',
  );
  assert.equal(el._innerWrites, 0, "tidak boleh memakai innerHTML");
  assert.equal(
    doc.documentElement.attrs["style"],
    undefined,
    "tidak boleh inline style pada html (menimpa dark)",
  );
});

test("injectTenantTheme gagal aman: payload tidak menulis elemen style", () => {
  const doc = createFakeDoc();
  const res = injectTenantTheme(
    doc,
    { brand: "javascript:alert(1)" },
    { brand: "#064E3B" },
    {
      lightBg: { canvas: "#FAFAF9", surface: "#FFFFFF" },
      darkBg: { canvas: "#0C0A09", surface: "#1C1917" },
    },
  );
  assert.equal(res.ok, false);
  assert.equal(doc.styles.length, 0);
});

test("injectTenantTheme tanpa backgrounds → gagal 422 (F-1)", () => {
  const doc = createFakeDoc();
  const res = injectTenantTheme(
    doc,
    { brand: "#064E3B" },
    { brand: "#FFD60A" },
    // bgs tidak disediakan
  );
  assert.equal(res.ok, false);
  assert.ok(res.errors.some((e) => e.includes("SC 1.4.11")));
  assert.equal(doc.styles.length, 0);
});

// --- F-8/F-10/F-11: resolveColorVar (fake doc, tanpa DOM sungguhan) ----------------------
function createProbeDoc({ resolved = "", throwOnComputedStyle = false } = {}) {
  const root = {
    dataset: {},
    children: [],
    appendChild(el) {
      this.children.push(el);
    },
  };
  let probe = null;
  return {
    documentElement: root,
    createElement() {
      probe = {
        style: { cssText: "", backgroundColor: "" },
        remove() {
          const i = root.children.indexOf(this);
          if (i !== -1) root.children.splice(i, 1);
        },
      };
      return probe;
    },
    defaultView: {
      getComputedStyle() {
        if (throwOnComputedStyle) throw new Error("getComputedStyle gagal");
        return { backgroundColor: resolved };
      },
    },
    get probe() {
      return probe;
    },
  };
}

test("F-11a: resolveColorVar mengembalikan #RRGGBB dan memulihkan data-theme", () => {
  const doc = createProbeDoc({ resolved: "rgb(6, 78, 59)" });
  doc.documentElement.dataset.theme = "dark";
  const out = resolveColorVar(doc, "--tg-brand", "light");
  assert.equal(out, "#064E3B");
  assert.equal(doc.documentElement.dataset.theme, "dark");
  assert.equal(doc.documentElement.children.length, 0, "probe harus dihapus");
});

test("F-8/F-11b: data-theme + probe dipulihkan walau getComputedStyle melempar", () => {
  const doc = createProbeDoc({ throwOnComputedStyle: true });
  assert.throws(() => resolveColorVar(doc, "--tg-canvas", "dark"), /getComputedStyle gagal/);
  assert.equal(doc.documentElement.children.length, 0, "probe tidak boleh tertinggal di <html>");
  assert.equal("theme" in doc.documentElement.dataset, false, "data-theme dipulihkan ke semula");
});

test('F-11c: resolveColorVar mengembalikan "" (bukan undefined) untuk variabel tak terdefinisi', () => {
  const doc = createProbeDoc({ resolved: "rgba(0, 0, 0, 0)" });
  const out = resolveColorVar(doc, "--tg-tidak-ada");
  assert.equal(out, "");
  assert.equal(typeof out, "string");
});

test("F-10: resolveColorVar menolak name bukan literal kode (TypeError, fail loud)", () => {
  const doc = createProbeDoc({ resolved: "#FFFFFF" });
  assert.throws(() => resolveColorVar(doc, "var(--x); body{display:none}"), TypeError);
  assert.throws(() => resolveColorVar(doc, "--tg ok"), TypeError);
  assert.throws(() => resolveColorVar(doc, ""), TypeError);
  assert.equal(doc.documentElement.children.length, 0, "tidak menyentuh DOM");
});

test("F-9: latar tidak sah → 422 tanpa exception (validator + buildTenantThemeCss)", () => {
  const res = validateTenantTheme(
    { brand: "#064E3B" },
    { backgrounds: { canvas: "nope", surface: "#FFFFFF" } },
  );
  assert.equal(res.ok, false, JSON.stringify(res));
  assert.equal(res.status, 422);
  assert.ok(res.errors.some((e) => e.includes("latar canvas")), JSON.stringify(res.errors));

  const built = buildTenantThemeCss(
    { brand: "#064E3B" },
    { brand: "#FFD60A" },
    {
      lightBg: { canvas: "nope", surface: "#FFFFFF" },
      darkBg: { canvas: "#0C0A09", surface: "#1C1917" },
    },
  );
  assert.equal(built.ok, false, JSON.stringify(built));
  assert.equal(built.status, 422);
  assert.equal(built.css, null);
});
