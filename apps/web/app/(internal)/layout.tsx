import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Katalog Komponen — TrailGate",
  description: "Katalog internal komponen packages/ui milik sendiri (T-011).",
};

export default function InternalLayout({ children }: { children: ReactNode }) {
  return <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">{children}</main>;
}
