import {
  CircleCheckIcon,
  ExternalLinkIcon,
  LightbulbIcon,
  PlusIcon,
} from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/app-shell/empty-state";
import { PageHeader } from "@/components/app-shell/page-header";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getIdeas } from "@/lib/data";
import { m } from "@/lib/i18n";
import { boardSummary, type IdeaBoard, ideaBoards } from "@/lib/ideas";
import { formatWholeBRL } from "@/lib/money";
import { canHelp } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: m.ideas.title };

const tints = [
  "from-chart-5/30",
  "from-chart-2/30",
  "from-chart-3/30",
  "from-chart-1/30",
];

export default async function IdeasPage({
  searchParams,
}: PageProps<"/ideias">) {
  const raw = (await searchParams).quadro;
  const board = ideaBoards.includes(raw as IdeaBoard)
    ? (raw as IdeaBoard)
    : null;
  const [{ role }, ideas] = await Promise.all([requireWedding(), getIdeas()]);
  const editable = canHelp(role);
  const summary = boardSummary(ideas);
  const visible = ideas.filter((idea) => !board || idea.board === board);
  const approved = [...summary.values()].reduce(
    (sum, row) => sum + row.estimate,
    0,
  );

  return (
    <>
      <PageHeader
        title={m.ideas.title}
        action={
          editable ? (
            <Link
              href={
                (board
                  ? `/ideias/nova?quadro=${board}`
                  : "/ideias/nova") as Route
              }
              aria-label={m.ideas.newIdea}
              className={buttonVariants({
                size: "icon-lg",
                variant: "secondary",
              })}
            >
              <PlusIcon aria-hidden="true" className="size-6" />
            </Link>
          ) : undefined
        }
      />
      <div className="flex flex-col gap-6">
        <p className="text-body text-muted-foreground">{m.ideas.intro}</p>
        {approved > 0 && (
          <p className="w-fit rounded-full bg-blush px-4 py-2 text-subhead font-semibold text-link tabular-nums">
            {m.ideas.approvedTotal(formatWholeBRL(approved))}
          </p>
        )}
        <nav
          aria-label={m.ideas.board}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
        >
          {[null, ...ideaBoards].map((key) => {
            const count = key ? (summary.get(key)?.count ?? 0) : ideas.length;
            return (
              <Link
                key={key ?? "todos"}
                href={(key ? `/ideias?quadro=${key}` : "/ideias") as Route}
                aria-current={board === key ? "page" : undefined}
                className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-secondary px-4 text-subhead font-medium aria-[current=page]:bg-foreground aria-[current=page]:text-background"
              >
                {key ? m.boards[key] : m.ideas.allBoards}
                <span className="text-footnote opacity-70 tabular-nums">
                  {count}
                </span>
              </Link>
            );
          })}
        </nav>
        {visible.length === 0 ? (
          <EmptyState
            icon={LightbulbIcon}
            title={m.ideas.emptyTitle}
            description={m.ideas.emptyDescription}
            action={
              editable ? (
                <Link
                  href={
                    (board
                      ? `/ideias/nova?quadro=${board}`
                      : "/ideias/nova") as Route
                  }
                  className={buttonVariants({ size: "lg" })}
                >
                  <PlusIcon aria-hidden="true" />
                  {m.ideas.newIdea}
                </Link>
              ) : undefined
            }
          />
        ) : (
          <ul className="columns-2 gap-3 sm:columns-3">
            {visible.map((idea, index) => (
              <li key={idea.id} className="mb-3 break-inside-avoid">
                <article
                  className={cn(
                    "relative overflow-hidden rounded-2xl bg-card shadow-xs",
                    idea.status === "discarded" && "opacity-60",
                  )}
                >
                  <Link
                    href={`/ideias/${idea.id}` as Route}
                    className="flex flex-col"
                  >
                    {idea.image_url ? (
                      // biome-ignore lint/performance/noImgElement: signed URLs from private storage
                      <img
                        src={idea.image_url}
                        alt=""
                        loading="lazy"
                        className="w-full bg-muted object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex aspect-[4/3] items-center justify-center bg-linear-to-br to-card font-display text-hero text-link/70",
                          tints[index % tints.length],
                        )}
                      >
                        {idea.title.charAt(0)}
                      </span>
                    )}
                    <span className="flex flex-col gap-1 p-3">
                      <span className="text-subhead font-semibold">
                        {idea.title}
                      </span>
                      <span className="text-caption text-muted-foreground">
                        {m.boards[idea.board as IdeaBoard]}
                      </span>
                      {idea.status === "approved" && (
                        <StatusBadge
                          icon={CircleCheckIcon}
                          tone="success"
                          className="text-caption"
                        >
                          {m.ideaStatus.approved}
                          {idea.estimate_cents
                            ? `, ${formatWholeBRL(idea.estimate_cents)}`
                            : ""}
                        </StatusBadge>
                      )}
                      {idea.status === "discarded" && (
                        <span className="text-caption text-muted-foreground">
                          {m.ideaStatus.discarded}
                        </span>
                      )}
                    </span>
                  </Link>
                  {idea.url && (
                    <a
                      href={idea.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={m.ideas.openLink(idea.title)}
                      className="absolute top-2 right-2 flex size-11 items-center justify-center rounded-full bg-card/90 text-link shadow-sm backdrop-blur"
                    >
                      <ExternalLinkIcon aria-hidden="true" className="size-4" />
                    </a>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
