import { cn } from "@/lib/utils";

export function StepDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <span aria-hidden="true" className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed positions
          key={index}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            index === current
              ? "w-6 bg-primary"
              : index < current
                ? "w-1.5 bg-primary/60"
                : "w-1.5 bg-muted-foreground/25",
          )}
        />
      ))}
    </span>
  );
}
