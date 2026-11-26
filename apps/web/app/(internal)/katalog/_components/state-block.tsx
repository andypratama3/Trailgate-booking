import type { ReactNode } from "react";

export interface StateBlockProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}

/** Kartu satu state per komponen di katalog. */
export function StateBlock({ title, description, children }: StateBlockProps) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm">
      <header className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-subtle">{title}</h2>
        {description && <p className="text-sm text-fg-muted">{description}</p>}
      </header>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}
