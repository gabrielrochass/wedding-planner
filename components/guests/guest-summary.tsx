import type { headcount } from "@/lib/guests";
import { ageBands } from "@/lib/guests";
import { m } from "@/lib/i18n";

export function GuestSummary({
  count,
  partnerA,
  partnerB,
}: {
  count: ReturnType<typeof headcount>;
  partnerA: string;
  partnerB: string;
}) {
  const steps = [
    [m.guests.funnelListed, count.funnel.listed],
    [m.guests.funnelSaveTheDate, count.funnel.saveTheDate],
    [m.guests.funnelInvited, count.funnel.invited],
    [m.guests.funnelAnswered, count.funnel.answered],
  ] as const;
  const top = Math.max(count.funnel.listed, 1);
  const sides = [
    [m.guests.sideOf(partnerA), count.bySide.a, "bg-chart-1"],
    [m.guests.sideOf(partnerB), count.bySide.b, "bg-chart-5"],
    [m.guests.sideBoth, count.bySide.both, "bg-chart-3"],
  ] as const;
  const sideTotal = Math.max(
    count.bySide.a + count.bySide.b + count.bySide.both,
    1,
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <section
        data-tour="convidados-funil"
        aria-labelledby="funil"
        className="flex flex-col gap-3 rounded-2xl bg-card p-4"
      >
        <h2 id="funil" className="text-headline font-semibold">
          {m.guests.funnel}
        </h2>
        <ol className="flex flex-col gap-2">
          {steps.map(([label, value]) => (
            <li key={label} className="flex flex-col gap-1">
              <span className="flex items-baseline justify-between text-subhead">
                <span>{label}</span>
                <span className="font-semibold tabular-nums">{value}</span>
              </span>
              <span
                aria-hidden="true"
                className="h-2 overflow-hidden rounded-full bg-muted"
              >
                <span
                  className="block h-full origin-left animate-grow-x rounded-full bg-primary"
                  style={{ width: `${(value / top) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section
        data-tour="convidados-numeros"
        aria-labelledby="numeros"
        className="flex flex-col gap-4 rounded-2xl bg-card p-4"
      >
        <h2 id="numeros" className="sr-only">
          {m.guests.title}
        </h2>
        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            [m.guests.expected, count.expectedGuests, "text-foreground"],
            [m.guests.confirmed, count.rsvp.yes, "text-success"],
            [m.guests.declined, count.rsvp.no, "text-danger"],
          ].map(([label, value, tone]) => (
            <div
              key={label as string}
              className="flex flex-col rounded-xl bg-background py-2"
            >
              <dt className="text-caption text-muted-foreground">{label}</dt>
              <dd className={`text-title2 font-bold tabular-nums ${tone}`}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-2">
          <span className="text-footnote font-medium text-muted-foreground">
            {m.guests.sides}
          </span>
          <div
            aria-hidden="true"
            className="flex h-3 overflow-hidden rounded-full bg-muted"
          >
            {sides.map(([label, value, color]) => (
              <span
                key={label}
                className={color}
                style={{ width: `${(value / sideTotal) * 100}%` }}
              />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-footnote">
            {sides.map(([label, value, color]) => (
              <li key={label} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={`size-2.5 rounded-full ${color}`}
                />
                {label}:{" "}
                <span className="font-semibold tabular-nums">{value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-footnote font-medium text-muted-foreground">
            {m.guests.bands}
          </span>
          <ul className="grid grid-cols-4 gap-2 text-center">
            {ageBands.map((band) => (
              <li
                key={band}
                className="flex flex-col rounded-xl bg-background py-1.5"
              >
                <span className="text-headline font-semibold tabular-nums">
                  {count.bands[band]}
                </span>
                <span className="text-caption2 text-muted-foreground">
                  {m.ageBandsPlural[band]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
