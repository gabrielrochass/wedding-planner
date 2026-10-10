import { ChevronRightIcon, CompassIcon, RotateCcwIcon } from "lucide-react";
import Link from "next/link";
import { replayPageTours } from "@/lib/actions/tours";
import { m } from "@/lib/i18n";

const row =
  "flex min-h-15 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:-outline-offset-2!";
const swatch =
  "flex size-9 shrink-0 items-center justify-center rounded-lg bg-blush text-link";

export function TourReplay() {
  return (
    <section aria-labelledby="tours" className="flex flex-col gap-2">
      <h2
        id="tours"
        className="px-1 text-footnote font-medium text-muted-foreground"
      >
        {m.tour.section}
      </h2>
      <ul
        data-tour="ajustes-tours"
        className="divide-y overflow-hidden rounded-2xl bg-card"
      >
        <li>
          <Link href="/?tour=geral" className={row}>
            <span className={swatch}>
              <CompassIcon aria-hidden="true" className="size-5" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-body font-medium">
                {m.tour.replayGeneral}
              </span>
              <span className="text-footnote text-muted-foreground">
                {m.tour.replayGeneralHint}
              </span>
            </span>
            <ChevronRightIcon
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
          </Link>
        </li>
        <li>
          <form action={replayPageTours}>
            <button type="submit" className={row}>
              <span className={swatch}>
                <RotateCcwIcon aria-hidden="true" className="size-5" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-body font-medium">
                  {m.tour.replayPages}
                </span>
                <span className="text-footnote text-muted-foreground">
                  {m.tour.replayPagesHint}
                </span>
              </span>
            </button>
          </form>
        </li>
      </ul>
    </section>
  );
}
