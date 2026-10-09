"use client";

import { PencilIcon, PlusIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { Field } from "@/components/forms/field";
import { FormActions } from "@/components/forms/form-actions";
import { MoneyInput } from "@/components/forms/money-input";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { deleteContributor, saveContributor } from "@/lib/actions/budget";
import { attempt, failed } from "@/lib/attempt";
import type { Contributor } from "@/lib/data";
import { m } from "@/lib/i18n";

export function ContributorSheet({
  contributor,
}: {
  contributor: Contributor | null;
}) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(() => contributor?.id ?? crypto.randomUUID());
  const [name, setName] = useState(contributor?.name ?? "");
  const [promised, setPromised] = useState(contributor?.promised_cents ?? 0);
  const [status, setStatus] = useState("");
  const [saving, startSave] = useTransition();
  const [removing, startRemove] = useTransition();
  const title = contributor ? contributor.name : m.budget.newContributor;

  function save() {
    startSave(async () => {
      const result = await attempt(
        saveContributor(
          { id, name, promisedCents: promised > 0 ? promised : null },
          contributor === null,
        ),
        failed,
      );
      if (!result.ok) {
        setStatus(
          result.errors?.name?.[0] ?? result.message ?? m.common.tryAgain,
        );
        return;
      }
      toast.add({ title: m.budget.contributorSaved, type: "success" });
      setOpen(false);
      if (!contributor) {
        setId(crypto.randomUUID());
        setName("");
        setPromised(0);
      }
    });
  }

  function remove() {
    if (!contributor) return;
    startRemove(async () => {
      const result = await attempt(deleteContributor(contributor.id), failed);
      if (!result.ok) {
        setStatus(result.message ?? m.common.tryAgain);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={
          contributor ? `${m.common.edit}: ${contributor.name}` : undefined
        }
        className={buttonVariants({
          variant: contributor ? "ghost" : "secondary",
          size: contributor ? "icon-lg" : "lg",
        })}
      >
        {contributor ? (
          <PencilIcon aria-hidden="true" className="size-5" />
        ) : (
          <>
            <PlusIcon aria-hidden="true" />
            {m.common.add}
          </>
        )}
      </SheetTrigger>
      <SheetContent title={title}>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
          className="flex flex-col gap-5"
        >
          <Field id={`c-name-${id}`} label={m.budget.contributorName}>
            <Input
              id={`c-name-${id}`}
              maxLength={40}
              autoComplete="off"
              placeholder={m.budget.contributorPlaceholder}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="bg-background"
            />
          </Field>
          <Field id={`c-promised-${id}`} label={m.budget.promised}>
            <MoneyInput
              id={`c-promised-${id}`}
              value={promised}
              onChange={setPromised}
              placeholder={m.common.optional}
            />
          </Field>
          <FormActions
            status={status}
            saving={saving}
            busy={saving || removing}
            submitLabel={m.common.save}
            onDelete={contributor ? remove : undefined}
          />
        </form>
      </SheetContent>
    </Sheet>
  );
}
