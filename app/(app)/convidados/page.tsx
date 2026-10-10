import {
  ClipboardPasteIcon,
  PlusIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/app-shell/empty-state";
import { PageHeader } from "@/components/app-shell/page-header";
import { GuestList } from "@/components/guests/guest-list";
import { GuestSummary } from "@/components/guests/guest-summary";
import { buttonVariants } from "@/components/ui/button";
import { getGuests } from "@/lib/data";
import { headcount } from "@/lib/guests";
import { m } from "@/lib/i18n";
import { canHelp } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { weddingDateLabel } from "@/lib/wedding";

export const metadata: Metadata = { title: m.guests.title };

export default async function GuestsPage() {
  const [{ wedding, role }, { households, guests }] = await Promise.all([
    requireWedding(),
    getGuests(),
  ]);
  const editable = canHelp(role);
  const pending = households.filter((h) => h.list === "pending").length;
  const count = headcount(households, guests);

  return (
    <>
      <PageHeader
        title={m.guests.title}
        action={
          editable ? (
            <Link
              href="/convidados/nova"
              aria-label={m.guests.newHousehold}
              className={buttonVariants({
                size: "icon-lg",
                variant: "secondary",
              })}
            >
              <PlusIcon aria-hidden="true" className="size-6" />
            </Link>
          ) : undefined
        }
      />
      {households.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={m.guests.emptyTitle}
          description={m.guests.emptyDescription}
          action={
            editable ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/convidados/nova"
                  className={buttonVariants({ size: "lg" })}
                >
                  <PlusIcon aria-hidden="true" />
                  {m.guests.newHousehold}
                </Link>
                <Link
                  href="/convidados/colar"
                  className={buttonVariants({
                    size: "lg",
                    variant: "secondary",
                  })}
                >
                  <ClipboardPasteIcon aria-hidden="true" />
                  {m.guests.bulkTitle}
                </Link>
              </div>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {pending > 0 && editable && (
            <Link
              href="/convidados/triagem"
              className="flex min-h-16 items-center gap-3 rounded-2xl bg-linear-to-r from-blush to-card px-4 py-3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <SparklesIcon aria-hidden="true" className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className="text-body font-semibold">
                  {m.triage.start(pending)}
                </span>
                <span className="text-footnote text-muted-foreground">
                  {m.triage.intro}
                </span>
              </span>
            </Link>
          )}
          <GuestSummary
            count={count}
            partnerA={wedding.partner_a}
            partnerB={wedding.partner_b}
          />
          {editable && (
            <Link
              href="/convidados/colar"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "w-fit",
              )}
            >
              <ClipboardPasteIcon aria-hidden="true" />
              {m.guests.bulkTitle}
            </Link>
          )}
          <GuestList
            households={households}
            guests={guests}
            couple={m.home.couple(wedding.partner_a, wedding.partner_b)}
            dateLabel={weddingDateLabel(
              wedding.wedding_date,
              wedding.date_is_estimate,
            )}
          />
        </div>
      )}
    </>
  );
}
