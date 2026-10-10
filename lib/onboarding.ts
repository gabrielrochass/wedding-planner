export const personas = ["couple", "planner", "family"] as const;
export type Persona = (typeof personas)[number];

export const heardFrom = [
  "instagram",
  "tiktok",
  "google",
  "friends",
  "vendor",
  "other",
] as const;
export type HeardFrom = (typeof heardFrom)[number];

export const dateModes = ["exact", "month", "unknown"] as const;
export type DateMode = (typeof dateModes)[number];

export const guestPresets = [50, 100, 150, 200, 300] as const;

export const budgetPresets = [
  3_000_000, 6_000_000, 10_000_000, 15_000_000, 25_000_000,
] as const;

export const maxPriorities = 3;

export function weddingDateFor(
  mode: DateMode,
  exact: string,
  month: string,
): { date: string | null; estimate: boolean } {
  if (mode === "exact" && exact) return { date: exact, estimate: false };
  if (mode === "month" && month) return { date: `${month}-01`, estimate: true };
  return { date: null, estimate: false };
}

export function toggle<T>(list: readonly T[], value: T, max = Infinity): T[] {
  if (list.includes(value)) return list.filter((item) => item !== value);
  return list.length >= max ? [...list] : [...list, value];
}
