/**
 * ID field SSR-aman (tanpa hook) untuk <label htmlFor> ↔ kontrol.
 * Dipakai bersama oleh Input & Select agar pola id seragam.
 */
export function fieldId(prefix: string, label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${prefix}-${slug || "field"}`;
}