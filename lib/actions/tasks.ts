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
import { fieldErrors, type TaskInput, taskInput } from "@/lib/schemas";
import { requireWedding } from "@/lib/supabase/server";

export async function saveTask(
  input: TaskInput,
  isNew: boolean,
): Promise<ActionResult> {
  const parsed = taskInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const t = parsed.data;
  const { supabase, wedding, role } = await requireWedding();
  if (!canHelp(role)) return forbidden;
  const fields = {
    title: t.title,
    notes: t.notes,
    area: t.area,
    offset_days: t.dueOn ? null : t.offsetDays,
    due_on: t.dueOn,
    assignee_id: t.assigneeId,
    assignee_label: t.assigneeLabel,
    vendor_id: t.vendorId,
  };
  const { error } = isNew
    ? await supabase
        .from("tasks")
        .upsert(
          { id: t.id, wedding_id: wedding.id, ...fields },
          { onConflict: "id", ignoreDuplicates: true },
        )
    : await supabase
        .from("tasks")
        .update(fields)
        .eq("wedding_id", wedding.id)
        .eq("id", t.id);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function setTaskDone(
  id: string,
  done: boolean,
): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return failure;
  const { supabase, wedding, role } = await requireWedding();
  if (!canHelp(role)) return forbidden;
  const { error } = await supabase
    .from("tasks")
    .update({ done_at: done ? new Date().toISOString() : null })
    .eq("wedding_id", wedding.id)
    .eq("id", parsed.data);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return failure;
  const { supabase, wedding, role } = await requireWedding();
  if (!canHelp(role)) return forbidden;
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("wedding_id", wedding.id)
    .eq("id", parsed.data);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}
