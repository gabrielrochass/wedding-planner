"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  type ActionResult,
  failure,
  failureFor,
  forbidden,
} from "@/lib/action-result";
import { defaultContingency, plannedByCategory } from "@/lib/budget";
import { starterTasks } from "@/lib/checklist";
import { m } from "@/lib/i18n";
import { heardFrom } from "@/lib/onboarding";
import { canEdit, canManageTeam, type Role, roles } from "@/lib/roles";
import {
  fieldErrors,
  type OnboardingInput,
  onboardingInput,
  type WeddingSettingsInput,
  weddingSettingsInput,
} from "@/lib/schemas";
import { requireUser, requireWedding } from "@/lib/supabase/server";

export async function createWedding(
  input: OnboardingInput,
): Promise<ActionResult & { tasks?: number; done?: number }> {
  const parsed = onboardingInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const w = parsed.data;
  const { supabase } = await requireUser();
  const tasks = starterTasks(w.ceremony, {
    booked: w.booked,
    hasDate: w.weddingDate !== null && !w.dateIsEstimate,
  });
  const { error } = await supabase.rpc("create_wedding", {
    p_id: w.id,
    p_partner_a: w.partnerA,
    p_partner_b: w.partnerB,
    p_date: w.weddingDate ?? undefined,
    p_date_is_estimate: w.dateIsEstimate,
    p_city: w.city ?? undefined,
    p_ceremony: w.ceremony,
    p_guest_estimate: w.guestEstimate ?? undefined,
    p_budget_cents: w.budgetCents ?? undefined,
    p_tasks: tasks,
    p_categories: plannedByCategory(
      w.budgetCents,
      defaultContingency,
      w.priorities,
    ),
    p_priorities: w.priorities,
    p_planning_as: w.persona,
  });
  if (error) return failureFor(error);
  return {
    ok: true,
    tasks: tasks.length,
    done: tasks.filter((task) => task.done).length,
  };
}

export async function saveHeardFrom(source: string): Promise<ActionResult> {
  const parsed = z.enum(heardFrom).safeParse(source);
  if (!parsed.success) return failure;
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({ heard_from: parsed.data })
    .eq("id", userId);
  if (error) return failureFor(error);
  return { ok: true };
}

export async function saveWedding(
  input: WeddingSettingsInput,
): Promise<ActionResult> {
  const parsed = weddingSettingsInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const w = parsed.data;
  const { supabase, wedding, role } = await requireWedding();
  if (!canEdit(role)) return forbidden;
  const { error } = await supabase
    .from("weddings")
    .update({
      partner_a: w.partnerA,
      partner_b: w.partnerB,
      wedding_date: w.weddingDate,
      date_is_estimate: w.weddingDate !== null && w.dateIsEstimate,
      city: w.city,
      ceremony: w.ceremony,
      guest_estimate: w.guestEstimate,
      budget_cents: w.budgetCents,
      contingency_percent: w.contingencyPercent,
      motto: w.motto,
    })
    .eq("id", wedding.id);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function saveBudgetTotal(
  budgetCents: number | null,
  contingencyPercent: number,
): Promise<ActionResult> {
  const parsed = z
    .object({
      budgetCents: z.number().int().min(1).max(9_999_999_999).nullable(),
      contingencyPercent: z.number().int().min(0).max(50),
    })
    .safeParse({ budgetCents, contingencyPercent });
  if (!parsed.success) return failure;
  const { supabase, wedding, role } = await requireWedding();
  if (!canEdit(role)) return forbidden;
  const { error } = await supabase
    .from("weddings")
    .update({
      budget_cents: parsed.data.budgetCents,
      contingency_percent: parsed.data.contingencyPercent,
    })
    .eq("id", wedding.id);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function switchWedding(id: string) {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return;
  const { supabase, userId } = await requireUser();
  await supabase
    .from("profiles")
    .update({ current_wedding_id: parsed.data })
    .eq("id", userId);
  redirect("/");
}

type InviteResult =
  | { ok: true; token: string }
  | { ok: false; message: string };

async function issueInvite(role: Role): Promise<InviteResult> {
  const { supabase, wedding, role: mine } = await requireWedding();
  if (!canManageTeam(mine)) return forbidden;
  const { data, error } = await supabase.rpc("create_invite", {
    p_wedding: wedding.id,
    p_role: role,
  });
  if (error || !data) return failure;
  return { ok: true, token: data };
}

export async function createInviteLink(role: string): Promise<InviteResult> {
  const parsed = z.enum(roles).safeParse(role);
  if (!parsed.success) return failure;
  const result = await issueInvite(parsed.data);
  if (result.ok) refresh();
  return result;
}

export async function invitePartner(): Promise<InviteResult> {
  return issueInvite("couple");
}

export async function revokeInvite(id: string): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return failure;
  const { supabase, wedding, role } = await requireWedding();
  if (!canManageTeam(role)) return forbidden;
  const { error } = await supabase
    .from("wedding_invites")
    .delete()
    .eq("wedding_id", wedding.id)
    .eq("id", parsed.data);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function changeRole(
  userId: string,
  role: string,
): Promise<ActionResult> {
  const parsed = z
    .object({ userId: z.uuid(), role: z.enum(roles) })
    .safeParse({ userId, role });
  if (!parsed.success) return failure;
  const { supabase, wedding, role: mine } = await requireWedding();
  if (!canManageTeam(mine)) return forbidden;
  const { error } = await supabase
    .from("wedding_members")
    .update({ role: parsed.data.role })
    .eq("wedding_id", wedding.id)
    .eq("user_id", parsed.data.userId);
  if (error) {
    return failureFor(error, {
      "23514": { ok: false, message: m.team.lastCouple },
    });
  }
  refresh();
  return { ok: true };
}

export async function removeMember(userId: string): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(userId);
  if (!parsed.success) return failure;
  const { supabase, wedding, role, userId: me } = await requireWedding();
  if (!canManageTeam(role) || parsed.data === me) return forbidden;
  const { error } = await supabase
    .from("wedding_members")
    .delete()
    .eq("wedding_id", wedding.id)
    .eq("user_id", parsed.data);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export type FormState = { message: string } | null;

export async function leaveWedding(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  if (formData.get("confirm") !== "on") {
    return { message: m.account.confirmRequired };
  }
  const { supabase, wedding, userId } = await requireWedding();
  const { error } = await supabase
    .from("wedding_members")
    .delete()
    .eq("wedding_id", wedding.id)
    .eq("user_id", userId);
  if (error) return { message: m.common.tryAgain };
  await supabase
    .from("profiles")
    .update({ current_wedding_id: null })
    .eq("id", userId);
  redirect("/comecar");
}

export async function deleteWedding(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  if (formData.get("confirm") !== "on") {
    return { message: m.account.confirmRequired };
  }
  const { supabase, wedding, role } = await requireWedding();
  if (!canManageTeam(role)) return { message: m.common.noPermission };
  const { error } = await supabase
    .from("weddings")
    .delete()
    .eq("id", wedding.id);
  if (error) return { message: m.common.tryAgain };
  redirect("/comecar");
}

export async function acceptInvite(token: string): Promise<ActionResult> {
  const parsed = z
    .string()
    .regex(/^[0-9a-f]{48}$/)
    .safeParse(token);
  if (!parsed.success)
    return { ok: false, message: m.invite.invalidDescription };
  const { supabase } = await requireUser();
  const { error } = await supabase.rpc("accept_invite", {
    p_token: parsed.data,
  });
  if (error) {
    return failureFor(error, {
      P0002: { ok: false, message: m.invite.invalidDescription },
    });
  }
  redirect("/");
}
