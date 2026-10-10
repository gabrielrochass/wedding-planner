import { ChevronRightIcon, CircleAlertIcon, FlagIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { m } from "@/lib/i18n";
import type { phaseStatus } from "@/lib/wedding";

export function PhaseCard({
  status,
}: {
  status: NonNullable<ReturnType<typeof phaseStatus>>;
}) {
  const { current, done, total, behind, next, nextIn } = status;

  return (
    <section
      aria-labelledby="fase-atual"
      className="flex min-w-0 flex-col gap-4 rounded-2xl bg-card p-4 sm:p-5"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blush text-link">
          <FlagIcon aria-hidden="true" className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col">
          <p className="text-footnote font-medium text-muted-foreground">
            {m.home.phase}
          </p>
          <h2 id="fase-atual" className="text-title3 font-semibold">
            {m.phases[current]}
          </h2>
        </div>
      </div>

      {total > 0 ? (
        <div className="flex flex-col gap-2">
          <span
            aria-hidden="true"
            className="h-2 overflow-hidden rounded-full bg-muted"
          >
            <span
              className="block h-full origin-left animate-grow-x rounded-full bg-primary"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </span>
          <p className="text-subhead tabular-nums">
            {m.home.phaseTasks(done, total)}
          </p>
        </div>
      ) : (
        <p className="text-subhead text-muted-foreground">
          {m.home.phaseEmpty}
        </p>
      )}

      {behind > 0 && (
        <p className="flex items-center gap-2 text-subhead">
          <CircleAlertIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-warning"
          />
          {m.home.phaseBehind(behind)}
        </p>
      )}

      {next && nextIn !== null && (
        <p className="text-footnote text-muted-foreground">
          {m.home.phaseNext(m.phases[next], nextIn)}
        </p>
      )}

      <Link
        href={`/tarefas#fase-${current}` as Route}
        className="-mx-1 flex min-h-11 w-fit items-center gap-0.5 px-1 text-subhead font-medium text-link"
      >
        {m.home.phaseMore}
        <ChevronRightIcon aria-hidden="true" className="size-4" />
      </Link>
    </section>
  );
}
