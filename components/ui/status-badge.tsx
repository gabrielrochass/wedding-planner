import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  success: "text-success",
  danger: "text-danger",
  warning: "text-warning",
  muted: "text-muted-foreground",
  brand: "text-link",
} as const;

export type Tone = keyof typeof tones;

export function StatusBadge({
  icon: Icon,
  tone,
  children,
  className,
}: {
  icon: LucideIcon;
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-footnote font-medium",
        tones[tone],
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className="size-3.5 shrink-0"
        strokeWidth={2.25}
      />
      {children}
    </span>
  );
}
