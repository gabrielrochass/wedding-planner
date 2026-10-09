import type { Metadata, Route } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/app-shell/page-header";
import { ConfirmForm } from "@/components/settings/confirm-form";
import { WeddingForm } from "@/components/wedding/wedding-form";
import {
  deleteWedding,
  leaveWedding,
  switchWedding,
} from "@/lib/actions/wedding";
import { getMemberships } from "@/lib/data";
import { m } from "@/lib/i18n";
import { canEdit, canManageTeam } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";

export const metadata: Metadata = { title: m.wedding.title };

export default async function WeddingSettingsPage() {
  const [{ wedding, role }, memberships] = await Promise.all([
    requireWedding(),
    getMemberships(),
  ]);
  const others = memberships.filter((w) => w.id !== wedding.id);

  return (
    <>
      <PageHeader
        title={m.wedding.title}
        back={{ href: "/ajustes", label: m.nav.settings }}
      />
      <div className="flex flex-col gap-10">
        {!canEdit(role) && (
          <p className="text-subhead text-muted-foreground">
            {m.common.readOnly}
          </p>
        )}
        <WeddingForm wedding={wedding} disabled={!canEdit(role)} />

        <section aria-labelledby="trocar" className="flex flex-col gap-3">
          <h2 id="trocar" className="text-headline font-semibold">
            {m.wedding.switch}
          </h2>
          {others.length > 0 && (
            <ul className="divide-y overflow-hidden rounded-2xl bg-card">
              {others.map((other) => (
                <li key={other.id}>
                  <form action={switchWedding.bind(null, other.id)}>
                    <button
                      type="submit"
                      className="flex min-h-14 w-full items-center px-4 text-left text-body transition-colors hover:bg-muted/60"
                    >
                      {m.home.couple(other.partner_a, other.partner_b)}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={"/comecar?novo=1" as Route}
            className="flex min-h-11 w-fit items-center text-subhead font-medium text-link"
          >
            {m.wedding.createAnother}
          </Link>
        </section>

        <section
          aria-labelledby="sair"
          className="flex flex-col gap-3 rounded-2xl bg-card p-5"
        >
          <h2 id="sair" className="text-headline font-semibold">
            {m.team.leave}
          </h2>
          <p className="text-subhead text-muted-foreground">
            {m.team.leaveHint}
          </p>
          <ConfirmForm
            action={leaveWedding}
            confirm={m.team.leaveConfirm}
            label={m.team.leave}
            pendingLabel={m.common.saving}
          />
        </section>

        {canManageTeam(role) && (
          <section
            aria-labelledby="excluir"
            className="flex flex-col gap-3 rounded-2xl bg-card p-5"
          >
            <h2 id="excluir" className="text-headline font-semibold">
              {m.wedding.delete}
            </h2>
            <p className="text-subhead text-muted-foreground">
              {m.wedding.deleteHint}
            </p>
            <ConfirmForm
              action={deleteWedding}
              confirm={m.wedding.deleteConfirm}
              label={m.wedding.delete}
              pendingLabel={m.common.deleting}
            />
          </section>
        )}
      </div>
    </>
  );
}
