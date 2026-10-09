"use client";

import { CheckIcon } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toast } from "@/components/ui/toast";
import { setTaskDone } from "@/lib/actions/tasks";
import { attempt, failed } from "@/lib/attempt";
import { m } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function TaskCheck({
  id,
  title,
  done,
  disabled,
}: {
  id: string;
  title: string;
  done: boolean;
  disabled?: boolean;
}) {
  const [checked, setChecked] = useOptimistic(done);
  const [, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      setChecked(!checked);
      const result = await attempt(setTaskDone(id, !checked), failed);
      if (!result.ok) {
        toast.add({
          title: result.message ?? m.common.tryAgain,
          type: "error",
        });
        return;
      }
      if (!checked) toast.add({ title: m.tasks.doneToast, type: "success" });
    });
  }

  return (
    <label className="flex size-11 shrink-0 cursor-pointer items-center justify-center has-disabled:cursor-not-allowed">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={toggle}
        aria-label={
          checked ? m.tasks.markUndone(title) : m.tasks.markDone(title)
        }
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex size-6 items-center justify-center rounded-full border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring peer-disabled:opacity-50",
          checked
            ? "border-success bg-success text-card"
            : "border-input hover:border-foreground",
        )}
      >
        {checked && (
          <CheckIcon className="size-4 animate-step-in" strokeWidth={3} />
        )}
      </span>
    </label>
  );
}
