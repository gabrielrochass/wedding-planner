import type { Metadata } from "next";
import { secondaryNav, settingsNav } from "@/components/app-shell/nav-items";
import { PageHeader } from "@/components/app-shell/page-header";
import { SettingsLinks } from "@/components/settings/settings-links";
import { m } from "@/lib/i18n";

export const metadata: Metadata = { title: m.nav.more };

const colors = [
  "chart-2",
  "chart-5",
  "chart-3",
  "chart-4",
  "chart-1",
  "chart-1",
  "chart-other",
];

export default function MorePage() {
  return (
    <>
      <PageHeader title={m.nav.more} back={{ href: "/", label: m.nav.home }} />
      <SettingsLinks
        links={[...secondaryNav, settingsNav].map((item, index) => ({
          href: item.href,
          title: item.label,
          icon: item.icon,
          color: colors[index],
        }))}
      />
    </>
  );
}
