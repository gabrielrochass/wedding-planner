import {
  ClipboardPasteIcon,
  ExternalLinkIcon,
  SofaIcon,
  StarIcon,
} from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/app-shell/empty-state";
import { PageHeader } from "@/components/app-shell/page-header";
import { HomeItemSheet } from "@/components/enxoval/item-sheet";
import { HomeStarter } from "@/components/enxoval/starter";
import { HomeStatusSelect } from "@/components/enxoval/status-select";
import { ProgressRing } from "@/components/home/progress-ring";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getGuests, getHomeItems } from "@/lib/data";
import {
  type HomeRoom,
  type HomeStatus,
  homeRooms,
  homeStatuses,
  homeSummary,
  itemEstimate,
} from "@/lib/home";
import { m } from "@/lib/i18n";
import { formatWholeBRL } from "@/lib/money";
import { canHelp } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: m.enxoval.title };

function href(room: HomeRoom | null, status: HomeStatus | null) {
  const params = new URLSearchParams();
  if (room) params.set("comodo", room);
  if (status) params.set("situacao", status);
  const query = params.toString();
  return (query ? `/enxoval?${query}` : "/enxoval") as Route;
}

const chip =
  "flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-secondary px-4 text-subhead font-medium aria-[current=page]:bg-foreground aria-[current=page]:text-background";

export default async function HomeItemsPage({
  searchParams,
}: PageProps<"/enxoval">) {
  const params = await searchParams;
  const room = homeRooms.includes(params.comodo as HomeRoom)
    ? (params.comodo as HomeRoom)
    : null;
  const status = homeStatuses.includes(params.situacao as HomeStatus)
    ? (params.situacao as HomeStatus)
    : null;
  const [{ role }, items, { households }] = await Promise.all([
    requireWedding(),
    getHomeItems(),
    getGuests(),
  ]);
  const editable = canHelp(role);
  const summary = homeSummary(items);
  const givers = new Map(households.map((h) => [h.id, h.name]));
  const householdOptions = households
    .filter((h) => h.list !== "out")
    .map(({ id, name }) => ({ id, name }));
  const visible = items.filter(
    (item) =>
      (!room || item.room === room) && (!status || item.status === status),
  );
  const groups = homeRooms
    .map((key) => [key, visible.filter((item) => item.room === key)] as const)
    .filter(([, list]) => list.length > 0);

  return (
    <>
      <PageHeader
        title={m.enxoval.title}
        action={
          editable ? (
            <HomeItemSheet
              item={null}
              room={room}
              households={householdOptions}
            />
          ) : undefined
        }
      />
      <div className="flex flex-col gap-6">
        <p className="text-body text-muted-foreground">{m.enxoval.intro}</p>

        {items.length === 0 ? (
          <EmptyState
            icon={SofaIcon}
            title={m.enxoval.emptyTitle}
            description={m.enxoval.emptyDescription}
            action={
              editable ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <HomeStarter />
                  <Link
                    href="/enxoval/colar"
                    className={buttonVariants({
                      size: "lg",
                      variant: "secondary",
                    })}
                  >
                    <ClipboardPasteIcon aria-hidden="true" />
                    {m.enxoval.import}
                  </Link>
                </div>
              ) : undefined
            }
          />
        ) : (
          <>
            <section
              data-tour="enxoval-resumo"
              className="flex items-center gap-5 rounded-3xl bg-linear-to-br from-blush via-card to-card p-5"
            >
              <ProgressRing
                value={summary.total ? summary.done / summary.total : 0}
                label={m.enxoval.progress(summary.done, summary.total)}
              />
              <dl className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  [m.enxoval.estimateTotal, summary.estimate],
                  [m.enxoval.remaining, summary.remaining],
                  [m.enxoval.spent, summary.spent],
                ].map(([label, cents]) => (
                  <div key={label as string} className="flex flex-col">
                    <dt className="text-footnote text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="text-headline font-semibold tabular-nums">
                      {formatWholeBRL(cents as number)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
            {summary.essentialsMissing > 0 && (
              <StatusBadge icon={StarIcon} tone="warning">
                {m.enxoval.essentialsMissing(summary.essentialsMissing)}
              </StatusBadge>
            )}

            <nav
              data-tour="enxoval-comodos"
              aria-label={m.enxoval.room}
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
            >
              <Link
                href={href(null, status)}
                aria-current={room === null ? "page" : undefined}
                className={chip}
              >
                {m.enxoval.allRooms}
              </Link>
              {homeRooms.map((key) => {
                const progress = summary.byRoom.get(key);
                if (!progress?.total) return null;
                return (
                  <Link
                    key={key}
                    href={href(key, status)}
                    aria-current={room === key ? "page" : undefined}
                    className={chip}
                  >
                    {m.rooms[key]}
                    <span className="text-footnote opacity-70 tabular-nums">
                      {m.enxoval.roomProgress(progress.done, progress.total)}
                    </span>
                  </Link>
                );
              })}
            </nav>
            <nav
              data-tour="enxoval-situacao"
              aria-label={m.enxoval.statusFilter}
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
            >
              <Link
                href={href(room, null)}
                aria-current={status === null ? "page" : undefined}
                className={chip}
              >
                {m.enxoval.allStatus}
              </Link>
              {homeStatuses.map((key) => (
                <Link
                  key={key}
                  href={href(room, key)}
                  aria-current={status === key ? "page" : undefined}
                  className={chip}
                >
                  {m.homeStatus[key]}
                  <span className="text-footnote opacity-70 tabular-nums">
                    {summary.byStatus[key]}
                  </span>
                </Link>
              ))}
            </nav>

            {editable && (
              <Link
                href="/enxoval/colar"
                data-tour="enxoval-colar"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "w-fit",
                )}
              >
                <ClipboardPasteIcon aria-hidden="true" />
                {m.enxoval.import}
              </Link>
            )}

            {groups.map(([key, list]) => (
              <section
                key={key}
                aria-labelledby={`comodo-${key}`}
                className="flex flex-col gap-2"
              >
                <h2
                  id={`comodo-${key}`}
                  className="flex items-baseline justify-between px-1"
                >
                  <span className="text-headline font-semibold">
                    {m.rooms[key]}
                  </span>
                  <span className="text-footnote text-muted-foreground tabular-nums">
                    {m.enxoval.roomProgress(
                      summary.byRoom.get(key)?.done ?? 0,
                      summary.byRoom.get(key)?.total ?? 0,
                    )}
                  </span>
                </h2>
                <ul className="divide-y overflow-hidden rounded-2xl bg-card">
                  {list.map((item) => {
                    const giver = item.household_id
                      ? givers.get(item.household_id)
                      : null;
                    const done =
                      item.status === "bought" || item.status === "gifted";
                    return (
                      <li
                        key={item.id}
                        data-tour="enxoval-item"
                        className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3"
                      >
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span
                            className={cn(
                              "text-body font-medium",
                              done && "text-muted-foreground",
                            )}
                          >
                            {item.quantity > 1 && (
                              <span className="mr-1 text-link tabular-nums">
                                {m.enxoval.quantityValue(item.quantity)}
                              </span>
                            )}
                            {item.name}
                            {item.priority === "essential" && (
                              <StarIcon
                                aria-label={m.homePriority.essential}
                                className="ml-1.5 inline size-3.5 fill-chart-2 align-baseline text-chart-2"
                              />
                            )}
                          </span>
                          <span className="flex flex-wrap gap-x-3 text-footnote text-muted-foreground">
                            {item.estimate_cents && (
                              <span className="tabular-nums">
                                {item.quantity > 1
                                  ? m.enxoval.each(
                                      formatWholeBRL(item.estimate_cents),
                                    )
                                  : formatWholeBRL(itemEstimate(item))}
                              </span>
                            )}
                            {item.store && <span>{item.store}</span>}
                            {giver && (
                              <span>{`${m.enxoval.giftFrom}: ${giver}`}</span>
                            )}
                          </span>
                        </div>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${m.enxoval.link}: ${item.name}`}
                            className="flex size-11 items-center justify-center rounded-full text-link hover:bg-muted"
                          >
                            <ExternalLinkIcon
                              aria-hidden="true"
                              className="size-4"
                            />
                          </a>
                        )}
                        <HomeStatusSelect
                          id={item.id}
                          name={item.name}
                          status={item.status}
                          disabled={!editable}
                        />
                        {editable && (
                          <HomeItemSheet
                            item={item}
                            room={null}
                            households={householdOptions}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>
    </>
  );
}
