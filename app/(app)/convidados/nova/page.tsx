import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell/page-header";
import { HouseholdEditor } from "@/components/guests/household-editor";
import { m } from "@/lib/i18n";
import { requireWedding } from "@/lib/supabase/server";

export const metadata: Metadata = { title: m.guests.newHousehold };

export default async function NewHouseholdPage() {
  const { wedding } = await requireWedding();
  return (
    <>
      <PageHeader
        title={m.guests.newHousehold}
        back={{ href: "/convidados", label: m.guests.title }}
      />
      <HouseholdEditor
        household={null}
        partnerA={wedding.partner_a}
        partnerB={wedding.partner_b}
      />
    </>
  );
}
