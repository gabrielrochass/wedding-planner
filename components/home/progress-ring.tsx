const size = 120;
const stroke = 10;
const radius = (size - stroke) / 2;
const circumference = 2 * Math.PI * radius;

export function ProgressRing({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const percent = Math.round(value * 100);
  return (
    <div className="relative size-28 shrink-0">
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value)}
          className="stroke-primary transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-title2 font-bold tabular-nums">{percent}%</span>
        <span className="text-caption text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
