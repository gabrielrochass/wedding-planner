"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/lib/actions/wedding";
import { attempt, failed } from "@/lib/attempt";
import { m } from "@/lib/i18n";

export function AcceptInvite({ token }: { token: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3">
      <Button
        size="lg"
        disabled={pending}
        focusableWhenDisabled
        onClick={() =>
          startTransition(async () => {
            const result = await attempt(acceptInvite(token), failed);
            if (!result.ok) setError(result.message ?? m.common.tryAgain);
          })
        }
      >
        {pending ? m.invite.accepting : m.invite.accept}
      </Button>
      <output className="block min-h-5 text-footnote text-destructive">
        {error}
      </output>
    </div>
  );
}
