import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell/page-header";
import { BulkPaste } from "@/components/guests/bulk-paste";
import { m } from "@/lib/i18n";

export const metadata: Metadata = { title: m.guests.bulkTitle };

export default function PasteGuestsPage() {
  return (
    <>
      <PageHeader
        title={m.guests.bulkTitle}
        back={{ href: "/convidados", label: m.guests.title }}
      />
      <BulkPaste />
    </>
  );
}
