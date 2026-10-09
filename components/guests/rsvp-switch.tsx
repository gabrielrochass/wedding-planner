"use client";

import { CircleCheckIcon, CircleHelpIcon, CircleXIcon } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toast } from "@/components/ui/toast";
import { setGuestRsvp } from "@/lib/actions/guests";
import { attempt, failed } from "@/lib/attempt";
import { rsvps } from "@/lib/guests";
import { m } from "@/lib/i18n";
import type { Enums } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type Rsvp = Enums<"rsvp_status">;

const look: Record<Rsvp, { icon: typeof CircleCheckIcon; on: string }> = {
  yes: { icon: CircleCheckIcon, on: "bg-success text-card" },
  pending: { icon: CircleHelpIcon, on: "bg-foreground text-background" },
  no: { icon: CircleXIcon, on: "bg-danger text-card" },
};

export function RsvpSwitch({
  id,
  name,
  value,
  disabled,
}: {
  id: string;
  name: string;
  value: Rsvp;
  disabled: boolean;
}) {
  const [current, setCurrent] = useOptimistic(value);
  const [, startTransition] = useTransition();

  return (
    <fieldset disabled={disabled} className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 text-body font-medium">{name}</legend>
      <div className="grid grid-cols-3 gap-1 rounded-full bg-secondary p-1">
        {rsvps.map((option) => {
          const { icon: Icon, on } = look[option];
          return (
            <label
              key={option}
              className={cn(
                "flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full px-2 text-subhead font-medium transition-colors has-focus-visible:outline-2 has-focus-visible:outline-ring has-disabled:cursor-not-allowed",
                current === option ? on : "text-secondary-foreground",
              )}
            >
              <input
                type="radio"
                name={`rsvp-${id}`}
                value={option}
                checked={current === option}
                onChange={() =>
                  startTransition(async () => {
                    setCurrent(option);
                    const result = await attempt(
                      setGuestRsvp(id, option),
                      failed,
                    );
                    toast.add(
                      result.ok
                        ? { title: m.guests.rsvpSaved(name, m.rsvp[option]) }
                        : {
                            title: result.message ?? m.common.tryAgain,
                            type: "error",
                          },
                    );
                  })
                }
                className="sr-only"
              />
              <Icon aria-hidden="true" className="size-4" />
              {m.rsvp[option]}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
