import { ChevronLeftIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { TourButton } from "@/components/onboarding/tour-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { moreNav } from "./nav-items";

export function PageHeader({
  title,
  back,
  action,
}: {
  title: string;
  back?: { href: Route; label: string };
  action?: React.ReactNode;
}) {
  const MoreIcon = moreNav.icon;
  return (
    <header className="flex flex-col gap-1 pb-6">
      {back && (
        <Link
          href={back.href}
          className="-ml-1 flex w-fit min-h-11 items-center gap-0.5 text-body text-link"
        >
          <ChevronLeftIcon aria-hidden="true" className="size-5" />
          {back.label}
        </Link>
      )}
      <div className="flex items-center justify-between gap-4">
        <h1 className="min-w-0 text-large-title font-bold tracking-tight">
          {title}
        </h1>
        <div className="flex shrink-0 items-center gap-1">
          <TourButton />
          {action && <div data-tour="novo">{action}</div>}
          {!back && !action && (
            <Link
              href={moreNav.href}
              aria-label={moreNav.label}
              data-tour="mais"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-lg" }),
                "md:hidden",
              )}
            >
              <MoreIcon aria-hidden="true" className="size-6" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
