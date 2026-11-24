import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrailGate POS",
    short_name: "TrailGate POS",
    description: "Aplikasi petugas pos: check-in/check-out pendaki dengan mode offline.",
    start_url: "/",
    // PWA manifest dibaca OS/browser sebelum CSS dimuat, jadi `var(--tg-primary)`
    // tidak tersedia; nilai di sini kontrak PWA statis (W3C Web App Manifest
    // §theme_color/§background_color), bukan token komponen. Lihat
    // docs/ux/token-pipeline.md §8. Hex = --tg-primary (teal-700) + permukaan terang.
    display: "standalone",
    background_color: "#ffffff", // tg-token-lint:allow
    theme_color: "#0f766e", // tg-token-lint:allow
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
