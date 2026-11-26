"use client";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@trailgate/ui";

const LINKS: ReadonlyArray<readonly [string, string]> = [
  ["/katalog", "Ringkasan"],
  ["/katalog/button", "Button"],
  ["/katalog/input", "Input"],
  ["/katalog/select", "Select"],
  ["/katalog/dialog", "Dialog"],
  ["/katalog/sheet", "Sheet"],
  ["/katalog/tabs", "Tabs"],
  ["/katalog/toast", "Toast"],
  ["/katalog/table", "DataTable"],
  ["/katalog/calendar", "Calendar kuota"],
  ["/katalog/status-badge", "StatusBadge"],
  ["/katalog/quota-meter", "QuotaMeter"],
  ["/katalog/stepper", "Stepper"],
  ["/katalog/tenant-theme", "Tema tenant"],
];

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      className="ml-auto flex size-11 items-center justify-center rounded-md border border-border-strong bg-surface text-sm text-fg hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      {dark ? "☀" : "☾"}
      <span className="sr-only">{dark ? "Aktifkan tema terang" : "Aktifkan tema gelap"}</span>
    </button>
  );
}

export function KatalogNav({ current }: { current?: string }) {
  return (
    <nav
      aria-label="Navigasi katalog"
      className="flex flex-wrap items-center gap-2 border-b border-border pb-4"
    >
      {LINKS.map(([href, label]) => {
        const isCurrent = href === current;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors ease-standard",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              isCurrent
                ? "bg-surface-raised font-medium text-fg"
                : "text-fg-muted hover:bg-surface-raised hover:text-fg",
            )}
          >
            {label}
          </Link>
        );
      })}
      <ThemeToggle />
    </nav>
  );
}
