import type { Enums } from "@/lib/supabase/database.types";

type AgeBand = Enums<"age_band">;
type Side = Enums<"guest_side">;
type List = Enums<"guest_list">;
type Rsvp = Enums<"rsvp_status">;

export const ageBands = ["adult", "teen", "child", "baby"] as const;
export const sides = ["a", "b", "both"] as const;
export const lists = ["pending", "a", "b", "out"] as const;
export const rsvps = ["pending", "yes", "no"] as const;

export type HouseholdRow = {
  id: string;
  side: Side;
  list: List;
  save_the_date_on: string | null;
  invited_on: string | null;
  thanked_on: string | null;
  gift: string | null;
};

export type GuestRow = {
  household_id: string;
  age_band: AgeBand;
  rsvp: Rsvp;
};

const zeroBands = (): Record<AgeBand, number> => ({
  adult: 0,
  teen: 0,
  child: 0,
  baby: 0,
});

export function headcount(
  households: readonly HouseholdRow[],
  guests: readonly GuestRow[],
) {
  const householdById = new Map(households.map((h) => [h.id, h]));
  const byList: Record<List, number> = { pending: 0, a: 0, b: 0, out: 0 };
  const bySide: Record<Side, number> = { a: 0, b: 0, both: 0 };
  const bands = zeroBands();
  const confirmedBands = zeroBands();
  const rsvp: Record<Rsvp, number> = { pending: 0, yes: 0, no: 0 };
  const pendingHouseholds = new Set<string>();
  const membersByHousehold = new Map<string, number>();

  for (const guest of guests) {
    membersByHousehold.set(
      guest.household_id,
      (membersByHousehold.get(guest.household_id) ?? 0) + 1,
    );
    if (guest.rsvp === "pending") pendingHouseholds.add(guest.household_id);
    const household = householdById.get(guest.household_id);
    if (!household) continue;
    byList[household.list] += 1;
    if (household.list !== "a") continue;
    bySide[household.side] += 1;
    bands[guest.age_band] += 1;
    rsvp[guest.rsvp] += 1;
    if (guest.rsvp === "yes") confirmedBands[guest.age_band] += 1;
  }

  const invited = households.filter((h) => h.list === "a");
  return {
    byList,
    bySide,
    bands,
    confirmedBands,
    rsvp,
    invitedGuests: byList.a,
    expectedGuests: byList.a - rsvp.no,
    funnel: {
      listed: invited.length,
      saveTheDate: invited.filter((h) => h.save_the_date_on).length,
      invited: invited.filter((h) => h.invited_on).length,
      answered: invited.filter(
        (h) =>
          (membersByHousehold.get(h.id) ?? 0) > 0 &&
          !pendingHouseholds.has(h.id),
      ).length,
    },
    gifts: households.filter((h) => h.gift).length,
    thanked: households.filter((h) => h.gift && h.thanked_on).length,
  };
}

const separators = /\s*(?:,|;|&|\+|\s+e\s+)\s*/i;

export type ParsedHousehold = { name: string; members: string[] };

export function parseGuestLines(text: string): ParsedHousehold[] {
  const seen = new Set<string>();
  const result: ParsedHousehold[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw
      .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
    if (!line) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const members = line
      .split(separators)
      .map((name) => name.trim())
      .filter(Boolean)
      .slice(0, 12);
    result.push({ name: line, members: members.length ? members : [line] });
  }
  return result.slice(0, 300);
}

export function initials(name: string) {
  const words = name
    .split(/\s+/)
    .filter((word) => word.length > 2 || /^[A-ZÀ-Ý]/.test(word));
  const picked = words.length >= 2 ? [words[0], words.at(-1)] : words;
  return picked
    .map((word) => word?.charAt(0).toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}
