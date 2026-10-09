"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import {
  type ActionResult,
  failure,
  failureFor,
  forbidden,
} from "@/lib/action-result";
import { splitInstallments } from "@/lib/budget";
import { canEdit } from "@/lib/roles";
import {
  fieldErrors,
  type HireInput,
  hireInput,
  type VendorInput,
  vendorInput,
} from "@/lib/schemas";
import { Constants } from "@/lib/supabase/database.types";
import { requireWedding } from "@/lib/supabase/server";
import { normalizeInstagram, safeWebsite } from "@/lib/vendors";

async function requireEditor() {
  const context = await requireWedding();
  return canEdit(context.role) ? context : null;
}

export async function saveVendor(
  input: VendorInput,
  isNew: boolean,
): Promise<ActionResult> {
  const parsed = vendorInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const v = parsed.data;
  const context = await requireEditor();
  if (!context) return forbidden;
  const { supabase, wedding } = context;
  const fields = {
    category_id: v.categoryId,
    name: v.name,
    status: v.status,
    contact_name: v.contactName,
    phone: v.phone,
    email: v.email,
    instagram: v.instagram
      ? (normalizeInstagram(v.instagram) ?? v.instagram)
      : null,
    website: v.website ? safeWebsite(v.website) : null,
    quote_cents: v.quoteCents,
    quote_details: v.quoteDetails,
    capacity: v.capacity,
    rating: v.rating,
    visit_on: v.visitOn,
    notes: v.notes,
  };
  const { error } = isNew
    ? await supabase
        .from("vendors")
        .upsert(
          { id: v.id, wedding_id: wedding.id, ...fields },
          { onConflict: "id", ignoreDuplicates: true },
        )
    : await supabase
        .from("vendors")
        .update(fields)
        .eq("wedding_id", wedding.id)
        .eq("id", v.id);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function moveVendor(
  id: string,
  status: string,
): Promise<ActionResult> {
  const parsed = z
    .object({
      id: z.uuid(),
      status: z.enum(Constants.public.Enums.vendor_status),
    })
    .safeParse({ id, status });
  if (!parsed.success) return failure;
  const context = await requireEditor();
  if (!context) return forbidden;
  const { error } = await context.supabase
    .from("vendors")
    .update({ status: parsed.data.status })
    .eq("wedding_id", context.wedding.id)
    .eq("id", parsed.data.id);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function deleteVendor(id: string): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return failure;
  const context = await requireEditor();
  if (!context) return forbidden;
  const { error } = await context.supabase
    .from("vendors")
    .delete()
    .eq("wedding_id", context.wedding.id)
    .eq("id", parsed.data);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function hireVendor(input: HireInput): Promise<ActionResult> {
  const parsed = hireInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const h = parsed.data;
  const context = await requireEditor();
  if (!context) return forbidden;
  const { supabase, wedding } = context;
  const { data: vendor, error: readError } = await supabase
    .from("vendors")
    .select("name")
    .eq("wedding_id", wedding.id)
    .eq("id", h.vendorId)
    .maybeSingle();
  if (readError || !vendor) return failure;
  const single = h.plan.count === 1;
  const payments = splitInstallments(
    h.contractedCents,
    h.plan.count,
    h.plan.firstDue,
  ).map((payment) => ({
    id: crypto.randomUUID(),
    amount_cents: payment.amount_cents,
    due_on: payment.due_on,
    installment_number: single ? null : payment.installment_number,
    installment_count: single ? null : payment.installment_count,
    note: null,
  }));
  const { error } = await supabase.rpc("hire_vendor", {
    p_vendor_id: h.vendorId,
    p_expense_id: h.expenseId,
    p_category_id: h.categoryId,
    p_title: vendor.name,
    p_contracted_cents: h.contractedCents,
    p_payments: payments,
  });
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}
