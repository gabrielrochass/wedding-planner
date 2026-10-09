import {
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  ReceiptIcon,
} from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { EmptyState } from "@/components/app-shell/empty-state";
import { PageHeader } from "@/components/app-shell/page-header";
import { buttonVariants } from "@/components/ui/button";
import { expenseCost, isContracted, summarize } from "@/lib/budget";
import { getBudget } from "@/lib/data";
import { m } from "@/lib/i18n";
import { categoryIcon } from "@/lib/icons";
import { formatWholeBRL } from "@/lib/money";
import { canEdit } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/orcamento/categorias/[id]">): Promise<Metadata> {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return {};
  const { categories } = await getBudget();
  return { title: categories.find((c) => c.id === id)?.name };
}

export default async function CategoryPage({
  params,
}: PageProps<"/orcamento/categorias/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [{ role }, budget] = await Promise.all([requireWedding(), getBudget()]);
  const category = budget.categories.find((c) => c.id === id);
  if (!category) notFound();
  const editable = canEdit(role);
  const { byCategory } = summarize(
    budget.categories,
    budget.expenses,
    budget.payments,
  );
  const totals = byCategory.get(id);
  const expenses = budget.expenses.filter((e) => e.category_id === id);
  const paidByExpense = new Map<string, number>();
  for (const payment of budget.payments) {
    if (!payment.paid_on) continue;
    paidByExpense.set(
      payment.expense_id,
      (paidByExpense.get(payment.expense_id) ?? 0) + payment.amount_cents,
    );
  }
  const Icon = categoryIcon(category.icon);

  return (
    <>
      <PageHeader
        title={category.name}
        back={{ href: "/orcamento", label: m.budget.title }}
        action={
          editable ? (
            <Link
              href={`/orcamento/categorias/${id}/editar` as Route}
              aria-label={m.budget.editCategory}
              className={buttonVariants({
                size: "icon-lg",
                variant: "secondary",
              })}
            >
              <PencilIcon aria-hidden="true" className="size-5" />
            </Link>
          ) : undefined
        }
      />
      <div className="flex flex-col gap-6">
        <section className="flex items-center gap-4 rounded-3xl bg-card p-5">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blush text-link">
            <Icon aria-hidden="true" className="size-7" />
          </span>
          <dl className="grid flex-1 grid-cols-3 gap-3">
            {[
              [m.budget.planned, category.planned_cents ?? 0],
              [m.budget.committed, totals?.committed ?? 0],
              [m.budget.paid, totals?.paid ?? 0],
            ].map(([label, cents]) => (
              <div key={label} className="flex flex-col">
                <dt className="text-footnote text-muted-foreground">{label}</dt>
                <dd className="text-headline font-semibold tabular-nums">
                  {formatWholeBRL(cents as number)}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="gastos" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 id="gastos" className="text-headline font-semibold">
              {m.budget.expenses}
            </h2>
            {editable && (
              <Link
                href={`/orcamento/gastos/novo?categoria=${id}` as Route}
                className="flex min-h-11 items-center gap-1 text-subhead font-medium text-link"
              >
                <PlusIcon aria-hidden="true" className="size-4" />
                {m.budget.newExpense}
              </Link>
            )}
          </div>
          {expenses.length === 0 ? (
            <EmptyState
              icon={ReceiptIcon}
              title={m.budget.noExpenses}
              description={m.budget.emptyDescription}
            />
          ) : (
            <ul className="divide-y overflow-hidden rounded-2xl bg-card">
              {expenses.map((expense) => {
                const cost = expenseCost(expense);
                const paid = paidByExpense.get(expense.id) ?? 0;
                return (
                  <li key={expense.id}>
                    <Link
                      href={`/orcamento/gastos/${expense.id}` as Route}
                      className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-body font-medium">
                            {expense.title}
                          </span>
                          <span className="shrink-0 text-body font-semibold tabular-nums">
                            {formatWholeBRL(cost)}
                          </span>
                        </span>
                        <span className="flex items-center justify-between gap-2 text-footnote text-muted-foreground">
                          <span>
                            {isContracted(expense)
                              ? m.budget.contracted
                              : m.budget.estimated}
                          </span>
                          <span className="tabular-nums">
                            {m.common.of(
                              formatWholeBRL(paid),
                              formatWholeBRL(cost),
                            )}
                          </span>
                        </span>
                        {cost > 0 && (
                          <span
                            aria-hidden="true"
                            className="h-1.5 overflow-hidden rounded-full bg-muted"
                          >
                            <span
                              className={cn(
                                "block h-full rounded-full",
                                paid >= cost ? "bg-success" : "bg-primary",
                              )}
                              style={{
                                width: `${Math.min(paid / cost, 1) * 100}%`,
                              }}
                            />
                          </span>
                        )}
                      </span>
                      <ChevronRightIcon
                        aria-hidden="true"
                        className="size-5 shrink-0 text-muted-foreground"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
