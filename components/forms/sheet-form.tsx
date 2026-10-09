"use client";

import { PencilIcon, PlusIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { FormActions } from "@/components/forms/form-actions";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import type { ActionResult } from "@/lib/action-result";
import { attempt, failed } from "@/lib/attempt";
import { m } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function SheetForm({
  title,
  trigger,
  triggerLabel,
  onSave,
  onDelete,
  onSaved,
  savedMessage,
  deletedMessage,
  children,
}: {
  title: string;
  trigger: "add" | "edit" | "icon-add";
  triggerLabel: string;
  onSave: () => Promise<ActionResult>;
  onDelete?: () => Promise<ActionResult>;
  onSaved?: () => void;
  savedMessage: string;
  deletedMessage?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [saving, startSave] = useTransition();
  const [removing, startRemove] = useTransition();

  function run(
    action: () => Promise<ActionResult>,
    start: typeof startSave,
    message: string,
    after?: () => void,
  ) {
    start(async () => {
      const result = await attempt(action(), failed);
      if (!result.ok) {
        setStatus(
          Object.values(result.errors ?? {})[0]?.[0] ??
            result.message ??
            m.common.tryAgain,
        );
        return;
      }
      setStatus("");
      toast.add({ title: message, type: "success" });
      setOpen(false);
      after?.();
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={trigger === "add" ? undefined : triggerLabel}
        className={cn(
          trigger === "add"
            ? buttonVariants({ variant: "secondary", size: "lg" })
            : buttonVariants({ variant: "ghost", size: "icon-lg" }),
        )}
      >
        {trigger === "edit" ? (
          <PencilIcon aria-hidden="true" className="size-5" />
        ) : (
          <PlusIcon aria-hidden="true" className="size-5" />
        )}
        {trigger === "add" && triggerLabel}
      </SheetTrigger>
      <SheetContent title={title}>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            run(onSave, startSave, savedMessage, onSaved);
          }}
          className="flex flex-col gap-5"
        >
          {children}
          <FormActions
            status={status}
            saving={saving}
            busy={saving || removing}
            submitLabel={m.common.save}
            onDelete={
              onDelete
                ? () =>
                    run(
                      onDelete,
                      startRemove,
                      deletedMessage ?? m.common.delete,
                    )
                : undefined
            }
          />
        </form>
      </SheetContent>
    </Sheet>
  );
}
