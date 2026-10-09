import {
  DownloadIcon,
  HeartIcon,
  UserRoundIcon,
  UsersRoundIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell/page-header";
import { SettingsLinks } from "@/components/settings/settings-links";
import { m } from "@/lib/i18n";

export const metadata: Metadata = { title: m.nav.settings };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title={m.nav.settings} />
      <div className="flex flex-col gap-6">
        <SettingsLinks
          links={[
            {
              href: "/ajustes/casamento",
              title: m.wedding.title,
              hint: m.wedding.hint,
              icon: HeartIcon,
              color: "chart-5",
            },
            {
              href: "/equipe",
              title: m.team.title,
              hint: m.team.hint,
              icon: UsersRoundIcon,
              color: "chart-1",
            },
          ]}
        />
        <SettingsLinks
          links={[
            {
              href: "/ajustes/conta",
              title: m.account.title,
              hint: m.account.hint,
              icon: UserRoundIcon,
              color: "chart-other",
            },
            {
              href: "/ajustes/conta/exportar",
              title: m.account.export,
              hint: m.account.exportHint,
              icon: DownloadIcon,
              color: "chart-3",
            },
          ]}
        />
      </div>
    </>
  );
}
