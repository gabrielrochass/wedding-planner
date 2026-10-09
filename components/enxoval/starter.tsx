"use client";

import { SparklesIcon } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { addHomeItems } from "@/lib/actions/home";
import { attempt, failed } from "@/lib/attempt";
import { starterHomeItems } from "@/lib/home-starter";
import { m } from "@/lib/i18n";

export function HomeStarter() {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="lg"
      disabled={pending}
      focusableWhenDisabled
      onClick={() =>
        startTransition(async () => {
          const result = await attempt(
            addHomeItems(
              starterHomeItems.map((item) => ({
                name: item.name,
                room: item.room,
                quantity: item.quantity,
                priority: item.priority,
                status: "missing",
                estimateCents: item.estimate_cents,
              })),
            ),
            failed,
          );
          toast.add(
            result.ok
              ? {
                  title: m.enxoval.starterAdded(starterHomeItems.length),
                  type: "success",
                }
              : { title: result.message ?? m.common.tryAgain, type: "error" },
          );
        })
      }
    >
      <SparklesIcon aria-hidden="true" />
      {pending ? m.common.saving : m.enxoval.starter}
    </Button>
  );
}
