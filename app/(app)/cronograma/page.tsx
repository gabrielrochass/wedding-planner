import {
  ClockIcon,
  MapPinIcon,
  MessageCircleIcon,
  MusicIcon,
  TriangleAlertIcon,
  UserRoundIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/app-shell/empty-state";
import { PageHeader } from "@/components/app-shell/page-header";
import { NowMarker } from "@/components/timeline/now-marker";
import { TimelineSheet } from "@/components/timeline/timeline-sheet";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSongs, getTimeline } from "@/lib/data";
import { m } from "@/lib/i18n";
import { canHelp } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";
import { formatTime, inTimeOrder, overlaps } from "@/lib/timeline";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: m.timeline.title };

export default async function TimelinePage() {
  const [{ wedding, role }, items, songs] = await Promise.all([
    requireWedding(),
    getTimeline(),
    getSongs(),
  ]);
  const editable = canHelp(role);
  const ordered = inTimeOrder(items);
  const clashing = overlaps(items);
  const songTitle = new Map(songs.map((song) => [song.id, song.title]));
  const songOptions = songs
    .filter((song) => song.chosen)
    .map(({ id, title }) => ({ id, title }));
  const couple = m.home.couple(wedding.partner_a, wedding.partner_b);
  const shareLines = ordered
    .map(
      (item) =>
        `${formatTime(item.starts_at)} ${item.title}${item.place ? `, ${item.place}` : ""}`,
    )
    .join("\n");

  return (
    <>
      <PageHeader
        title={m.timeline.title}
        action={
          editable ? (
            <TimelineSheet item={null} songs={songOptions} />
          ) : undefined
        }
      />
      <div className="flex flex-col gap-6">
        <p className="text-body text-muted-foreground">{m.timeline.intro}</p>
        {ordered.length === 0 ? (
          <EmptyState
            icon={ClockIcon}
            title={m.timeline.emptyTitle}
            description={m.timeline.emptyDescription}
          />
        ) : (
          <>
            <ol
              data-tour="cronograma-linha"
              className="relative flex flex-col gap-4 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[0.6875rem] before:w-0.5 before:bg-border"
            >
              {ordered.map((item) => (
                <li key={item.id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-4 -left-6 size-3.5 rounded-full border-2 border-primary bg-card"
                  />
                  <div
                    className={cn(
                      "flex items-start gap-2 rounded-2xl bg-card p-4",
                      clashing.has(item.id) && "ring-2 ring-warning",
                    )}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-title3 font-bold tracking-tight text-link tabular-nums">
                          {item.ends_at
                            ? m.timeline.range(
                                formatTime(item.starts_at),
                                formatTime(item.ends_at),
                              )
                            : formatTime(item.starts_at)}
                        </span>
                        <NowMarker
                          weddingDate={wedding.wedding_date}
                          items={items}
                          id={item.id}
                        />
                      </span>
                      <span className="text-headline font-semibold">
                        {item.title}
                      </span>
                      <span className="flex flex-wrap gap-x-4 gap-y-1 text-footnote text-muted-foreground">
                        {item.place && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon
                              aria-hidden="true"
                              className="size-3.5"
                            />
                            {item.place}
                          </span>
                        )}
                        {item.responsible && (
                          <span className="flex items-center gap-1">
                            <UserRoundIcon
                              aria-hidden="true"
                              className="size-3.5"
                            />
                            {item.responsible}
                          </span>
                        )}
                        {item.song_id && songTitle.get(item.song_id) && (
                          <span className="flex items-center gap-1">
                            <MusicIcon
                              aria-hidden="true"
                              className="size-3.5"
                            />
                            {songTitle.get(item.song_id)}
                          </span>
                        )}
                      </span>
                      {clashing.has(item.id) && (
                        <StatusBadge icon={TriangleAlertIcon} tone="warning">
                          {m.timeline.clash}
                        </StatusBadge>
                      )}
                      {item.notes && (
                        <p className="text-subhead whitespace-pre-line">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    {editable && (
                      <TimelineSheet item={item} songs={songOptions} />
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <a
              data-tour="cronograma-whatsapp"
              href={`https://wa.me/?text=${encodeURIComponent(m.timeline.shareText(couple, shareLines))}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "w-fit",
              )}
            >
              <MessageCircleIcon aria-hidden="true" className="text-success" />
              {m.timeline.share}
            </a>
          </>
        )}
      </div>
    </>
  );
}
