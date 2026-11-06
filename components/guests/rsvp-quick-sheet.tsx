"use client";

import { UsersIcon } from "lucide-react";
import { useState } from "react";
import { RsvpSwitch } from "@/components/guests/rsvp-switch";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Guest } from "@/lib/data";
import { m } from "@/lib/i18n";

export function RsvpQuickSheet({
  householdName,
  guests,
  disabled,
}: {
  householdName: string;
  guests: Guest[];
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={m.guests.rsvpOf(householdName)}
        className={buttonVariants({ variant: "ghost", size: "icon-lg" })}
      >
        <UsersIcon aria-hidden="true" className="size-5" />
      </SheetTrigger>
      <SheetContent title={householdName}>
        <div className="flex flex-col gap-4">
          {guests.map((guest) => (
            <RsvpSwitch
              key={guest.id}
              id={guest.id}
              name={guest.name}
              value={guest.rsvp}
              disabled={disabled}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
