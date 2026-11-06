"use client";

import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { m } from "@/lib/i18n";

export function CollapsibleEditor({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="flex flex-col gap-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={buttonVariants({ variant: "secondary", size: "lg" })}
      >
        <PencilIcon aria-hidden="true" className="size-4" />
        {open ? m.common.close : label}
      </button>
      {open && children}
    </section>
  );
}
