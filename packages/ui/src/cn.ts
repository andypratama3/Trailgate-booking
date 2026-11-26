export type ClassValue = string | false | null | undefined;

/** Gabung kelas Tailwind tanpa dependensi (port kecil dari `clsx` shadcn). */
export function cn(...values: ClassValue[]): string {
  return values.filter((value) => value !== false && value != null && value !== "").join(" ");
}