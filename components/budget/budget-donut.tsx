import { m } from "@/lib/i18n";
import { formatWholeBRL } from "@/lib/money";
import { paletteColors, swatchColor } from "@/lib/palette";

const size = 176;
const stroke = 26;
const radius = (size - stroke) / 2;
const circumference = 2 * Math.PI * radius;
const gap = 2;

export type DonutSlice = { key: string; name: string; cents: number };

export function sliceColor(index: number) {
  return swatchColor(paletteColors[Math.min(index, paletteColors.length - 1)]);
}

export function BudgetDonut({
  slices,
  total,
  caption,
}: {
  slices: DonutSlice[];
  total: number;
  caption: string;
}) {
  let offset = 0;
  const arcs = slices.map((slice, index) => {
    const length = total > 0 ? (slice.cents / total) * circumference : 0;
    const arc = {
      ...slice,
      color: sliceColor(index),
      dash: Math.max(length - (slices.length > 1 ? gap : 0), 0.5),
      offset,
    };
    offset += length;
    return arc;
  });
  const top = slices[0];

  return (
    <figure className="relative mx-auto size-44">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        className="size-full -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        {arcs.map((arc) => (
          <circle
            key={arc.key}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
            strokeDashoffset={-arc.offset}
            stroke={arc.color}
            className="forced-color-adjust-none"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-footnote text-muted-foreground">{caption}</span>
        <span className="text-headline font-semibold tabular-nums">
          {formatWholeBRL(total)}
        </span>
      </div>
      {top && total > 0 && (
        <figcaption className="sr-only">
          {m.budget.donutSummary(
            top.name,
            Math.round((top.cents / total) * 100),
          )}
        </figcaption>
      )}
    </figure>
  );
}
