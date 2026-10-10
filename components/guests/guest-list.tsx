"use client";

import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleXIcon,
  MessageCircleIcon,
  SearchIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Guest, Household } from "@/lib/data";
import { initials } from "@/lib/guests";
import { m } from "@/lib/i18n";
import type { Enums } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

type Filter = "all" | "pending" | "b" | "out";
type Rsvp = Enums<"rsvp_status">;

const rsvpIcons: Record<Rsvp, { icon: typeof CircleCheckIcon; tone: string }> =
  {
    yes: { icon: CircleCheckIcon, tone: "text-success" },
    no: { icon: CircleXIcon, tone: "text-danger" },
    pending: { icon: CircleHelpIcon, tone: "text-muted-foreground" },
  };

const sideRing = {
  a: "ring-chart-1",
  b: "ring-chart-5",
  both: "ring-chart-3",
} as const;

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export function GuestList({
  households,
  guests,
  couple,
  dateLabel,
}: {
  households: Household[];
  guests: Guest[];
  couple: string;
  dateLabel: string | null;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const deferred = useDeferredValue(query);
  const members = new Map<string, Guest[]>();
  for (const guest of guests) {
    members.set(guest.household_id, [
      ...(members.get(guest.household_id) ?? []),
      guest,
    ]);
  }
  const needle = normalize(deferred.trim());
  const visible = households.filter((household) => {
    if (household.list === "pending") return false;
    const people = members.get(household.id) ?? [];
    if (filter === "all" && household.list !== "a") return false;
    if (
      filter === "pending" &&
      !(household.list === "a" && people.some((g) => g.rsvp === "pending"))
    )
      return false;
    if (filter === "b" && household.list !== "b") return false;
    if (filter === "out" && household.list !== "out") return false;
    if (!needle) return true;
    return normalize(
      [household.name, ...people.map((g) => g.name)].join(" "),
    ).includes(needle);
  });

  function message(household: Household, people: Guest[]) {
    if (!household.save_the_date_on)
      return m.whatsapp.saveTheDate(couple, dateLabel);
    if (!household.invited_on) return m.whatsapp.invite(couple, dateLabel);
    if (people.some((g) => g.rsvp === "pending"))
      return m.whatsapp.reminder(couple);
    return "";
  }

  const filters: [Filter, string][] = [
    ["all", m.lists.a],
    ["pending", m.guests.filterPending],
    ["b", m.lists.b],
    ["out", m.lists.out],
  ];

  return (
    <section aria-labelledby="lista" className="flex flex-col gap-3">
      <h2 id="lista" className="sr-only">
        {m.guests.title}
      </h2>
      <div data-tour="convidados-busca" className="relative">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          aria-label={m.guests.search}
          placeholder={m.guests.searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="bg-card pl-10 dark:bg-card"
        />
      </div>
      <fieldset
        data-tour="convidados-filtros"
        className="flex min-w-0 gap-2 overflow-x-auto pb-1"
      >
        <legend className="sr-only">{m.guests.list}</legend>
        {filters.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className="flex min-h-11 shrink-0 items-center rounded-full bg-secondary px-4 text-subhead font-medium aria-pressed:bg-foreground aria-pressed:text-background"
          >
            {label}
          </button>
        ))}
      </fieldset>
      <output className="text-footnote text-muted-foreground">
        {m.guests.householdCount(visible.length)}
      </output>
      {visible.length === 0 ? (
        <p className="rounded-2xl bg-card px-4 py-8 text-center text-subhead text-muted-foreground">
          {m.guests.noResults}
        </p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-2xl bg-card">
          {visible.map((household) => {
            const people = members.get(household.id) ?? [];
            const link = household.phone
              ? whatsappLink(household.phone, message(household, people))
              : null;
            return (
              <li
                key={household.id}
                data-tour="convidados-familia"
                className="flex items-center gap-3 px-4 py-3"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full bg-blush text-subhead font-semibold text-link ring-2",
                    sideRing[household.side],
                  )}
                >
                  {initials(household.name) || "?"}
                </span>
                <Link
                  href={`/convidados/${household.id}` as Route}
                  className="flex min-w-0 flex-1 flex-col gap-1"
                >
                  <span className="truncate text-body font-medium">
                    {household.name}
                  </span>
                  <span className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {people.map((guest) => {
                      const { icon: Icon, tone } = rsvpIcons[guest.rsvp];
                      return (
                        <span
                          key={guest.id}
                          className="flex items-center gap-1 text-footnote text-muted-foreground"
                        >
                          <Icon
                            aria-hidden="true"
                            className={cn("size-3.5", tone)}
                          />
                          {guest.name}
                          <span className="sr-only">{`: ${m.rsvp[guest.rsvp]}`}</span>
                        </span>
                      );
                    })}
                  </span>
                </Link>
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${m.guests.whatsapp}: ${household.name}`}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-success hover:bg-muted"
                  >
                    <MessageCircleIcon aria-hidden="true" className="size-5" />
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
