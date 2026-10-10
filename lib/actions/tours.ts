"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { type ActionResult, failure, failureFor } from "@/lib/action-result";
import { requireUser } from "@/lib/supabase/server";
import { tourIds } from "@/lib/tour";

export async function markTourSeen(id: string): Promise<ActionResult> {
  const parsed = z.enum(tourIds as [string, ...string[]]).safeParse(id);
  if (!parsed.success) return failure;
  const { supabase, userId } = await requireUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("tours_seen")
    .eq("id", userId)
    .single();
  if (error) return failureFor(error);
  if (data.tours_seen.includes(parsed.data)) return { ok: true };
  const { error: saveError } = await supabase
    .from("profiles")
    .update({ tours_seen: [...data.tours_seen, parsed.data] })
    .eq("id", userId);
  if (saveError) return failureFor(saveError);
  return { ok: true };
}

export async function replayPageTours() {
  const { supabase, userId } = await requireUser();
  await supabase
    .from("profiles")
    .update({ tours_seen: ["geral"] })
    .eq("id", userId);
  redirect("/");
}
