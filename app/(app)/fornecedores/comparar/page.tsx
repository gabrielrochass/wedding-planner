import { CheckIcon, StarIcon, TrophyIcon } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { z } from "zod";
import { PageHeader } from "@/components/app-shell/page-header";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getBudget, getVendors } from "@/lib/data";
import { formatDate, todayInSaoPaulo } from "@/lib/dates";
import { m } from "@/lib/i18n";
import { formatWholeBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import { cheapestQuote, comparable } from "@/lib/vendors";

export const metadata: Metadata = { title: m.vendors.compare };

export default async function ComparePage({
  searchParams,
}: PageProps<"/fornecedores/comparar">) {
  const raw = (await searchParams).categoria;
  const [vendors, { categories }] = await Promise.all([
    getVendors(),
    getBudget(),
  ]);
  const withVendors = categories.filter((c) =>
    vendors.some((v) => v.category_id === c.id && v.status !== "discarded"),
  );
  const parsed = z.uuid().safeParse(raw);
  const selected =
    (parsed.success && withVendors.find((c) => c.id === parsed.data)) ||
    withVendors[0] ||
    null;
  const list = selected ? comparable(vendors, selected.id) : [];
  const best = cheapestQuote(list);
  const today = todayInSaoPaulo();

  return (
    <>
      <PageHeader
        title={
          selected ? m.vendors.compareTitle(selected.name) : m.vendors.compare
        }
        back={{ href: "/fornecedores", label: m.vendors.title }}
      />
      <div className="flex flex-col gap-6">
        <p className="text-subhead text-muted-foreground">
          {m.vendors.compareHint}
        </p>
        <nav
          aria-label={m.vendors.category}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
        >
          {withVendors.map((category) => (
            <Link
              key={category.id}
              href={`/fornecedores/comparar?categoria=${category.id}` as Route}
              aria-current={category.id === selected?.id ? "page" : undefined}
              className="flex min-h-11 shrink-0 items-center rounded-full bg-secondary px-4 text-subhead font-medium aria-[current=page]:bg-foreground aria-[current=page]:text-background"
            >
              {category.name}
            </Link>
          ))}
        </nav>
        {list.length === 0 ? (
          <p className="rounded-2xl bg-card px-4 py-8 text-center text-subhead text-muted-foreground">
            {m.vendors.compareEmpty}
          </p>
        ) : (
          <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4">
            {list.map((vendor) => {
              const cheapest = vendor.id === best;
              return (
                <li
                  key={vendor.id}
                  className={cn(
                    "flex w-64 shrink-0 snap-start flex-col gap-4 rounded-2xl bg-card p-4",
                    cheapest && "ring-2 ring-success",
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-headline font-semibold">
                      {vendor.name}
                    </span>
                    <span className="text-footnote text-muted-foreground">
                      {m.vendorStatus[vendor.status]}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-title2 font-bold tabular-nums">
                      {vendor.quote_cents
                        ? formatWholeBRL(vendor.quote_cents)
                        : "-"}
                    </span>
                    {cheapest && (
                      <StatusBadge icon={TrophyIcon} tone="success">
                        {m.vendors.cheapest}
                      </StatusBadge>
                    )}
                  </div>
                  <dl className="flex flex-col gap-2 text-subhead">
                    {vendor.rating && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted-foreground">
                          {m.vendors.rating}
                        </dt>
                        <dd className="flex items-center gap-1">
                          <StarIcon
                            aria-hidden="true"
                            className="size-4 fill-chart-2 text-chart-2"
                          />
                          {m.vendors.ratingValue(vendor.rating)}
                        </dd>
                      </div>
                    )}
                    {vendor.capacity && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted-foreground">
                          {m.vendors.capacity}
                        </dt>
                        <dd className="tabular-nums">
                          {m.vendors.capacityValue(vendor.capacity)}
                        </dd>
                      </div>
                    )}
                    {vendor.visit_on && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted-foreground">
                          {m.vendors.visitOn}
                        </dt>
                        <dd>{formatDate(vendor.visit_on, today)}</dd>
                      </div>
                    )}
                  </dl>
                  {vendor.quote_details && (
                    <div className="flex flex-col gap-1">
                      <span className="text-footnote font-medium text-muted-foreground">
                        {m.vendors.quoteDetails}
                      </span>
                      <ul className="flex flex-col gap-1">
                        {vendor.quote_details
                          .split(/\r?\n|,/)
                          .map((item) => item.trim())
                          .filter(Boolean)
                          .slice(0, 8)
                          .map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-1.5 text-subhead"
                            >
                              <CheckIcon
                                aria-hidden="true"
                                className="mt-0.5 size-4 shrink-0 text-success"
                              />
                              {item}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                  <Link
                    href={
                      `/fornecedores/${vendor.id}${vendor.status === "hired" ? "" : "#contratar"}` as Route
                    }
                    className={cn(
                      buttonVariants({
                        size: "lg",
                        variant:
                          vendor.status === "hired" ? "secondary" : "default",
                      }),
                      "mt-auto",
                    )}
                  >
                    {vendor.status === "hired"
                      ? m.vendors.hiredBadge
                      : m.vendors.hire}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
