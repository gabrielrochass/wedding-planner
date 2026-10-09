"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import {
  type ActionResult,
  failure,
  failureFor,
  forbidden,
} from "@/lib/action-result";
import { moveRow } from "@/lib/party";
import { canHelp } from "@/lib/roles";
import {
  fieldErrors,
  type IdeaInput,
  ideaInput,
  type PartyInput,
  partyInput,
  type SongInput,
  songInput,
  type TimelineInput,
  timelineInput,
} from "@/lib/schemas";
import { requireWedding } from "@/lib/supabase/server";

async function requireHelper() {
  const context = await requireWedding();
  return canHelp(context.role) ? context : null;
}

async function removeImage(path: string | null) {
  if (!path) return;
  const { supabase } = await requireWedding();
  await supabase.storage.from("ideias").remove([path]);
}

export async function saveIdea(
  input: IdeaInput,
  isNew: boolean,
): Promise<ActionResult> {
  const parsed = ideaInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const idea = parsed.data;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { supabase, wedding } = context;
  if (
    idea.imagePath &&
    !idea.imagePath.startsWith(`${wedding.id}/${idea.id}/`)
  ) {
    return failure;
  }
  const fields = {
    board: idea.board,
    title: idea.title,
    notes: idea.notes,
    url: idea.url,
    image_path: idea.imagePath,
    status: idea.status,
    estimate_cents: idea.estimateCents,
    vendor_id: idea.vendorId,
  };
  if (isNew) {
    const { error } = await supabase
      .from("ideas")
      .upsert(
        { id: idea.id, wedding_id: wedding.id, ...fields },
        { onConflict: "id", ignoreDuplicates: true },
      );
    if (error) return failureFor(error);
  } else {
    const { data: current } = await supabase
      .from("ideas")
      .select("image_path")
      .eq("wedding_id", wedding.id)
      .eq("id", idea.id)
      .maybeSingle();
    const { error } = await supabase
      .from("ideas")
      .update(fields)
      .eq("wedding_id", wedding.id)
      .eq("id", idea.id);
    if (error) return failureFor(error);
    if (current?.image_path && current.image_path !== idea.imagePath) {
      await removeImage(current.image_path);
    }
  }
  refresh();
  return { ok: true };
}

export async function deleteIdea(id: string): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return failure;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { data, error } = await context.supabase
    .from("ideas")
    .delete()
    .eq("wedding_id", context.wedding.id)
    .eq("id", parsed.data)
    .select("image_path")
    .maybeSingle();
  if (error) return failureFor(error);
  await removeImage(data?.image_path ?? null);
  refresh();
  return { ok: true };
}

export async function saveSong(
  input: SongInput,
  isNew: boolean,
): Promise<ActionResult> {
  const parsed = songInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const song = parsed.data;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { supabase, wedding } = context;
  const fields = {
    moment: song.moment,
    title: song.title,
    artist: song.artist,
    url: song.url,
    chosen: song.chosen,
  };
  const { error } = isNew
    ? await supabase
        .from("songs")
        .upsert(
          { id: song.id, wedding_id: wedding.id, ...fields },
          { onConflict: "id", ignoreDuplicates: true },
        )
    : await supabase
        .from("songs")
        .update(fields)
        .eq("wedding_id", wedding.id)
        .eq("id", song.id);
  if (error) return failureFor(error);
  if (song.chosen) {
    await supabase
      .from("songs")
      .update({ chosen: false })
      .eq("wedding_id", wedding.id)
      .eq("moment", song.moment)
      .neq("id", song.id)
      .not("moment", "in", "(festa,nao-tocar)");
  }
  refresh();
  return { ok: true };
}

export async function chooseSong(
  id: string,
  chosen: boolean,
): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return failure;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { supabase, wedding } = context;
  const { data: song, error: readError } = await supabase
    .from("songs")
    .select("moment")
    .eq("wedding_id", wedding.id)
    .eq("id", parsed.data)
    .maybeSingle();
  if (readError || !song) return failure;
  if (chosen && song.moment !== "festa" && song.moment !== "nao-tocar") {
    await supabase
      .from("songs")
      .update({ chosen: false })
      .eq("wedding_id", wedding.id)
      .eq("moment", song.moment);
  }
  const { error } = await supabase
    .from("songs")
    .update({ chosen })
    .eq("wedding_id", wedding.id)
    .eq("id", parsed.data);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function deleteSong(id: string): Promise<ActionResult> {
  return deleteFrom("songs", id);
}

export async function savePartyMember(
  input: PartyInput,
  isNew: boolean,
): Promise<ActionResult> {
  const parsed = partyInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const member = parsed.data;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { supabase, wedding } = context;
  const fields = {
    name: member.name,
    role: member.role,
    side: member.side,
    pair_id: member.pairId === member.id ? null : member.pairId,
    attire: member.attire,
    invite_status: member.inviteStatus,
    phone: member.phone,
    notes: member.notes,
  };
  if (isNew) {
    const { count } = await supabase
      .from("party_members")
      .select("id", { count: "exact", head: true })
      .eq("wedding_id", wedding.id);
    const { error } = await supabase.from("party_members").upsert(
      {
        id: member.id,
        wedding_id: wedding.id,
        entrance_order: count ?? 0,
        ...fields,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (error) return failureFor(error);
  } else {
    const { error } = await supabase
      .from("party_members")
      .update(fields)
      .eq("wedding_id", wedding.id)
      .eq("id", member.id);
    if (error) return failureFor(error);
  }
  const partner = fields.pair_id;
  const stale = supabase
    .from("party_members")
    .update({ pair_id: null })
    .eq("wedding_id", wedding.id)
    .eq("pair_id", member.id);
  await (partner ? stale.neq("id", partner) : stale);
  if (partner) {
    await supabase
      .from("party_members")
      .update({ pair_id: null })
      .eq("wedding_id", wedding.id)
      .eq("pair_id", partner)
      .neq("id", member.id);
    await supabase
      .from("party_members")
      .update({ pair_id: member.id })
      .eq("wedding_id", wedding.id)
      .eq("id", partner);
  }
  refresh();
  return { ok: true };
}

export async function movePartyMember(
  id: string,
  delta: number,
): Promise<ActionResult> {
  const parsed = z
    .object({ id: z.uuid(), delta: z.union([z.literal(-1), z.literal(1)]) })
    .safeParse({ id, delta });
  if (!parsed.success) return failure;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { supabase, wedding } = context;
  const { data: members, error: readError } = await supabase
    .from("party_members")
    .select("id, side, pair_id, entrance_order")
    .eq("wedding_id", wedding.id);
  if (readError) return failure;
  const orders = moveRow(members, parsed.data.id, parsed.data.delta);
  if (!orders) return { ok: true };
  const results = await Promise.all(
    orders.map(({ id: memberId, entrance_order }) =>
      supabase
        .from("party_members")
        .update({ entrance_order })
        .eq("wedding_id", wedding.id)
        .eq("id", memberId),
    ),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) return failureFor(failed.error);
  refresh();
  return { ok: true };
}

export async function deletePartyMember(id: string): Promise<ActionResult> {
  return deleteFrom("party_members", id);
}

export async function saveTimelineItem(
  input: TimelineInput,
  isNew: boolean,
): Promise<ActionResult> {
  const parsed = timelineInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const item = parsed.data;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { supabase, wedding } = context;
  const fields = {
    starts_at: item.startsAt,
    ends_at: item.endsAt,
    title: item.title,
    place: item.place,
    responsible: item.responsible,
    notes: item.notes,
    song_id: item.songId,
  };
  const { error } = isNew
    ? await supabase
        .from("timeline_items")
        .upsert(
          { id: item.id, wedding_id: wedding.id, ...fields },
          { onConflict: "id", ignoreDuplicates: true },
        )
    : await supabase
        .from("timeline_items")
        .update(fields)
        .eq("wedding_id", wedding.id)
        .eq("id", item.id);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function deleteTimelineItem(id: string): Promise<ActionResult> {
  return deleteFrom("timeline_items", id);
}

async function deleteFrom(
  table: "songs" | "party_members" | "timeline_items",
  id: string,
): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return failure;
  const context = await requireHelper();
  if (!context) return forbidden;
  const { error } = await context.supabase
    .from(table)
    .delete()
    .eq("wedding_id", context.wedding.id)
    .eq("id", parsed.data);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}
