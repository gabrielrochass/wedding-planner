import {
  CalendarHeartIcon,
  CheckIcon,
  ListChecksIcon,
  MailIcon,
  PartyPopperIcon,
  SendIcon,
  StoreIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { m } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { MilestoneKey, milestones } from "@/lib/wedding";

const icons: Record<MilestoneKey, typeof CheckIcon> = {
  date: CalendarHeartIcon,
  firstVendor: StoreIcon,
  guestList: UsersIcon,
  saveTheDate: MailIcon,
  halfChecklist: ListChecksIcon,
  invites: SendIcon,
  halfConfirmed: PartyPopperIcon,
  allPaid: WalletIcon,
};

export function Milestones({
  items,
}: {
  items: ReturnType<typeof milestones>;
}) {
  const count = items.filter((item) => item.reached).length;
  return (
    <section aria-labelledby="conquistas" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="conquistas" className="text-headline font-semibold">
          {m.home.milestones}
        </h2>
        <span className="text-footnote text-muted-foreground tabular-nums">
          {count}/{items.length}
        </span>
      </div>
      <ul className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {items.map(({ key, reached }) => {
          const Icon = icons[key];
          return (
            <li
              key={key}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <span
                className={cn(
                  "relative flex size-12 items-center justify-center rounded-full",
                  reached
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border-2 border-dashed border-border text-muted-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
                {reached && (
                  <span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border-2 border-background bg-success text-card">
                    <CheckIcon
                      aria-hidden="true"
                      className="size-3"
                      strokeWidth={3}
                    />
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-caption2 leading-tight",
                  reached ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {m.milestones[key]}
                <span className="sr-only">
                  {`: ${reached ? m.home.milestoneReached : m.home.milestonePending}`}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
