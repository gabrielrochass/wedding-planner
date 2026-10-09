import {
  ClockIcon,
  HeartHandshakeIcon,
  HouseIcon,
  LayoutGridIcon,
  LightbulbIcon,
  ListChecksIcon,
  type LucideIcon,
  MusicIcon,
  SettingsIcon,
  SofaIcon,
  StoreIcon,
  UsersIcon,
  UsersRoundIcon,
  WalletIcon,
} from "lucide-react";
import type { Route } from "next";
import { m } from "@/lib/i18n";

export type NavItem = {
  href: Route;
  label: string;
  icon: LucideIcon;
};

export const primaryNav: readonly NavItem[] = [
  { href: "/", label: m.nav.home, icon: HouseIcon },
  { href: "/tarefas", label: m.nav.tasks, icon: ListChecksIcon },
  { href: "/convidados", label: m.nav.guests, icon: UsersIcon },
  { href: "/orcamento", label: m.nav.budget, icon: WalletIcon },
];

export const secondaryNav: readonly NavItem[] = [
  { href: "/fornecedores", label: m.nav.vendors, icon: StoreIcon },
  { href: "/ideias", label: m.nav.ideas, icon: LightbulbIcon },
  { href: "/musicas", label: m.nav.music, icon: MusicIcon },
  { href: "/cortejo", label: m.nav.party, icon: HeartHandshakeIcon },
  { href: "/cronograma", label: m.nav.timeline, icon: ClockIcon },
  { href: "/enxoval", label: m.nav.enxoval, icon: SofaIcon },
  { href: "/equipe", label: m.nav.team, icon: UsersRoundIcon },
];

export const settingsNav: NavItem = {
  href: "/ajustes",
  label: m.nav.settings,
  icon: SettingsIcon,
};

export const moreNav: NavItem = {
  href: "/mais",
  label: m.nav.more,
  icon: LayoutGridIcon,
};
