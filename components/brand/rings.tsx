import { cn } from "@/lib/utils";

export function Rings({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      aria-hidden="true"
      className={cn("h-8 w-12 text-link", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="round"
    >
      <circle cx="24" cy="20" r="14" pathLength={1} className="ring-stroke" />
      <circle
        cx="40"
        cy="20"
        r="14"
        pathLength={1}
        className="ring-stroke"
        style={{ "--i": 1 } as React.CSSProperties}
      />
    </svg>
  );
}
