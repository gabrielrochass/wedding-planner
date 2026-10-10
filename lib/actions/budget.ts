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
import { m } from "@/lib/i18n";
import { canEdit } from "@/lib/roles";
import {
  type CategoryInput,
  categoryInput,
  type ExpenseInput,
  expenseInput,
  fieldErrors,
  isoDate,
  type PaymentInput,
  paymentInput,
} from "@/lib/schemas";
import { requireWedding } from "@/lib/supabase/server";

async function requireEditor() {
  const context = await requireWedding();
  return canEdit(context.role) ? context : null;
}

const categoryInUse = "23503";

export async function saveCategory(
  input: CategoryInput,
  isNew: boolean,
): Promise<ActionResult> {
  const parsed = categoryInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const c = parsed.data;
  const context = await requireEditor();
  if (!context) return forbidden;
  const { supabase, wedding } = context;
  const fields = { name: c.name, icon: c.icon, planned_cents: c.plannedCents };
  if (isNew) {
    const { count } = await supabase
      .from("budget_categories")
      .select("id", { count: "exact", head: true })
      .eq("wedding_id", wedding.id);
    const { error } = await supabase
      .from("budget_categories")
      .upsert(
        { id: c.id, wedding_id: wedding.id, sort_order: count ?? 0, ...fields },
        { onConflict: "id", ignoreDuplicates: true },
      );
    if (error) return failureFor(error);
  } else {
    const { error } = await supabase
      .from("budget_categories")
      .update(fields)
      .eq("wedding_id", wedding.id)
      .eq("id", c.id);
    if (error) return failureFor(error);
  }
  refresh();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return failure;
  const context = await requireEditor();
  if (!context) return forbidden;
  const { error } = await context.supabase
    .from("budget_categories")
    .delete()
    .eq("wedding_id", context.wedding.id)
    .eq("id", parsed.data);
  if (error) {
    return failureFor(error, {
      [categoryInUse]: { ok: false, message: m.budget.categoryInUse },
    });
  }
  refresh();
  return { ok: true };
}

export async function saveExpense(
  input: ExpenseInput,
  isNew: boolean,
): Promise<ActionResult> {
  const parsed = expenseInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const e = parsed.data;
  const context = await requireEditor();
  if (!context) return forbidden;
  const { supabase, wedding } = context;
  const fields = {
    category_id: e.categoryId,
    vendor_id: e.vendorId,
    title: e.title,
    estimated_cents: e.estimatedCents,
    contracted_cents: e.contractedCents,
    notes: e.notes,
  };

  if (!isNew) {
    const { error } = await supabase
      .from("expenses")
      .update(fields)
      .eq("wedding_id", wedding.id)
      .eq("id", e.id);
    if (error) return failureFor(error);
    refresh();
    return { ok: true };
  }

  const { error } = await supabase
    .from("expenses")
    .upsert(
      { id: e.id, wedding_id: wedding.id, ...fields },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (error) return failureFor(error);

  const total = e.contractedCents ?? e.estimatedCents;
  if (e.plan && total) {
    const { count } = await supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("expense_id", e.id);
    if (!count) {
      const rows = splitInstallments(total, e.plan.count, e.plan.firstDue).map(
        (payment) => ({
          ...payment,
          wedding_id: wedding.id,
          expense_id: e.id,
          installment_number:
            e.plan?.count === 1 ? null : payment.installment_number,
          installment_count:
            e.plan?.count === 1 ? null : payment.installment_count,
        }),
      );
      const { error: paymentsError } = await supabase
        .from("payments")
        .insert(rows);
      if (paymentsError) return failureFor(paymentsError);
    }
  }
  refresh();
  return { ok: true };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return failure;
  const context = await requireEditor();
  if (!context) return forbidden;
  const { error } = await context.supabase
    .from("expenses")
    .delete()
    .eq("wedding_id", context.wedding.id)
    .eq("id", parsed.data);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function savePayment(
  input: PaymentInput,
  isNew: boolean,
): Promise<ActionResult> {
  const parsed = paymentInput.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const p = parsed.data;
  const context = await requireEditor();
  if (!context) return forbidden;
  const { supabase, wedding } = context;
  const fields = {
    amount_cents: p.amountCents,
    due_on: p.dueOn,
    paid_on: p.paidOn,
    method: p.method,
    note: p.note,
  };
  const { error } = isNew
    ? await supabase.from("payments").upsert(
        {
          id: p.id,
          wedding_id: wedding.id,
          expense_id: p.expenseId,
          ...fields,
        },
        { onConflict: "id", ignoreDuplicates: true },
      )
    : await supabase
        .from("payments")
        .update(fields)
        .eq("wedding_id", wedding.id)
        .eq("id", p.id);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function setPaymentPaid(
  id: string,
  paidOn: string | null,
): Promise<ActionResult> {
  const parsed = z
    .object({ id: z.uuid(), paidOn: isoDate.nullable() })
    .safeParse({ id, paidOn });
  if (!parsed.success) return failure;
  const context = await requireEditor();
  if (!context) return forbidden;
  const { error } = await context.supabase
    .from("payments")
    .update({ paid_on: parsed.data.paidOn })
    .eq("wedding_id", context.wedding.id)
    .eq("id", parsed.data.id);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}

export async function deletePayment(id: string): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return failure;
  const context = await requireEditor();
  if (!context) return forbidden;
  const { error } = await context.supabase
    .from("payments")
    .delete()
    .eq("wedding_id", context.wedding.id)
    .eq("id", parsed.data);
  if (error) return failureFor(error);
  refresh();
  return { ok: true };
}
