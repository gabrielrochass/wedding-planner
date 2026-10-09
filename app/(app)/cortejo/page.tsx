import {
  ChurchIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  PackageIcon,
  UsersRoundIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/app-shell/empty-state";
import { PageHeader } from "@/components/app-shell/page-header";
import { MoveButtons, PartySheet } from "@/components/party/party-sheet";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import { getParty, type PartyMember } from "@/lib/data";
import { initials } from "@/lib/guests";
import { m } from "@/lib/i18n";
import { type PartyRole, pairs } from "@/lib/party";
import { canHelp } from "@/lib/roles";
import type { Enums } from "@/lib/supabase/database.types";
import { requireWedding } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: m.party.title };

const inviteLook: Record<
  Enums<"party_invite">,
  { icon: typeof PackageIcon; tone: Tone }
> = {
  pending: { icon: CircleDashedIcon, tone: "muted" },
  ordered: { icon: PackageIcon, tone: "warning" },
  delivered: { icon: CircleCheckIcon, tone: "success" },
};

const sideRing = {
  a: "ring-chart-1",
  b: "ring-chart-5",
  both: "ring-chart-3",
} as const;

function Person({
  member,
  editable,
  others,
  partners,
}: {
  member: PartyMember;
  editable: boolean;
  others: { id: string; name: string }[];
  partners: { a: string; b: string };
}) {
  const look = inviteLook[member.invite_status];
  return (
    <div className="relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl bg-card px-2 pt-3 pb-1 text-center">
      <span
        aria-hidden="true"
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full bg-blush text-subhead font-semibold text-link ring-2",
          sideRing[member.side],
        )}
      >
        {initials(member.name) || "?"}
      </span>
      <span className="w-full truncate text-subhead font-semibold">
        {member.name}
      </span>
      <span className="line-clamp-2 w-full text-caption text-muted-foreground">
        {m.partyRoles[member.role as PartyRole]}
        {member.attire ? `, ${member.attire}` : ""}
      </span>
      <StatusBadge icon={look.icon} tone={look.tone} className="text-caption">
        {m.partyInvite[member.invite_status]}
      </StatusBadge>
      {editable ? (
        <PartySheet
          member={member}
          others={others.filter((o) => o.id !== member.id)}
          partnerA={partners.a}
          partnerB={partners.b}
        />
      ) : (
        <span className="h-2" />
      )}
    </div>
  );
}

export default async function PartyPage() {
  const [{ wedding, role }, members] = await Promise.all([
    requireWedding(),
    getParty(),
  ]);
  const editable = canHelp(role);
  const rows = pairs(members);
  const others = members.map(({ id, name }) => ({ id, name }));
  const partners = { a: wedding.partner_a, b: wedding.partner_b };
  const delivered = members.filter(
    (member) => member.invite_status === "delivered",
  ).length;

  return (
    <>
      <PageHeader
        title={m.party.title}
        action={
          editable ? (
            <PartySheet
              member={null}
              others={others}
              partnerA={partners.a}
              partnerB={partners.b}
            />
          ) : undefined
        }
      />
      <div className="flex flex-col gap-6">
        <p className="text-body text-muted-foreground">{m.party.intro}</p>
        {members.length === 0 ? (
          <EmptyState
            icon={UsersRoundIcon}
            title={m.party.emptyTitle}
            description={m.party.emptyDescription}
          />
        ) : (
          <>
            <p className="text-subhead tabular-nums">
              {m.party.invitesDone(delivered, members.length)}
            </p>
            <div className="flex items-center justify-between px-2 text-footnote font-medium text-muted-foreground">
              <span>{m.guests.sideOf(partners.a)}</span>
              <span>{m.guests.sideOf(partners.b)}</span>
            </div>
            <ol className="relative flex flex-col gap-3">
              <li className="flex flex-col items-center gap-1 pb-2">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                  <ChurchIcon aria-hidden="true" className="size-6" />
                </span>
                <span className="font-display text-headline font-bold">
                  {m.party.altar}
                </span>
              </li>
              {rows.map((row, index) => {
                const first = row.left ?? row.right;
                if (!first) return null;
                return (
                  <li key={first.id} className="relative flex flex-col gap-1">
                    <div className="flex items-stretch gap-2">
                      {row.left ? (
                        <Person
                          member={row.left}
                          editable={editable}
                          others={others}
                          partners={partners}
                        />
                      ) : (
                        <span className="flex-1" />
                      )}
                      <span className="flex w-8 shrink-0 flex-col items-center self-center">
                        <span className="rounded-full bg-blush px-1.5 text-caption2 font-bold text-link tabular-nums">
                          {m.party.position(index + 1)}
                        </span>
                      </span>
                      {row.right ? (
                        <Person
                          member={row.right}
                          editable={editable}
                          others={others}
                          partners={partners}
                        />
                      ) : (
                        <span className="flex-1" />
                      )}
                    </div>
                    {editable && rows.length > 1 && (
                      <div className="flex justify-center">
                        <MoveButtons
                          id={first.id}
                          name={first.name}
                          first={index === 0}
                          last={index === rows.length - 1}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
              <li className="flex justify-center pt-2 text-footnote font-medium text-muted-foreground">
                {m.party.aisle}
              </li>
            </ol>
          </>
        )}
      </div>
    </>
  );
}
