"use client";

import { useState } from "react";
import { describedBy, Field } from "@/components/forms/field";
import { MoneyInput } from "@/components/forms/money-input";
import { IconPicker } from "@/components/forms/pickers";
import { SheetForm } from "@/components/forms/sheet-form";
import { Input } from "@/components/ui/input";
import { deleteCategory, saveCategory } from "@/lib/actions/budget";
import type { BudgetCategory } from "@/lib/data";
import { m } from "@/lib/i18n";
import type { CategoryIconKey } from "@/lib/icons";

export function CategorySheet({
  category,
}: {
  category: BudgetCategory | null;
}) {
  const [id, setId] = useState(() => category?.id ?? crypto.randomUUID());
  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "heart");
  const [planned, setPlanned] = useState(category?.planned_cents ?? 0);

  return (
    <SheetForm
      title={category ? m.budget.editCategory : m.budget.newCategory}
      trigger={category ? "edit" : "add"}
      triggerLabel={
        category ? `${m.common.edit}: ${category.name}` : m.budget.newCategory
      }
      savedMessage={
        category ? m.budget.categorySaved : m.budget.categoryCreated
      }
      deletedMessage={m.budget.categoryDeleted}
      onSave={() =>
        saveCategory(
          {
            id,
            name,
            icon: icon as CategoryIconKey,
            plannedCents: planned > 0 ? planned : null,
          },
          category === null,
        )
      }
      onDelete={category ? () => deleteCategory(category.id) : undefined}
      onSaved={() => {
        if (category) return;
        setId(crypto.randomUUID());
        setName("");
        setIcon("heart");
        setPlanned(0);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`cat-name-${id}`} label={m.budget.categoryName}>
          <Input
            id={`cat-name-${id}`}
            maxLength={40}
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background"
          />
        </Field>
        <Field id={`cat-planned-${id}`} label={m.budget.planned}>
          <MoneyInput
            id={`cat-planned-${id}`}
            value={planned}
            onChange={setPlanned}
            placeholder={m.budget.noPlanned}
          />
        </Field>
      </div>
      <IconPicker legend={m.budget.icon} value={icon} onChange={setIcon} />
    </SheetForm>
  );
}
