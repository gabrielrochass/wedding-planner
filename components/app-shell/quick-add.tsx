"use client";

import {
  LightbulbIcon,
  ListChecksIcon,
  PlusIcon,
  ReceiptIcon,
  SofaIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { m } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const options: {
  href: Route;
  editorOnly?: boolean;
  title: string;
  hint: string;
  icon: typeof PlusIcon;
}[] = [
  {
    href: "/tarefas/nova",
    title: m.quick.task,
    hint: m.quick.taskHint,
    icon: ListChecksIcon,
  },
  {
    href: "/convidados/nova",
    title: m.quick.guests,
    hint: m.quick.guestsHint,
    icon: UsersIcon,
  },
  {
    href: "/orcamento/gastos/novo",
    editorOnly: true,
    title: m.quick.payment,
    hint: m.quick.paymentHint,
    icon: ReceiptIcon,
  },
  {
    href: "/ideias/nova",
    title: m.quick.idea,
    hint: m.quick.ideaHint,
    icon: LightbulbIcon,
  },
  {
    href: "/enxoval",
    title: m.quick.homeItem,
    hint: m.quick.homeItemHint,
    icon: SofaIcon,
  },
  {
    href: "/fornecedores/novo",
    editorOnly: true,
    title: m.quick.vendor,
    hint: m.quick.vendorHint,
    icon: StoreIcon,
  },
];

export function QuickAdd({
  variant,
  canEdit,
}: {
  variant: "tab" | "side";
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        data-tour="adicionar"
        aria-label={variant === "tab" ? m.nav.add : undefined}
        className={cn(
          variant === "tab"
            ? cn(buttonVariants({ size: "icon-lg" }), "rounded-full shadow-sm")
            : cn(buttonVariants({ size: "lg" }), "mx-1 justify-start px-3"),
        )}
      >
        <PlusIcon
          aria-hidden="true"
          className={variant === "tab" ? "size-6" : undefined}
        />
        {variant === "side" && m.nav.add}
      </SheetTrigger>
      <SheetContent title={m.quick.title} description={m.quick.description}>
        <ul className="grid grid-cols-2 gap-3">
          {options
            .filter((option) => canEdit || !option.editorOnly)
            .map(({ href, title, hint, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex h-full min-h-28 flex-col gap-2 rounded-2xl bg-background p-4 transition-colors hover:bg-blush"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-blush text-link">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="text-body font-semibold">{title}</span>
                  <span className="text-footnote text-muted-foreground">
                    {hint}
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
