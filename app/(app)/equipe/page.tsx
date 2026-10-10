import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell/page-header";
import { InviteLink } from "@/components/team/invite-link";
import { MemberControls, RevokeInvite } from "@/components/team/member-row";
import { getInvites, getPeople } from "@/lib/data";
import { formatDate, todayInSaoPaulo } from "@/lib/dates";
import { initials } from "@/lib/guests";
import { m } from "@/lib/i18n";
import { canManageTeam } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";

export const metadata: Metadata = { title: m.team.title };

export default async function TeamPage() {
  const [{ wedding, role }, people] = await Promise.all([
    requireWedding(),
    getPeople(),
  ]);
  const manager = canManageTeam(role);
  const invites = manager ? await getInvites() : [];
  const today = todayInSaoPaulo();

  return (
    <>
      <PageHeader title={m.team.title} />
      <div className="flex flex-col gap-8">
        <p className="text-body text-muted-foreground">{m.team.intro}</p>
        <ul
          data-tour="equipe-membros"
          className="divide-y overflow-hidden rounded-2xl bg-card"
        >
          {people.map((person) => {
            const name = person.display_name ?? m.team.unnamed;
            return (
              <li
                key={person.user_id}
                className="flex flex-wrap items-center gap-3 px-4 py-3"
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blush text-subhead font-semibold text-link"
                >
                  {initials(name) || "?"}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body font-medium">
                    {name}
                    {person.is_me && (
                      <span className="text-muted-foreground">{` (${m.team.you})`}</span>
                    )}
                  </span>
                  <span className="text-footnote text-muted-foreground">
                    {m.roles[person.role]}
                  </span>
                </span>
                {manager && !person.is_me && (
                  <MemberControls
                    userId={person.user_id}
                    name={name}
                    role={person.role}
                  />
                )}
              </li>
            );
          })}
        </ul>

        {manager && (
          <InviteLink
            couple={m.home.couple(wedding.partner_a, wedding.partner_b)}
          />
        )}

        {invites.length > 0 && (
          <section
            data-tour="equipe-convites"
            aria-labelledby="convites"
            className="flex flex-col gap-3"
          >
            <h2 id="convites" className="text-headline font-semibold">
              {m.team.pendingInvites}
            </h2>
            <ul className="divide-y overflow-hidden rounded-2xl bg-card">
              {invites.map((invite) => (
                <li
                  key={invite.id}
                  className="flex items-center justify-between gap-3 px-4 py-2"
                >
                  <span className="flex flex-col">
                    <span className="text-body">{m.roles[invite.role]}</span>
                    <span className="text-footnote text-muted-foreground">
                      {m.team.expires(
                        formatDate(
                          todayInSaoPaulo(new Date(invite.expires_at)),
                          today,
                        ),
                      )}
                    </span>
                  </span>
                  <RevokeInvite id={invite.id} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
