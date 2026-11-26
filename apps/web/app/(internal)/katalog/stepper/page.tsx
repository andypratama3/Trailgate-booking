"use client";
import { Stepper, type StepperStep } from "@trailgate/ui";
import { KatalogNav } from "../_components/nav";
import { StateBlock } from "../_components/state-block";

const STEPS: StepperStep[] = [
  { id: "tanggal", label: "Tanggal & kuota" },
  { id: "data", label: "Data rombongan" },
  { id: "bayar", label: "Bayar" },
  { id: "tiket", label: "Tiket" },
];

export default function KatalogStepperPage() {
  return (
    <div className="flex flex-col gap-6">
      <KatalogNav current="/katalog/stepper" />
      <h1 className="text-2xl font-semibold text-fg">Stepper</h1>
      <p className="text-base text-fg-muted">
        Wizard booking 4 langkah — aria-current=&quot;step&quot; + label status teks
        (accessibility.md §4).
      </p>

      <StateBlock title="Default" description="Langkah 2 aktif (index 1 dari 4).">
        <Stepper steps={STEPS} current={1} label="Langkah booking" />
      </StateBlock>

      <StateBlock title="Empty" description="Tanpa langkah → 'Belum ada langkah.'">
        <Stepper steps={[]} current={0} label="Langkah booking" />
      </StateBlock>

      <StateBlock title="Loading" description="Skeleton + role=status.">
        <Stepper steps={STEPS} current={1} loading label="Langkah booking" />
      </StateBlock>

      <StateBlock title="Error" description="role=alert.">
        <Stepper steps={STEPS} current={1} error="Progres booking tidak bisa dimuat." label="Langkah booking" />
      </StateBlock>

      <StateBlock title="Klik langkah" description="Dapat dinavigasi dengan klik (onStepClick).">
        <Stepper steps={STEPS} current={2} onStepClick={() => undefined} label="Langkah booking" />
      </StateBlock>
    </div>
  );
}
