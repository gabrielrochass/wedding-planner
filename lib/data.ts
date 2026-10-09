import "server-only";

import { cache } from "react";
import { requireUser, requireWedding } from "@/lib/supabase/server";

export const getPeople = cache(async () => {
  const { supabase, wedding, userId } = await requireWedding();
  const { data, error } = await supabase.rpc("wedding_people", {
    p_wedding: wedding.id,
  });
  if (error) throw error;
  return data.map((person) => ({
    ...person,
    is_me: person.user_id === userId,
  }));
});

export type Person = Awaited<ReturnType<typeof getPeople>>[number];

export const getMemberships = cache(async () => {
  const { supabase, userId } = await requireUser();
  const { data, error } = await supabase
    .from("wedding_members")
    .select("role, wedding:weddings(id, partner_a, partner_b, wedding_date)")
    .eq("user_id", userId)
    .order("created_at");
  if (error) throw error;
  return data.flatMap(({ role, wedding }) =>
    wedding ? [{ role, ...wedding }] : [],
  );
});

export const getInvites = cache(async () => {
  const { supabase, wedding } = await requireWedding();
  const { data, error } = await supabase
    .from("wedding_invites")
    .select("id, role, expires_at, accepted_at")
    .eq("wedding_id", wedding.id)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
});

const taskColumns =
  "id, title, notes, area, offset_days, due_on, assignee_id, assignee_label, vendor_id, template_key, done_at";

export const getTasks = cache(async () => {
  const { supabase, wedding } = await requireWedding();
  const { data, error } = await supabase
    .from("tasks")
    .select(taskColumns)
    .eq("wedding_id", wedding.id)
    .order("created_at");
  if (error) throw error;
  return data;
});

export type Task = Awaited<ReturnType<typeof getTasks>>[number];

export async function getTask(id: string) {
  const { supabase, wedding } = await requireWedding();
  const { data, error } = await supabase
    .from("tasks")
    .select(taskColumns)
    .eq("wedding_id", wedding.id)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export const getBudget = cache(async () => {
  const { supabase, wedding } = await requireWedding();
  const [categories, expenses, payments, contributors] = await Promise.all([
    supabase
      .from("budget_categories")
      .select("id, name, icon, planned_cents, sort_order")
      .eq("wedding_id", wedding.id)
      .order("sort_order")
      .order("created_at"),
    supabase
      .from("expenses")
      .select(
        "id, category_id, vendor_id, title, estimated_cents, contracted_cents, notes",
      )
      .eq("wedding_id", wedding.id)
      .order("created_at"),
    supabase
      .from("payments")
      .select(
        "id, expense_id, amount_cents, due_on, paid_on, method, contributor_id, installment_number, installment_count, note",
      )
      .eq("wedding_id", wedding.id)
      .order("due_on")
      .order("installment_number"),
    supabase
      .from("contributors")
      .select("id, name, promised_cents")
      .eq("wedding_id", wedding.id)
      .order("sort_order")
      .order("created_at"),
  ]);
  for (const result of [categories, expenses, payments, contributors]) {
    if (result.error) throw result.error;
  }
  return {
    categories: categories.data ?? [],
    expenses: expenses.data ?? [],
    payments: payments.data ?? [],
    contributors: contributors.data ?? [],
  };
});

export type Budget = Awaited<ReturnType<typeof getBudget>>;
export type BudgetCategory = Budget["categories"][number];
export type Expense = Budget["expenses"][number];
export type Payment = Budget["payments"][number];
export type Contributor = Budget["contributors"][number];

const vendorColumns =
  "id, category_id, name, status, contact_name, phone, email, instagram, website, quote_cents, quote_details, capacity, rating, visit_on, notes";

export const getVendors = cache(async () => {
  const { supabase, wedding } = await requireWedding();
  const { data, error } = await supabase
    .from("vendors")
    .select(vendorColumns)
    .eq("wedding_id", wedding.id)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
});

export type Vendor = Awaited<ReturnType<typeof getVendors>>[number];

export async function getVendor(id: string) {
  const { supabase, wedding } = await requireWedding();
  const { data, error } = await supabase
    .from("vendors")
    .select(vendorColumns)
    .eq("wedding_id", wedding.id)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

const householdColumns =
  "id, name, side, list, phone, address, notes, save_the_date_on, invited_on, gift, thanked_on";
const guestColumns =
  "id, household_id, name, age_band, rsvp, is_plus_one, dietary, sort_order";

export const getGuests = cache(async () => {
  const { supabase, wedding } = await requireWedding();
  const [households, guests] = await Promise.all([
    supabase
      .from("households")
      .select(householdColumns)
      .eq("wedding_id", wedding.id)
      .order("created_at"),
    supabase
      .from("guests")
      .select(guestColumns)
      .eq("wedding_id", wedding.id)
      .order("sort_order")
      .order("created_at"),
  ]);
  if (households.error) throw households.error;
  if (guests.error) throw guests.error;
  return { households: households.data, guests: guests.data };
});

export type Household = Awaited<
  ReturnType<typeof getGuests>
>["households"][number];
export type Guest = Awaited<ReturnType<typeof getGuests>>["guests"][number];

export async function getHousehold(id: string) {
  const { supabase, wedding } = await requireWedding();
  const [household, guests] = await Promise.all([
    supabase
      .from("households")
      .select(householdColumns)
      .eq("wedding_id", wedding.id)
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("guests")
      .select(guestColumns)
      .eq("wedding_id", wedding.id)
      .eq("household_id", id)
      .order("sort_order")
      .order("created_at"),
  ]);
  if (household.error) throw household.error;
  if (guests.error) throw guests.error;
  return household.data ? { ...household.data, members: guests.data } : null;
}

const ideaColumns =
  "id, board, title, notes, url, image_path, status, estimate_cents, vendor_id";

async function signImages<T extends { image_path: string | null }>(rows: T[]) {
  const { supabase } = await requireWedding();
  const paths = rows.flatMap((row) => (row.image_path ? [row.image_path] : []));
  const signed = new Map<string, string>();
  if (paths.length > 0) {
    const { data } = await supabase.storage
      .from("ideias")
      .createSignedUrls(paths, 3600);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
    }
  }
  return rows.map((row) => ({
    ...row,
    image_url: row.image_path ? (signed.get(row.image_path) ?? null) : null,
  }));
}

export const getIdeas = cache(async () => {
  const { supabase, wedding } = await requireWedding();
  const { data, error } = await supabase
    .from("ideas")
    .select(ideaColumns)
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return signImages(data);
});

export type Idea = Awaited<ReturnType<typeof getIdeas>>[number];

export async function getIdea(id: string) {
  const { supabase, wedding } = await requireWedding();
  const { data, error } = await supabase
    .from("ideas")
    .select(ideaColumns)
    .eq("wedding_id", wedding.id)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? (await signImages([data]))[0] : null;
}

export const getSongs = cache(async () => {
  const { supabase, wedding } = await requireWedding();
  const { data, error } = await supabase
    .from("songs")
    .select("id, moment, title, artist, url, chosen")
    .eq("wedding_id", wedding.id)
    .order("created_at");
  if (error) throw error;
  return data;
});

export type Song = Awaited<ReturnType<typeof getSongs>>[number];

export const getParty = cache(async () => {
  const { supabase, wedding } = await requireWedding();
  const { data, error } = await supabase
    .from("party_members")
    .select(
      "id, name, role, side, pair_id, entrance_order, attire, invite_status, phone, notes",
    )
    .eq("wedding_id", wedding.id)
    .order("entrance_order")
    .order("created_at");
  if (error) throw error;
  return data;
});

export type PartyMember = Awaited<ReturnType<typeof getParty>>[number];

export const getTimeline = cache(async () => {
  const { supabase, wedding } = await requireWedding();
  const { data, error } = await supabase
    .from("timeline_items")
    .select("id, starts_at, ends_at, title, place, responsible, notes, song_id")
    .eq("wedding_id", wedding.id)
    .order("starts_at");
  if (error) throw error;
  return data;
});

export type TimelineItem = Awaited<ReturnType<typeof getTimeline>>[number];

export const getHomeItems = cache(async () => {
  const { supabase, wedding } = await requireWedding();
  const { data, error } = await supabase
    .from("home_items")
    .select(
      "id, room, name, quantity, priority, status, estimate_cents, paid_cents, store, url, household_id, notes",
    )
    .eq("wedding_id", wedding.id)
    .order("created_at");
  if (error) throw error;
  return data;
});

export type HomeItem = Awaited<ReturnType<typeof getHomeItems>>[number];
