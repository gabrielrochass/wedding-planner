"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { describedBy, Field } from "@/components/forms/field";
import { FormActions } from "@/components/forms/form-actions";
import { MoneyInput } from "@/components/forms/money-input";
import { IconPicker } from "@/components/forms/pickers";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useGoBack } from "@/hooks/use-go-back";
import { deleteCategory, saveCategory } from "@/lib/actions/budget";
import { attempt, failed } from "@/lib/attempt";
import type { BudgetCategory } from "@/lib/data";
import { m } from "@/lib/i18n";
import type { CategoryIconKey } from "@/lib/icons";

export function CategoryEditor({
  category,
}: {
  category: BudgetCategory | null;
}) {
  const goBack = useGoBack("/orcamento");
  const router = useRouter();
  const [id] = useState(() => category?.id ?? crypto.randomUUID());
  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "heart");
  const [planned, setPlanned] = useState(category?.planned_cents ?? 0);
  const [nameError, setNameError] = useState<string>();
  const [status, setStatus] = useState("");
  const [saving, startSave] = useTransition();
  const [removing, startRemove] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  function save() {
    startSave(async () => {
      const result = await attempt(
        saveCategory(
          {
            id,
            name,
            icon: icon as CategoryIconKey,
            plannedCents: planned > 0 ? planned : null,
          },
          category === null,
        ),
        failed,
      );
      if (!result.ok) {
        setNameError(result.errors?.name?.[0]);
        setStatus(result.message ?? "");
        if (result.errors?.name) nameRef.current?.focus();
        return;
      }
      toast.add({
        title: category ? m.budget.categorySaved : m.budget.categoryCreated,
        type: "success",
      });
      goBack();
    });
  }

  function remove() {
    if (!category) return;
    startRemove(async () => {
      const result = await attempt(deleteCategory(category.id), failed);
      if (!result.ok) {
        setStatus(result.message ?? m.common.tryAgain);
        return;
      }
      toast.add({ title: m.budget.categoryDeleted });
      router.replace("/orcamento");
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
        <Field id="cat-name" label={m.budget.categoryName} error={nameError}>
          <Input
            ref={nameRef}
            id="cat-name"
            maxLength={40}
            autoComplete="off"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={describedBy("cat-name", { error: nameError })}
            className="bg-card dark:bg-card"
          />
        </Field>
        <Field id="cat-planned" label={m.budget.planned}>
          <MoneyInput
            id="cat-planned"
            value={planned}
            onChange={setPlanned}
            placeholder={m.budget.noPlanned}
          />
        </Field>
      </div>
      <IconPicker legend={m.budget.icon} value={icon} onChange={setIcon} />
      <FormActions
        status={status}
        saving={saving}
        busy={saving || removing}
        submitLabel={category ? m.common.save : m.budget.newCategory}
        onDelete={category ? remove : undefined}
      />
    </form>
  );
}
