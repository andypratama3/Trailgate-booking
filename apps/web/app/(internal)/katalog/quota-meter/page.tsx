"use client";
import { QuotaMeter } from "@trailgate/ui";
import { KatalogNav } from "../_components/nav";
import { StateBlock } from "../_components/state-block";

export default function KatalogQuotaMeterPage() {
  return (
    <div className="flex flex-col gap-6">
      <KatalogNav current="/katalog/quota-meter" />
      <h1 className="text-2xl font-semibold text-fg">QuotaMeter</h1>
      <p className="text-base text-fg-muted">
        Sisa kuota sebagai progressbar — selalu disertai angka (tidak warna saja);
        tone otomatis: sukses / peringatan / berbahaya.
      </p>

      <StateBlock title="Default" description="Beragam rasio sisa kuota [DEMO].">
        <QuotaMeter label="Kuota tersisa" remaining={120} capacity={300} />
        <QuotaMeter label="Kuota tersisa" remaining={8} capacity={300} />
        <QuotaMeter label="Kuota tersisa" remaining={0} capacity={300} />
      </StateBlock>

      <StateBlock title="Loading" description="Skeleton bar + role=status.">
        <QuotaMeter label="Kuota tersisa" loading />
      </StateBlock>

      <StateBlock title="Empty" description="Tanpa kapasitas → 'Kuota belum diumumkan'.">
        <QuotaMeter label="Kuota tersisa" />
      </StateBlock>

      <StateBlock title="Error" description="role=alert + Coba lagi.">
        <QuotaMeter label="Kuota tersisa" error="Kuota tidak bisa dimuat." onRetry={() => undefined} />
      </StateBlock>
    </div>
  );
}
