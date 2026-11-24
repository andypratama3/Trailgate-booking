export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-4 p-6">
      <h1 className="text-3xl font-semibold">TrailGate</h1>
      <p className="text-base">
        Kerangka web publik + konsol. Halaman produk dibangun oleh tg-web dan tg-console.
      </p>
      <p className="text-sm opacity-70">API: {process.env.NEXT_PUBLIC_API_URL ?? "(belum diset)"}</p>
    </main>
  );
}
