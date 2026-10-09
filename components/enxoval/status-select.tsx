"use client";

import {
  CircleCheckIcon,
  CircleDashedIcon,
  GiftIcon,
  HeartIcon,
} from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toast } from "@/components/ui/toast";
import { setHomeStatus } from "@/lib/actions/home";
import { attempt, failed } from "@/lib/attempt";
import { type HomeStatus, homeStatuses } from "@/lib/home";
import { m } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const statusLook: Record<
  HomeStatus,
  { icon: typeof GiftIcon; className: string; iconClass: string }
> = {
  missing: {
    icon: CircleDashedIcon,
    className: "bg-secondary text-secondary-foreground",
    iconClass: "",
  },
  wishlist: { icon: HeartIcon, className: "bg-blush text-link", iconClass: "" },
  bought: {
    icon: CircleCheckIcon,
    className: "bg-success/10 text-foreground",
    iconClass: "text-success",
  },
  gifted: {
    icon: GiftIcon,
    className: "bg-chart-2/20 text-foreground",
    iconClass: "",
  },
};

export function HomeStatusSelect({
  id,
  name,
  status,
  disabled,
}: {
  id: string;
  name: string;
  status: HomeStatus;
  disabled: boolean;
}) {
  const [current, setCurrent] = useOptimistic(status);
  const [, startTransition] = useTransition();
  const { icon: Icon, className, iconClass } = statusLook[current];

  return (
    <span
      className={cn(
        "relative inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full pr-3 pl-3 text-footnote font-semibold",
        className,
      )}
    >
      <Icon aria-hidden="true" className={cn("size-4", iconClass)} />
      <select
        aria-label={m.enxoval.markAs(name)}
        value={current}
        disabled={disabled}
        onChange={(event) => {
          const next = event.target.value as HomeStatus;
          startTransition(async () => {
            setCurrent(next);
            const result = await attempt(setHomeStatus(id, next), failed);
            toast.add(
              result.ok
                ? { title: m.enxoval.marked(name, m.homeStatus[next]) }
                : { title: result.message ?? m.common.tryAgain, type: "error" },
            );
          });
        }}
        className="appearance-none bg-transparent pr-1 text-footnote font-semibold outline-none disabled:opacity-60"
      >
        {homeStatuses.map((key) => (
          <option key={key} value={key}>
            {m.homeStatus[key]}
          </option>
        ))}
      </select>
    </span>
  );
}
