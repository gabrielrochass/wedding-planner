import type { Enums } from "@/lib/supabase/database.types";

export type VendorStatus = Enums<"vendor_status">;

export const vendorStatuses = [
  "researching",
  "quoted",
  "visiting",
  "favorite",
  "hired",
  "discarded",
] as const satisfies readonly VendorStatus[];

export type VendorRow = {
  id: string;
  category_id: string | null;
  status: VendorStatus;
  quote_cents: number | null;
};

export function groupByStatus<T extends VendorRow>(vendors: readonly T[]) {
  return vendorStatuses.map(
    (status) => [status, vendors.filter((v) => v.status === status)] as const,
  );
}

export function comparable<T extends VendorRow>(
  vendors: readonly T[],
  categoryId: string,
) {
  return vendors.filter(
    (v) => v.category_id === categoryId && v.status !== "discarded",
  );
}

export function cheapestQuote(vendors: readonly VendorRow[]) {
  let best: VendorRow | null = null;
  for (const vendor of vendors) {
    if (vendor.quote_cents === null) continue;
    if (!best || vendor.quote_cents < (best.quote_cents ?? Infinity)) {
      best = vendor;
    }
  }
  return best?.id ?? null;
}

export function normalizeInstagram(raw: string) {
  const handle = raw
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "");
  return /^[a-z0-9._]{1,30}$/i.test(handle) ? handle : null;
}

export function safeWebsite(raw: string) {
  const text = raw.trim();
  if (!text) return null;
  const url = URL.parse(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  return url && (url.protocol === "https:" || url.protocol === "http:")
    ? url.toString()
    : null;
}
