import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell/page-header";
import { HomeImport } from "@/components/enxoval/import-paste";
import { m } from "@/lib/i18n";

export const metadata: Metadata = { title: m.enxoval.import };

export default function PasteHomeItemsPage() {
  return (
    <>
      <PageHeader
        title={m.enxoval.import}
        back={{ href: "/enxoval", label: m.enxoval.title }}
      />
      <HomeImport />
    </>
  );
}
