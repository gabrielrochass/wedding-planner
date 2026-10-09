import { GiftIcon, MessageCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/app-shell/page-header";
import { HouseholdEditor } from "@/components/guests/household-editor";
import { RsvpSwitch } from "@/components/guests/rsvp-switch";
import { buttonVariants } from "@/components/ui/button";
import { getHomeItems, getHousehold } from "@/lib/data";
import { formatFullDate } from "@/lib/dates";
import { m } from "@/lib/i18n";
import { canHelp } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { formatPhone, whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: m.guests.editHousehold };

export default async function HouseholdPage({
  params,
}: PageProps<"/convidados/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [{ wedding, role }, household, homeItems] = await Promise.all([
    requireWedding(),
    getHousehold(id),
    getHomeItems(),
  ]);
  const gifts = homeItems.filter((item) => item.household_id === id);
  if (!household) notFound();
  const editable = canHelp(role);
  const couple = m.home.couple(wedding.partner_a, wedding.partner_b);
  const date = wedding.wedding_date
    ? formatFullDate(wedding.wedding_date)
    : null;
  const phone = household.phone ?? "";
  const messages = (
    [
      [m.guests.whatsappSaveTheDate, m.whatsapp.saveTheDate(couple, date)],
      [m.guests.whatsappInvite, m.whatsapp.invite(couple, date)],
      [m.guests.whatsappReminder, m.whatsapp.reminder(couple)],
    ] as const
  ).flatMap(([label, text]) => {
    const href = phone ? whatsappLink(phone, text) : null;
    return href ? [{ label, href }] : [];
  });

  return (
    <>
      <PageHeader
        title={household.name}
        back={{ href: "/convidados", label: m.guests.title }}
      />
      <div className="flex flex-col gap-8">
        {household.list === "a" && household.members.length > 0 && (
          <section
            aria-labelledby="presenca"
            className="flex flex-col gap-4 rounded-2xl bg-card p-4"
          >
            <h2 id="presenca" className="text-headline font-semibold">
              {m.guests.rsvp}
            </h2>
            {household.members.map((guest) => (
              <RsvpSwitch
                key={guest.id}
                id={guest.id}
                name={guest.name}
                value={guest.rsvp}
                disabled={!editable}
              />
            ))}
          </section>
        )}

        {messages.length > 0 && (
          <section aria-labelledby="whatsapp" className="flex flex-col gap-3">
            <h2
              id="whatsapp"
              className="flex items-baseline justify-between gap-2 text-headline font-semibold"
            >
              {m.guests.whatsapp}
              <span className="text-subhead font-normal text-muted-foreground tabular-nums">
                {formatPhone(phone)}
              </span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {messages.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "lg" }),
                  )}
                >
                  <MessageCircleIcon
                    aria-hidden="true"
                    className="text-success"
                  />
                  {label}
                </a>
              ))}
            </div>
          </section>
        )}

        {gifts.length > 0 && (
          <section
            aria-labelledby="presentes"
            className="flex flex-col gap-3 rounded-2xl bg-card p-4"
          >
            <h2 id="presentes" className="text-headline font-semibold">
              {m.enxoval.giftsFromHousehold}
            </h2>
            <ul className="flex flex-col gap-2">
              {gifts.map((item) => (
                <li key={item.id} className="flex items-center gap-2 text-body">
                  <GiftIcon aria-hidden="true" className="size-4 text-link" />
                  {item.name}
                </li>
              ))}
            </ul>
          </section>
        )}

        {editable ? (
          <HouseholdEditor
            household={household}
            partnerA={wedding.partner_a}
            partnerB={wedding.partner_b}
          />
        ) : (
          <p className="text-subhead text-muted-foreground">
            {m.common.readOnly}
          </p>
        )}
      </div>
    </>
  );
}
