"use client";

import { BadgeCheckIcon, StarIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/components/ui/toast";
import { moveVendor } from "@/lib/actions/vendors";
import { attempt, failed } from "@/lib/attempt";
import type { Vendor } from "@/lib/data";
import { m } from "@/lib/i18n";
import { formatWholeBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import { type VendorStatus, vendorStatuses } from "@/lib/vendors";

const accents: Record<VendorStatus, string> = {
  researching: "bg-chart-other",
  quoted: "bg-chart-1",
  visiting: "bg-chart-2",
  favorite: "bg-chart-5",
  hired: "bg-success",
  discarded: "bg-muted-foreground/40",
};

export function VendorBoard({
  vendors,
  categories,
  editable,
}: {
  vendors: Vendor[];
  categories: Record<string, string>;
  editable: boolean;
}) {
  const [items, move] = useOptimistic(
    vendors,
    (current, change: { id: string; status: VendorStatus }) =>
      current.map((vendor) =>
        vendor.id === change.id ? { ...vendor, status: change.status } : vendor,
      ),
  );
  const [, startTransition] = useTransition();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<VendorStatus | null>(null);

  function change(vendor: Vendor, status: VendorStatus) {
    if (vendor.status === status) return;
    startTransition(async () => {
      move({ id: vendor.id, status });
      const result = await attempt(moveVendor(vendor.id, status), failed);
      toast.add(
        result.ok
          ? { title: m.vendors.moved(vendor.name, m.vendorStatus[status]) }
          : { title: result.message ?? m.common.tryAgain, type: "error" },
      );
    });
  }

  return (
    <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
      {vendorStatuses.map((status) => {
        const column = items.filter((vendor) => vendor.status === status);
        return (
          <section
            key={status}
            aria-labelledby={`coluna-${status}`}
            onDragOver={(event) => {
              if (!dragging) return;
              event.preventDefault();
              setOver(status);
            }}
            onDragLeave={() =>
              setOver((current) => (current === status ? null : current))
            }
            onDrop={(event) => {
              event.preventDefault();
              const vendor = items.find((item) => item.id === dragging);
              setDragging(null);
              setOver(null);
              if (vendor) change(vendor, status);
            }}
            className={cn(
              "flex w-72 shrink-0 snap-start flex-col gap-2 rounded-2xl bg-muted/60 p-2 transition-colors",
              over === status && "bg-blush ring-2 ring-primary",
            )}
          >
            <h2
              id={`coluna-${status}`}
              className="flex items-center gap-2 px-2 pt-1 text-subhead font-semibold"
            >
              <span
                aria-hidden="true"
                className={cn("size-2.5 rounded-full", accents[status])}
              />
              {m.vendorStatus[status]}
              <span className="ml-auto text-footnote font-normal text-muted-foreground tabular-nums">
                {column.length}
              </span>
            </h2>
            {column.length === 0 ? (
              <p className="rounded-xl border-2 border-dashed border-border px-3 py-6 text-center text-footnote text-muted-foreground">
                {m.vendors.columnEmpty}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {column.map((vendor) => (
                  <li
                    key={vendor.id}
                    draggable={editable}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      setDragging(vendor.id);
                    }}
                    onDragEnd={() => {
                      setDragging(null);
                      setOver(null);
                    }}
                    className={cn(
                      "flex flex-col gap-2 rounded-xl bg-card p-3 shadow-xs",
                      editable && "cursor-grab active:cursor-grabbing",
                      dragging === vendor.id && "opacity-50",
                    )}
                  >
                    <Link
                      href={`/fornecedores/${vendor.id}` as Route}
                      className="flex flex-col gap-1"
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-body font-medium">
                          {vendor.name}
                        </span>
                        {vendor.status === "hired" && (
                          <BadgeCheckIcon
                            aria-hidden="true"
                            className="size-5 shrink-0 text-success"
                          />
                        )}
                      </span>
                      {vendor.category_id && categories[vendor.category_id] && (
                        <span className="text-footnote text-muted-foreground">
                          {categories[vendor.category_id]}
                        </span>
                      )}
                      <span className="flex items-center justify-between gap-2">
                        {vendor.quote_cents ? (
                          <span className="text-subhead font-semibold tabular-nums">
                            {formatWholeBRL(vendor.quote_cents)}
                          </span>
                        ) : (
                          <span />
                        )}
                        {vendor.rating && (
                          <span className="flex items-center gap-0.5 text-footnote text-muted-foreground">
                            <StarIcon
                              aria-hidden="true"
                              className="size-3.5 fill-chart-2 text-chart-2"
                            />
                            {m.vendors.ratingValue(vendor.rating)}
                          </span>
                        )}
                      </span>
                    </Link>
                    {editable && (
                      <NativeSelect
                        aria-label={m.vendors.moveMenu(vendor.name)}
                        value={vendor.status}
                        onChange={(event) =>
                          change(vendor, event.target.value as VendorStatus)
                        }
                        className="h-11 bg-background text-subhead"
                      >
                        {vendorStatuses.map((option) => (
                          <option key={option} value={option}>
                            {m.vendors.moveTo}: {m.vendorStatus[option]}
                          </option>
                        ))}
                      </NativeSelect>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
