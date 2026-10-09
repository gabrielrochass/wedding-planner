"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import {
  type ActionResult,
  failure,
  failureFor,
  forbidden,
} from "@/lib/action-result";
import { canHelp } from "@/lib/roles";
import {
  type BulkHouseholdsInput,
  bulkHouseholdsInput,
  fieldErrors,
  type HouseholdInput,
  householdInput,
  isoDate,
} from "@/lib/schemas";
import { Constants } from "@/lib/supabase/database.types";
import { requireWedding } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/whatsapp";

const enums = Constants.public.Enums;

async function requireHelper() {
  const context = await requireWedding();
  return canHelp(context.role) ? context : null;
}

export async function saveHousehold(
  input: HouseholdInput,
  isNew: boolean,
): Promise<ActionResult> {
  const parsed = householdInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const h = parsed.data;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { supabase, wedding } = context;
  const fields = {
    name: h.name,
    side: h.side,
    list: h.list,
    phone: h.phone ? (normalizePhone(h.phone) ?? h.phone) : null,
    address: h.address,
    notes: h.notes,
    save_the_date_on: h.saveTheDateOn,
    invited_on: h.invitedOn,
    gift: h.gift,
    thanked_on: h.thankedOn,
  };
  const { error } = isNew
    ? await supabase
        .from("households")
        .upsert(
          { id: h.id, wedding_id: wedding.id, ...fields },
          { onConflict: "id", ignoreDuplicates: true },
        )
    : await supabase
        .from("households")
        .update(fields)
        .eq("wedding_id", wedding.id)
        .eq("id", h.id);
  if (error) return failureFor(error);

  const { data: existing, error: readError } = await supabase
    .from("guests")
    .select("id")
    .eq("wedding_id", wedding.id)
    .eq("household_id", h.id);
  if (readError) return failure;
  const existingIds = new Set(existing.map((row) => row.id));
  const keptIds = new Set(h.members.map((member) => member.id));
  const removed = [...existingIds].filter((id) => !keptIds.has(id));

  const memberFields = (member: (typeof h.members)[number], index: number) => ({
    name: member.name,
    age_band: member.ageBand,
    is_plus_one: member.isPlusOne,
    dietary: member.dietary,
    sort_order: index,
  });

  const created = h.members
    .map((member, index) => ({ member, index }))
    .filter(({ member }) => !existingIds.has(member.id))
    .map(({ member, index }) => ({
      id: member.id,
      wedding_id: wedding.id,
      household_id: h.id,
      rsvp: member.rsvp,
      ...memberFields(member, index),
    }));

  const results = await Promise.all([
    removed.length
      ? supabase
          .from("guests")
          .delete()
          .eq("wedding_id", wedding.id)
          .in("id", removed)
      : null,
    created.length ? supabase.from("guests").insert(created) : null,
    ...h.members
      .map((member, index) => ({ member, index }))
      .filter(({ member }) => existingIds.has(member.id))
      .map(({ member, index }) =>
        supabase
          .from("guests")
          .update(memberFields(member, index))
          .eq("wedding_id", wedding.id)
          .eq("id", member.id),
      ),
  ]);
  const failed = results.find((result) => result?.error);
  if (failed?.error) return failureFor(failed.error);

  refresh();
  return { ok: true };
}

export async function addHouseholds(
  input: BulkHouseholdsInput,
): Promise<ActionResult> {
  const parsed = bulkHouseholdsInput.safeParse(input);
  if (!parsed.success) return failure;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { supabase, wedding } = context;
  const { error } = await supabase.from("households").upsert(
    parsed.data.map((h) => ({
      id: h.id,
      wedding_id: wedding.id,
      name: h.name,
      list: "pending" as const,
    })),
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (error) return failureFor(error);
  const { error: guestsError } = await supabase.from("guests").upsert(
    parsed.data.flatMap((h) =>
      h.members.map((member, index) => ({
        id: member.id,
        wedding_id: wedding.id,
        household_id: h.id,
        name: member.name,
        sort_order: index,
      })),
    ),
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (guestsError) return failureFor(guestsError);
  refresh();
  return { ok: true };
}

export async function setHouseholdList(
  id: string,
  list: string,
): Promise<ActionResult> {
  const parsed = z
    .object({ id: z.uuid(), list: z.enum(enums.guest_list) })
    .safeParse({ id, list });
  if (!parsed.success) return failure;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { error } = await context.supabase
    .from("households")
    .update({ list: parsed.data.list })
    .eq("wedding_id", context.wedding.id)
    .eq("id", parsed.data.id);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function setHouseholdMark(
  id: string,
  mark: string,
  on: string | null,
): Promise<ActionResult> {
  const parsed = z
    .object({
      id: z.uuid(),
      mark: z.enum(["saveTheDate", "invited", "thanked"]),
      on: isoDate.nullable(),
    })
    .safeParse({ id, mark, on });
  if (!parsed.success) return failure;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { mark: kind, on: date } = parsed.data;
  const { error } = await context.supabase
    .from("households")
    .update(
      kind === "saveTheDate"
        ? { save_the_date_on: date }
        : kind === "invited"
          ? { invited_on: date }
          : { thanked_on: date },
    )
    .eq("wedding_id", context.wedding.id)
    .eq("id", parsed.data.id);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function setGuestRsvp(
  id: string,
  rsvp: string,
): Promise<ActionResult> {
  const parsed = z
    .object({ id: z.uuid(), rsvp: z.enum(enums.rsvp_status) })
    .safeParse({ id, rsvp });
  if (!parsed.success) return failure;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { error } = await context.supabase
    .from("guests")
    .update({ rsvp: parsed.data.rsvp })
    .eq("wedding_id", context.wedding.id)
    .eq("id", parsed.data.id);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function deleteHousehold(id: string): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return failure;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { error } = await context.supabase
    .from("households")
    .delete()
    .eq("wedding_id", context.wedding.id)
    .eq("id", parsed.data);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}
