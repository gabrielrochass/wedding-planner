import { QuickAdd } from "@/components/app-shell/quick-add";
import { Rings } from "@/components/brand/rings";
import { m } from "@/lib/i18n";
import {
  type NavItem,
  primaryNav,
  secondaryNav,
  settingsNav,
} from "./nav-items";
import { NavLink } from "./nav-link";

export function SideNav({
  couple,
  canAdd,
}: {
  couple: string;
  canAdd: boolean;
}) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 px-3 py-6 md:flex">
      <div className="flex flex-col gap-1 px-3">
        <p
          className="flex items-center gap-2 text-headline font-semibold tracking-tight"
          translate="no"
        >
          <Rings className="h-6 w-9" />
          {m.app.name}
        </p>
        <p className="truncate font-display text-subhead text-muted-foreground">
          {couple}
        </p>
      </div>
      {canAdd && <QuickAdd variant="side" />}
      <nav
        aria-label={m.nav.label}
        className="flex flex-1 flex-col justify-between"
      >
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-0.5">
            {primaryNav.map((item) => (
              <SideNavItem key={item.href} item={item} />
            ))}
          </ul>
          <ul className="flex flex-col gap-0.5">
            {secondaryNav.map((item) => (
              <SideNavItem key={item.href} item={item} />
            ))}
          </ul>
        </div>
        <ul>
          <SideNavItem item={settingsNav} />
        </ul>
      </nav>
    </aside>
  );
}

function SideNavItem({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <li>
      <NavLink
        href={item.href}
        className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-subhead text-muted-foreground transition-colors hover:bg-card/60 hover:text-foreground aria-[current=page]:bg-card aria-[current=page]:font-semibold aria-[current=page]:text-foreground aria-[current=page]:shadow-xs [&_svg]:stroke-[1.75] aria-[current=page]:[&_svg]:stroke-[2.25]"
      >
        <Icon aria-hidden="true" className="size-5" />
        {item.label}
      </NavLink>
    </li>
  );
}
