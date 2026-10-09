import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell/page-header";
import { ExportList } from "@/components/settings/export-list";
import { getPeople } from "@/lib/data";
import { m } from "@/lib/i18n";
import { requireWedding } from "@/lib/supabase/server";

export const metadata: Metadata = { title: m.exportData.title };

export default async function ExportPage() {
  const [{ wedding }, people] = await Promise.all([
    requireWedding(),
    getPeople(),
  ]);
  return (
    <>
      <PageHeader
        title={m.exportData.title}
        back={{ href: "/ajustes", label: m.nav.settings }}
      />
      <div className="flex flex-col gap-6">
        <p className="text-body text-muted-foreground">{m.exportData.intro}</p>
        <ExportList
          weddingId={wedding.id}
          weddingDate={wedding.wedding_date}
          partners={{ a: wedding.partner_a, b: wedding.partner_b }}
          people={people.map((p) => [
            p.user_id,
            p.display_name ?? m.team.unnamed,
          ])}
        />
      </div>
    </>
  );
}
