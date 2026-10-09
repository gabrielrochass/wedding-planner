import { HeartHandshakeIcon, TriangleAlertIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Rings } from "@/components/brand/rings";
import { AcceptInvite } from "@/components/team/accept-invite";
import { buttonVariants } from "@/components/ui/button";
import { m } from "@/lib/i18n";
import { requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: m.invite.title };

export default async function InvitePage({
  params,
}: PageProps<"/convite/[token]">) {
  const { token } = await params;
  const { supabase } = await requireUser();
  const valid = /^[0-9a-f]{48}$/.test(token);
  const { data } = valid
    ? await supabase.rpc("invite_preview", { p_token: token })
    : { data: null };
  const invite = data?.[0];

  return (
    <main id="conteudo" tabIndex={-1} className="min-h-dvh px-6">
      <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 py-12 text-center">
        {invite ? (
          <>
            <Rings className="mx-auto h-16 w-24" />
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-large-title font-bold tracking-tight text-balance">
                {m.invite.heading(
                  m.home.couple(invite.partner_a, invite.partner_b),
                )}
              </h1>
              <p className="text-body text-muted-foreground">
                {invite.already_member
                  ? m.invite.already
                  : m.invite.as(m.roles[invite.role])}
              </p>
              {!invite.already_member && (
                <p className="text-footnote text-muted-foreground">
                  {m.roleHints[invite.role]}
                </p>
              )}
            </div>
            {invite.already_member ? (
              <Link href="/" className={buttonVariants({ size: "lg" })}>
                <HeartHandshakeIcon aria-hidden="true" />
                {m.invite.open}
              </Link>
            ) : (
              <AcceptInvite token={token} />
            )}
          </>
        ) : (
          <>
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
              <TriangleAlertIcon
                aria-hidden="true"
                className="size-7 text-warning"
              />
            </span>
            <div className="flex flex-col gap-2">
              <h1 className="text-title1 font-bold">{m.invite.invalidTitle}</h1>
              <p className="text-body text-muted-foreground">
                {m.invite.invalidDescription}
              </p>
            </div>
            <Link
              href="/"
              className={buttonVariants({ size: "lg", variant: "secondary" })}
            >
              {m.errors.home}
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
