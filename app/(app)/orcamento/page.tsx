import {
  ChevronRightIcon,
  CircleAlertIcon,
  PencilIcon,
  PlusIcon,
  WalletIcon,
} from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/app-shell/empty-state";
import { PageHeader } from "@/components/app-shell/page-header";
import { BudgetDonut, sliceColor } from "@/components/budget/budget-donut";
import { ContributorSheet } from "@/components/budget/contributor-sheet";
import { PaymentBadge } from "@/components/budget/payment-badge";
import { buttonVariants } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  contingencyCents,
  contributorTotals,
  monthlySaving,
  paymentState,
  perGuest,
  remainingBudget,
  summarize,
  upcomingPayments,
} from "@/lib/budget";
import { getBudget, getGuests } from "@/lib/data";
import { formatDate, todayInSaoPaulo } from "@/lib/dates";
import { headcount } from "@/lib/guests";
import { m } from "@/lib/i18n";
import { categoryIcon } from "@/lib/icons";
import { formatWholeBRL } from "@/lib/money";
import { canEdit } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: m.budget.title };

function Figure({
  label,
  cents,
  tone,
}: {
  label: string;
  cents: number;
  tone?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-footnote text-muted-foreground">{label}</dt>
      <dd className={cn("text-title3 font-semibold tabular-nums", tone)}>
        <Money cents={cents} whole />
      </dd>
    </div>
  );
}

export default async function BudgetPage() {
  const [{ wedding, role }, budget, { households, guests }] = await Promise.all(
    [requireWedding(), getBudget(), getGuests()],
  );
  const today = todayInSaoPaulo();
  const editable = canEdit(role);
  const { byCategory, total } = summarize(
    budget.categories,
    budget.expenses,
    budget.payments,
  );
  const toPay = total.committed - total.paid;
  const remaining = remainingBudget(
    wedding.budget_cents,
    wedding.contingency_percent,
    total.committed,
  );
  const reserve = wedding.budget_cents
    ? contingencyCents(wedding.budget_cents, wedding.contingency_percent)
    : 0;
  const count = headcount(households, guests);
  const guestsForCost = count.expectedGuests || wedding.guest_estimate || 0;
  const costPerGuest = perGuest(total.committed, guestsForCost);
  const saving = monthlySaving(toPay, wedding.wedding_date, today);

  const ranked = budget.categories
    .map((category) => ({ category, totals: byCategory.get(category.id) }))
    .filter((row) => (row.totals?.committed ?? 0) > 0)
    .toSorted(
      (a, b) => (b.totals?.committed ?? 0) - (a.totals?.committed ?? 0),
    );
  const slices = [
    ...ranked.slice(0, 5).map(({ category, totals }) => ({
      key: category.id,
      name: category.name,
      cents: totals?.committed ?? 0,
    })),
    ...(ranked.length > 5
      ? [
          {
            key: "outras",
            name: m.budget.categories,
            cents: ranked
              .slice(5)
              .reduce((sum, row) => sum + (row.totals?.committed ?? 0), 0),
          },
        ]
      : []),
  ];
  const colorOf = new Map(
    slices.map((slice, index) => [slice.key, sliceColor(index)]),
  );
  const next = upcomingPayments(budget.payments, 5);
  const expenseTitle = new Map(budget.expenses.map((e) => [e.id, e.title]));
  const contributors = contributorTotals(budget.contributors, budget.payments);

  return (
    <>
      <PageHeader
        title={m.budget.title}
        action={
          editable ? (
            <Link
              href="/orcamento/gastos/novo"
              aria-label={m.budget.newExpense}
              className={buttonVariants({
                size: "icon-lg",
                variant: "secondary",
              })}
            >
              <PlusIcon aria-hidden="true" className="size-6" />
            </Link>
          ) : undefined
        }
      />
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-5 rounded-3xl bg-card p-5 sm:flex-row sm:items-center sm:gap-8">
          <BudgetDonut
            slices={slices}
            total={total.committed}
            caption={m.budget.committed}
          />
          <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-2 flex flex-col gap-0.5">
              <dt className="text-footnote text-muted-foreground">
                {m.budget.total}
              </dt>
              <dd className="flex items-baseline gap-2">
                <span className="text-title1 font-bold tabular-nums">
                  {wedding.budget_cents
                    ? formatWholeBRL(wedding.budget_cents)
                    : m.budget.noTotal}
                </span>
                {editable && (
                  <Link
                    href="/ajustes/casamento"
                    aria-label={m.budget.settings}
                    className={buttonVariants({
                      size: "icon",
                      variant: "ghost",
                    })}
                  >
                    <PencilIcon aria-hidden="true" />
                  </Link>
                )}
              </dd>
            </div>
            <Figure
              label={m.budget.paid}
              cents={total.paid}
              tone="text-success"
            />
            <Figure label={m.budget.toPay} cents={toPay} />
            {remaining !== null && (
              <Figure
                label={remaining < 0 ? m.budget.over : m.budget.remaining}
                cents={Math.abs(remaining)}
                tone={remaining < 0 ? "text-danger" : "text-link"}
              />
            )}
            {reserve > 0 && (
              <Figure
                label={m.budget.reserve(wedding.contingency_percent)}
                cents={reserve}
              />
            )}
            {costPerGuest !== null && (
              <Figure label={m.budget.perGuest} cents={costPerGuest} />
            )}
            {saving !== null && (
              <div className="col-span-2 rounded-xl bg-blush px-3 py-2">
                <dt className="text-footnote text-muted-foreground">
                  {m.budget.saveMonthly}
                </dt>
                <dd className="text-headline font-semibold text-link tabular-nums">
                  {m.budget.saveMonthlyValue(formatWholeBRL(saving))}
                </dd>
              </div>
            )}
          </dl>
        </section>
        {!wedding.budget_cents && (
          <p className="-mt-4 text-footnote text-muted-foreground">
            {m.budget.noTotalHint}
          </p>
        )}

        {next.length > 0 && (
          <section aria-labelledby="pagamentos" className="flex flex-col gap-3">
            <h2 id="pagamentos" className="text-headline font-semibold">
              {m.home.payments}
            </h2>
            <ul className="divide-y overflow-hidden rounded-2xl bg-card">
              {next.map((payment) => (
                <li key={payment.id}>
                  <Link
                    href={`/orcamento/gastos/${payment.expense_id}` as Route}
                    className="flex min-h-14 items-center gap-3 px-4 py-2 transition-colors hover:bg-muted/60"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-body">
                        {expenseTitle.get(payment.expense_id)}
                      </span>
                      <PaymentBadge
                        state={paymentState(payment, today)}
                        label={m.budget.dueLabel(
                          formatDate(payment.due_on, today),
                        )}
                      />
                    </span>
                    <span className="text-body font-semibold tabular-nums">
                      {formatWholeBRL(payment.amount_cents)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-footnote text-muted-foreground">
              {m.budget.procon}
            </p>
          </section>
        )}

        <section aria-labelledby="categorias" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 id="categorias" className="text-headline font-semibold">
              {m.budget.categories}
            </h2>
            {editable && (
              <Link
                href="/orcamento/categorias/nova"
                className="flex min-h-11 items-center gap-1 text-subhead font-medium text-link"
              >
                <PlusIcon aria-hidden="true" className="size-4" />
                {m.budget.newCategory}
              </Link>
            )}
          </div>
          {budget.categories.length === 0 ? (
            <EmptyState
              icon={WalletIcon}
              title={m.budget.emptyTitle}
              description={m.budget.emptyDescription}
            />
          ) : (
            <ul className="divide-y overflow-hidden rounded-2xl bg-card">
              {budget.categories.map((category) => {
                const totals = byCategory.get(category.id);
                const committed = totals?.committed ?? 0;
                const planned = category.planned_cents ?? 0;
                const over = planned > 0 && committed > planned;
                const Icon = categoryIcon(category.icon);
                return (
                  <li key={category.id}>
                    <Link
                      href={`/orcamento/categorias/${category.id}` as Route}
                      className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
                    >
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blush text-link"
                        style={
                          colorOf.has(category.id)
                            ? {
                                boxShadow: `inset 0 0 0 2px ${colorOf.get(category.id)}`,
                              }
                            : undefined
                        }
                      >
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <span className="flex flex-col gap-0.5">
                          <span className="truncate text-body font-medium">
                            {category.name}
                          </span>
                          <span className="text-footnote text-muted-foreground tabular-nums">
                            {planned > 0
                              ? m.budget.plannedOf(
                                  formatWholeBRL(committed),
                                  formatWholeBRL(planned),
                                )
                              : formatWholeBRL(committed)}
                          </span>
                        </span>
                        {planned > 0 && (
                          <span
                            aria-hidden="true"
                            className="h-1.5 overflow-hidden rounded-full bg-muted"
                          >
                            <span
                              className={cn(
                                "block h-full origin-left animate-grow-x rounded-full",
                                over ? "bg-danger" : "bg-primary",
                              )}
                              style={{
                                width: `${Math.min(committed / planned, 1) * 100}%`,
                              }}
                            />
                          </span>
                        )}
                        {over && (
                          <StatusBadge icon={CircleAlertIcon} tone="danger">
                            {m.budget.overPlanned(
                              formatWholeBRL(committed - planned),
                            )}
                          </StatusBadge>
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

        <section aria-labelledby="quem-paga" className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <h2 id="quem-paga" className="text-headline font-semibold">
                {m.budget.contributors}
              </h2>
              <p className="text-footnote text-muted-foreground">
                {m.budget.contributorsHint}
              </p>
            </div>
            {editable && <ContributorSheet contributor={null} />}
          </div>
          <ul className="divide-y overflow-hidden rounded-2xl bg-card">
            {contributors.map((row) => {
              const contributor = budget.contributors.find(
                (c) => c.id === row.id,
              );
              if (!contributor) return null;
              const share = row.promised
                ? Math.min(row.paid / row.promised, 1)
                : null;
              return (
                <li key={row.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-body font-medium">
                        {contributor.name}
                      </span>
                      <span className="shrink-0 text-subhead tabular-nums">
                        {row.promised
                          ? m.budget.contributorPaid(
                              formatWholeBRL(row.paid),
                              formatWholeBRL(row.promised),
                            )
                          : m.budget.contributorPaidOnly(
                              formatWholeBRL(row.paid),
                            )}
                      </span>
                    </span>
                    {share !== null && (
                      <span
                        aria-hidden="true"
                        className="h-2 overflow-hidden rounded-full bg-muted"
                      >
                        <span
                          className="block h-full origin-left animate-grow-x rounded-full bg-success"
                          style={{ width: `${share * 100}%` }}
                        />
                      </span>
                    )}
                  </span>
                  {editable && <ContributorSheet contributor={contributor} />}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
