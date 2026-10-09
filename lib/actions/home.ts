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
  fieldErrors,
  type HomeItemInput,
  type HomeItemsBulkInput,
  homeItemInput,
  homeItemsBulkInput,
} from "@/lib/schemas";
import { Constants } from "@/lib/supabase/database.types";
import { requireWedding } from "@/lib/supabase/server";

async function requireHelper() {
  const context = await requireWedding();
  return canHelp(context.role) ? context : null;
}

export async function saveHomeItem(
  input: HomeItemInput,
  isNew: boolean,
): Promise<ActionResult> {
  const parsed = homeItemInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const item = parsed.data;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { supabase, wedding } = context;
  const fields = {
    room: item.room,
    name: item.name,
    quantity: item.quantity,
    priority: item.priority,
    status: item.status,
    estimate_cents: item.estimateCents,
    paid_cents: item.paidCents,
    store: item.store,
    url: item.url,
    household_id: item.status === "gifted" ? item.householdId : null,
    notes: item.notes,
  };
  const { error } = isNew
    ? await supabase
        .from("home_items")
        .upsert(
          { id: item.id, wedding_id: wedding.id, ...fields },
          { onConflict: "id", ignoreDuplicates: true },
        )
    : await supabase
        .from("home_items")
        .update(fields)
        .eq("wedding_id", wedding.id)
        .eq("id", item.id);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function setHomeStatus(
  id: string,
  status: string,
): Promise<ActionResult> {
  const parsed = z
    .object({
      id: z.uuid(),
      status: z.enum(Constants.public.Enums.home_status),
    })
    .safeParse({ id, status });
  if (!parsed.success) return failure;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { error } = await context.supabase
    .from("home_items")
    .update({
      status: parsed.data.status,
      ...(parsed.data.status === "gifted" ? {} : { household_id: null }),
    })
    .eq("wedding_id", context.wedding.id)
    .eq("id", parsed.data.id);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function addHomeItems(
  input: HomeItemsBulkInput,
): Promise<ActionResult> {
  const parsed = homeItemsBulkInput.safeParse(input);
  if (!parsed.success) return failure;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { supabase, wedding } = context;
  const { data: existing, error: readError } = await supabase
    .from("home_items")
    .select("name")
    .eq("wedding_id", wedding.id);
  if (readError) return failure;
  const taken = new Set(existing.map((row) => row.name.toLowerCase()));
  const rows = parsed.data
    .filter((item) => !taken.has(item.name.toLowerCase()))
    .map((item) => ({
      wedding_id: wedding.id,
      name: item.name,
      room: item.room,
      quantity: item.quantity,
      priority: item.priority,
      status: item.status,
      estimate_cents: item.estimateCents,
    }));
  if (rows.length > 0) {
    const { error } = await supabase.from("home_items").insert(rows);
    if (error) return failureFor(error);
  }
  refresh();
  return { ok: true };
}

export async function deleteHomeItem(id: string): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return failure;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { error } = await context.supabase
    .from("home_items")
    .delete()
    .eq("wedding_id", context.wedding.id)
    .eq("id", parsed.data);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}
