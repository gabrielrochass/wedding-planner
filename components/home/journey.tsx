import type { Route } from "next";
import Link from "next/link";
import { m } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { journey } from "@/lib/wedding";

export function Journey({
  steps,
  open,
}: {
  steps: ReturnType<typeof journey>;
  open: Partial<Record<string, number>>;
}) {
  return (
    <section aria-labelledby="jornada" className="flex flex-col gap-3">
      <h2 id="jornada" className="text-headline font-semibold">
        {m.home.journey}
      </h2>
      <ol className="-mx-4 flex snap-x gap-0 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {steps.map((step, index) => {
          const pending = open[step.key] ?? 0;
          return (
            <li
              key={step.key}
              className="relative flex min-w-24 flex-1 snap-start flex-col items-center gap-2"
            >
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-3 right-1/2 h-0.5 w-full",
                    step.state === "upcoming" ? "bg-border" : "bg-primary",
                  )}
                />
              )}
              <Link
                href={`/tarefas#fase-${step.key}` as Route}
                aria-current={step.state === "current" ? "step" : undefined}
                className="relative z-10 flex flex-col items-center gap-2 rounded-lg px-1 text-center"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full border-2 text-caption2 font-bold",
                    step.state === "past" &&
                      "border-primary bg-primary text-primary-foreground",
                    step.state === "current" &&
                      "size-7 border-primary bg-blush text-link ring-4 ring-blush",
                    step.state === "upcoming" &&
                      "border-border bg-card text-muted-foreground",
                  )}
                >
                  {pending > 0 ? pending : ""}
                </span>
                <span
                  className={cn(
                    "text-caption font-medium",
                    step.state === "current"
                      ? "text-link"
                      : "text-muted-foreground",
                  )}
                >
                  {m.journeyShort[step.key]}
                </span>
                {step.state === "current" && (
                  <span className="rounded-full bg-blush px-2 py-0.5 text-caption2 font-semibold text-link">
                    {m.home.journeyCurrent}
                  </span>
                )}
                {pending > 0 && (
                  <span className="sr-only">
                    {m.home.journeyPending(pending)}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
