import { ChevronRightIcon, HeartIcon } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { WeddingSetup } from "@/components/onboarding/wedding-setup";
import { switchWedding } from "@/lib/actions/wedding";
import { safeNext } from "@/lib/auth-paths";
import { getMemberships } from "@/lib/data";
import { formatFullDate } from "@/lib/dates";
import { m } from "@/lib/i18n";
import { requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: m.onboarding.namesQuestion };

export default async function SetupPage({
  searchParams,
}: PageProps<"/comecar">) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (next.startsWith("/convite/")) redirect(next as Route);

  const { supabase, userId } = await requireUser();
  const [{ data: profile }, memberships] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, current_wedding_id")
      .eq("id", userId)
      .single(),
    getMemberships(),
  ]);
  const creating = params.novo === "1";
  const current = memberships.find((w) => w.id === profile?.current_wedding_id);
  if (current && !creating) redirect(next as Route);

  const firstName = profile?.display_name?.trim().split(/\s+/)[0] ?? "";
  const choose = memberships.length > 0 && !creating;

  return (
    <main id="conteudo" tabIndex={-1} className="min-h-dvh px-6">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 py-12">
        {choose ? (
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="font-display text-large-title font-bold tracking-tight">
                {m.wedding.switch}
              </h1>
              <p className="text-body text-muted-foreground">
                {m.wedding.switchHint}
              </p>
            </div>
            <ul className="divide-y overflow-hidden rounded-2xl bg-card">
              {memberships.map((wedding) => (
                <li key={wedding.id}>
                  <form action={switchWedding.bind(null, wedding.id)}>
                    <button
                      type="submit"
                      className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blush text-link">
                        <HeartIcon aria-hidden="true" className="size-5" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-body font-medium">
                          {m.home.couple(wedding.partner_a, wedding.partner_b)}
                        </span>
                        <span className="text-footnote text-muted-foreground">
                          {m.roles[wedding.role]}
                          {wedding.wedding_date
                            ? `, ${formatFullDate(wedding.wedding_date)}`
                            : ""}
                        </span>
                      </span>
                      <ChevronRightIcon
                        aria-hidden="true"
                        className="size-5 text-muted-foreground"
                      />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
            <Link
              href={"/comecar?novo=1" as Route}
              className="flex min-h-11 w-fit items-center self-center text-subhead font-medium text-link"
            >
              {m.wedding.createAnother}
            </Link>
          </section>
        ) : (
          <>
            <WeddingSetup firstName={firstName} />
            <p className="text-center text-footnote text-muted-foreground">
              {m.onboarding.haveInvite}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
