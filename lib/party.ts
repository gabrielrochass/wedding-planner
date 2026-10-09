import type { Enums } from "@/lib/supabase/database.types";

export const partyRoles = [
  "padrinho",
  "madrinha",
  "dama",
  "pajem",
  "florista",
  "aliancas",
  "pais",
  "celebrante",
  "testemunha",
  "outro",
] as const;

export type PartyRole = (typeof partyRoles)[number];

export type PartyRow = {
  id: string;
  side: Enums<"guest_side">;
  pair_id: string | null;
  entrance_order: number;
};

export function inEntranceOrder<T extends PartyRow>(members: readonly T[]) {
  return members.toSorted((a, b) => a.entrance_order - b.entrance_order);
}

function place<T extends PartyRow>(group: readonly T[]) {
  const [first, second] = group;
  if (!second) {
    return first.side === "b"
      ? { left: null, right: first }
      : { left: first, right: null };
  }
  return first.side === "b" || second.side === "a"
    ? { left: second, right: first }
    : { left: first, right: second };
}

export function pairs<T extends PartyRow>(members: readonly T[]) {
  const byId = new Map(members.map((member) => [member.id, member]));
  const seen = new Set<string>();
  const rows: { left: T | null; right: T | null }[] = [];
  for (const member of inEntranceOrder(members)) {
    if (seen.has(member.id)) continue;
    seen.add(member.id);
    const partner = member.pair_id ? byId.get(member.pair_id) : undefined;
    if (partner && !seen.has(partner.id)) {
      seen.add(partner.id);
      rows.push(place([member, partner]));
    } else {
      rows.push(place([member]));
    }
  }
  return rows;
}

export function moveRow<T extends PartyRow>(
  members: readonly T[],
  id: string,
  delta: -1 | 1,
) {
  const rows = pairs(members);
  const index = rows.findIndex(
    (row) => row.left?.id === id || row.right?.id === id,
  );
  const target = index + delta;
  if (index === -1 || target < 0 || target >= rows.length) return null;
  [rows[index], rows[target]] = [rows[target], rows[index]];
  return rows.flatMap((row, position) =>
    [row.left, row.right].flatMap((member, offset) =>
      member ? [{ id: member.id, entrance_order: position * 2 + offset }] : [],
    ),
  );
}
