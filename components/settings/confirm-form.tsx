"use client";

import { Trash2Icon } from "lucide-react";
import { useActionState, useId } from "react";
import { Button } from "@/components/ui/button";

type State = { message: string } | null;

export function ConfirmForm({
  action: submit,
  confirm,
  label,
  pendingLabel,
}: {
  action: (state: State, formData: FormData) => Promise<State>;
  confirm: string;
  label: string;
  pendingLabel: string;
}) {
  const [state, action, pending] = useActionState(submit, null);
  const errorId = useId();

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex min-h-11 items-start gap-3 text-subhead">
        <input
          type="checkbox"
          name="confirm"
          required
          aria-describedby={state ? errorId : undefined}
          className="mt-0.5 size-5 shrink-0 accent-destructive"
        />
        {confirm}
      </label>
      {state && (
        <p id={errorId} role="alert" className="text-footnote text-destructive">
          {state.message}
        </p>
      )}
      <Button
        type="submit"
        variant="destructive"
        size="lg"
        disabled={pending}
        focusableWhenDisabled
      >
        <Trash2Icon aria-hidden="true" />
        {pending ? pendingLabel : label}
      </Button>
    </form>
  );
}
