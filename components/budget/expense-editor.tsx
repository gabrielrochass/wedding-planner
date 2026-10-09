"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { describedBy, Field } from "@/components/forms/field";
import { FormActions } from "@/components/forms/form-actions";
import { MoneyInput } from "@/components/forms/money-input";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/components/ui/toast";
import { useGoBack } from "@/hooks/use-go-back";
import { deleteExpense, saveExpense } from "@/lib/actions/budget";
import { attempt, failed } from "@/lib/attempt";
import { splitInstallments } from "@/lib/budget";
import type { BudgetCategory, Expense } from "@/lib/data";
import { m } from "@/lib/i18n";
import { formatBRL } from "@/lib/money";

const counts = Array.from({ length: 24 }, (_, index) => index + 1);

export function ExpenseEditor({
  expense,
  categories,
  categoryId,
}: {
  expense: Expense | null;
  categories: BudgetCategory[];
  categoryId: string | null;
}) {
  const goBack = useGoBack("/orcamento");
  const router = useRouter();
  const [id] = useState(() => expense?.id ?? crypto.randomUUID());
  const [category, setCategory] = useState(
    expense?.category_id ?? categoryId ?? categories[0]?.id ?? "",
  );
  const [title, setTitle] = useState(expense?.title ?? "");
  const [estimated, setEstimated] = useState(expense?.estimated_cents ?? 0);
  const [contracted, setContracted] = useState(expense?.contracted_cents ?? 0);
  const [notes, setNotes] = useState(expense?.notes ?? "");
  const [count, setCount] = useState(1);
  const [firstDue, setFirstDue] = useState("");
  const [titleError, setTitleError] = useState<string>();
  const [status, setStatus] = useState("");
  const [saving, startSave] = useTransition();
  const [removing, startRemove] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);
  const total = contracted || estimated;
  const preview =
    !expense && firstDue && total > 0
      ? splitInstallments(total, count, firstDue)
      : [];

  function save() {
    startSave(async () => {
      const result = await attempt(
        saveExpense(
          {
            id,
            categoryId: category,
            vendorId: expense?.vendor_id ?? null,
            title,
            estimatedCents: estimated > 0 ? estimated : null,
            contractedCents: contracted > 0 ? contracted : null,
            notes,
            plan: !expense && firstDue ? { count, firstDue } : null,
          },
          expense === null,
        ),
        failed,
      );
      if (!result.ok) {
        setTitleError(result.errors?.title?.[0]);
        setStatus(result.errors?.categoryId?.[0] ?? result.message ?? "");
        if (result.errors?.title) titleRef.current?.focus();
        return;
      }
      toast.add({
        title: expense ? m.budget.expenseSaved : m.budget.expenseCreated,
        type: "success",
      });
      if (expense) goBack();
      else router.replace(`/orcamento/gastos/${id}`);
    });
  }

  function remove() {
    if (!expense) return;
    startRemove(async () => {
      const result = await attempt(deleteExpense(expense.id), failed);
      if (!result.ok) {
        setStatus(result.message ?? m.common.tryAgain);
        return;
      }
      toast.add({ title: m.budget.expenseDeleted });
      router.replace(`/orcamento/categorias/${expense.category_id}`);
    });
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      className="flex flex-col gap-6"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="exp-title" label={m.budget.expenseTitle} error={titleError}>
          <Input
            ref={titleRef}
            id="exp-title"
            maxLength={80}
            autoComplete="off"
            placeholder={m.budget.expenseTitlePlaceholder}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={titleError ? true : undefined}
            aria-describedby={describedBy("exp-title", { error: titleError })}
            className="bg-card dark:bg-card"
          />
        </Field>
        <Field id="exp-category" label={m.budget.category}>
          <NativeSelect
            id="exp-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field
          id="exp-estimated"
          label={m.budget.estimated}
          hint={m.budget.estimatedHint}
        >
          <MoneyInput
            id="exp-estimated"
            value={estimated}
            onChange={setEstimated}
            aria-describedby="exp-estimated-hint"
          />
        </Field>
        <Field
          id="exp-contracted"
          label={m.budget.contractedValue}
          hint={m.budget.contractedHint}
        >
          <MoneyInput
            id="exp-contracted"
            value={contracted}
            onChange={setContracted}
            aria-describedby="exp-contracted-hint"
          />
        </Field>
      </div>

      {!expense && (
        <fieldset className="flex flex-col gap-4 rounded-2xl bg-card p-4">
          <legend className="sr-only">{m.budget.installments}</legend>
          <p className="text-headline font-semibold" aria-hidden="true">
            {m.budget.installments}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="exp-count" label={m.budget.installmentsCount}>
              <NativeSelect
                id="exp-count"
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
              >
                {counts.map((value) => (
                  <option key={value} value={value}>
                    {value}x
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field id="exp-first" label={m.budget.firstDue}>
              <Input
                id="exp-first"
                type="date"
                min="2000-01-01"
                max="2100-12-31"
                value={firstDue}
                onChange={(event) => setFirstDue(event.target.value)}
                className="bg-background"
              />
            </Field>
          </div>
          {preview.length > 0 && (
            <p className="text-subhead text-link tabular-nums">
              {count}x {formatBRL(preview.at(-1)?.amount_cents ?? 0)}
            </p>
          )}
          <p className="text-footnote text-muted-foreground">
            {m.budget.procon}
          </p>
        </fieldset>
      )}

      <Field id="exp-notes" label={m.tasks.notes}>
        <textarea
          id="exp-notes"
          rows={3}
          maxLength={2000}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-base"
        />
      </Field>

      <FormActions
        status={status}
        saving={saving}
        busy={saving || removing}
        submitLabel={expense ? m.common.save : m.budget.newExpense}
        onDelete={expense ? remove : undefined}
      />
    </form>
  );
}
