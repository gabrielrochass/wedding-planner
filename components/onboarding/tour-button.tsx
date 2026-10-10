"use client";

import { CircleHelpIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { m } from "@/lib/i18n";
import { tourForPath } from "@/lib/tour";
import { cn } from "@/lib/utils";

export function TourButton() {
  const pathname = usePathname();
  if (!tourForPath(pathname)) return null;

  return (
    <Link
      href={`${pathname}?tour=1` as Route}
      scroll={false}
      aria-label={m.tour.help}
      data-tour="ajuda"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon-lg" }),
        "text-link",
      )}
    >
      <CircleHelpIcon aria-hidden="true" className="size-6" />
    </Link>
  );
}
