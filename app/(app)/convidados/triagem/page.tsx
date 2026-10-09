import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell/page-header";
import { Triage } from "@/components/guests/triage";
import { getGuests } from "@/lib/data";
import { m } from "@/lib/i18n";

export const metadata: Metadata = { title: m.triage.title };

export default async function TriagePage() {
  const { households, guests } = await getGuests();
  const cards = households
    .filter((household) => household.list === "pending")
    .map((household) => ({
      id: household.id,
      name: household.name,
      members: guests
        .filter((g) => g.household_id === household.id)
        .map((g) => g.name),
    }));

  return (
    <>
      <PageHeader
        title={m.triage.title}
        back={{ href: "/convidados", label: m.guests.title }}
      />
      <Triage cards={cards} />
    </>
  );
}
