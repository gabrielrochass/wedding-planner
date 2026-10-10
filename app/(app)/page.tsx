import { ChevronRightIcon, PencilIcon } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/app-shell/page-header";
import { PaymentBadge } from "@/components/budget/payment-badge";
import { Celebration } from "@/components/home/celebration";
import { Countdown } from "@/components/home/countdown";
import { Milestones } from "@/components/home/milestones";
import { PhaseCard } from "@/components/home/phase-card";
import { ProgressRing } from "@/components/home/progress-ring";
import { TaskBadge } from "@/components/tasks/task-badge";
import { TaskCheck } from "@/components/tasks/task-check";
import { buttonVariants } from "@/components/ui/button";
import {
  paymentState,
  remainingBudget,
  summarize,
  upcomingPayments,
} from "@/lib/budget";
import { dueDate, taskState } from "@/lib/checklist";
import { getBudget, getGuests, getTasks, getVendors } from "@/lib/data";
import { formatDate, formatMonth, todayInSaoPaulo } from "@/lib/dates";
import { headcount } from "@/lib/guests";
import { m } from "@/lib/i18n";
import { formatWholeBRL } from "@/lib/money";
import { canEdit, canHelp } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import {
  daysUntil,
  milestones,
  overallProgress,
  phaseStatus,
  ratio,
} from "@/lib/wedding";

export const metadata: Metadata = { title: m.home.title };

function Card({
  title,
  href,
  more,
  children,
  className,
  tour,
}: {
  title: string;
  href: Route;
  more: string;
  children: React.ReactNode;
  className?: string;
  tour: string;
}) {
  return (
    <section
      data-tour={tour}
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-2xl bg-card p-4",
        className,
      )}
    >
      <h2 className="text-headline font-semibold">{title}</h2>
      {children}
      <Link
        href={href}
        className="-mx-1 mt-auto flex min-h-11 w-fit items-center gap-0.5 px-1 text-subhead font-medium text-link"
      >
        {more}
        <ChevronRightIcon aria-hidden="true" className="size-4" />
      </Link>
    </section>
  );
}

export default async function HomePage() {
  const [{ wedding, role }, tasks, budget, vendors, { households, guests }] =
    await Promise.all([
      requireWedding(),
      getTasks(),
      getBudget(),
      getVendors(),
      getGuests(),
    ]);
  const today = todayInSaoPaulo();
  const date = wedding.wedding_date;
  const days = daysUntil(date, today);

  const done = tasks.filter((task) => task.done_at).length;
  const open = tasks.filter((task) => !task.done_at);
  const phase = phaseStatus(tasks, date, today);
  const focus = open
    .map((task) => ({ task, due: dueDate(task, date) }))
    .toSorted((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"))
    .slice(0, 3);

  const { byCategory, total } = summarize(
    budget.categories,
    budget.expenses,
    budget.payments,
  );
  const coveredCategories = [...byCategory.values()].filter(
    (totals) => totals.contracted > 0,
  ).length;
  const remaining = remainingBudget(
    wedding.budget_cents,
    wedding.contingency_percent,
    total.committed,
  );
  const nextPayments = upcomingPayments(budget.payments, 3);
  const expenseTitle = new Map(budget.expenses.map((e) => [e.id, e.title]));

  const count = headcount(households, guests);
  const progress = overallProgress([
    ratio(done, tasks.length),
    ratio(coveredCategories, budget.categories.length),
    ratio(count.funnel.answered, count.funnel.listed),
  ]);
  const achievements = milestones({
    hasDate: date !== null,
    hiredVendors: vendors.filter((v) => v.status === "hired").length,
    listedHouseholds: count.funnel.listed,
    savedTheDate: count.funnel.saveTheDate,
    invitedHouseholds: count.funnel.invited,
    tasksDone: done,
    tasksTotal: tasks.length,
    confirmedGuests: count.rsvp.yes,
    expectedGuests: count.expectedGuests,
    committed: total.committed,
    paid: total.paid,
  });

  return (
    <>
      <PageHeader title={m.home.title} />
      <div className="flex flex-col gap-8">
        <section
          data-tour="inicio-contagem"
          className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blush via-card to-card p-5 sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-3">
              <p className="font-display text-title1 leading-tight font-bold tracking-tight text-balance sm:text-large-title">
                {m.home.couple(wedding.partner_a, wedding.partner_b)}
              </p>
              {days === null ? (
                <div className="flex flex-col items-start gap-2">
                  <p className="text-title3 font-semibold">{m.home.noDate}</p>
                  <p className="text-subhead text-muted-foreground">
                    {m.home.noDateHint}
                  </p>
                  {canEdit(role) && (
                    <Link
                      href="/ajustes/casamento"
                      className={cn(buttonVariants({ size: "lg" }), "mt-1")}
                    >
                      <PencilIcon aria-hidden="true" />
                      {m.home.setDate}
                    </Link>
                  )}
                </div>
              ) : days > 0 ? (
                <p className="flex flex-col">
                  <span className="font-display text-[4rem] leading-none font-extrabold tracking-tighter text-link sm:text-[5rem]">
                    <Countdown days={days} />
                  </span>
                  <span className="text-subhead text-muted-foreground">
                    {m.home.daysLeft(days)}
                    {date
                      ? `, ${
                          wedding.date_is_estimate
                            ? m.home.estimated(formatMonth(date.slice(0, 7)))
                            : formatDate(date, today)
                        }`
                      : ""}
                  </span>
                </p>
              ) : (
                <p className="font-display text-large-title font-bold tracking-tight text-link">
                  {days === 0 ? m.home.today : m.home.married(-days)}
                </p>
              )}
              {wedding.motto && (
                <p className="max-w-prose font-display text-body text-muted-foreground">
                  “{wedding.motto}”
                </p>
              )}
            </div>
            <div
              data-tour="inicio-progresso"
              className="hidden flex-col items-center gap-1 sm:flex"
            >
              <ProgressRing value={progress} label={m.home.progress} />
            </div>
          </div>
          <div
            data-tour="inicio-progresso"
            className="mt-4 flex items-center gap-3 sm:hidden"
          >
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full origin-left animate-grow-x rounded-full bg-primary"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <span className="text-footnote font-semibold tabular-nums">
              {m.home.progressValue(Math.round(progress * 100))}
            </span>
          </div>
          <p className="sr-only">{m.home.progressParts}</p>
        </section>

        {phase && <PhaseCard status={phase} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            tour="inicio-foco"
            title={m.home.focus}
            href="/tarefas"
            more={m.home.focusMore}
          >
            {focus.length === 0 ? (
              <p className="text-subhead text-muted-foreground">
                {m.home.focusEmpty}
              </p>
            ) : (
              <ul className="-mx-2 flex flex-col">
                {focus.map(({ task, due }) => (
                  <li key={task.id} className="flex items-center gap-1">
                    <TaskCheck
                      id={task.id}
                      title={task.title}
                      done={false}
                      disabled={!canHelp(role)}
                    />
                    <Link
                      href={`/tarefas/${task.id}` as Route}
                      className="flex min-w-0 flex-1 flex-col py-1.5"
                    >
                      <span className="truncate text-body">{task.title}</span>
                      <TaskBadge
                        state={taskState(task, date, today)}
                        label={
                          due
                            ? m.tasks.dueOn(formatDate(due, today))
                            : undefined
                        }
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            tour="inicio-pagamentos"
            title={m.home.payments}
            href="/orcamento"
            more={m.home.paymentsMore}
          >
            {nextPayments.length === 0 ? (
              <p className="text-subhead text-muted-foreground">
                {m.home.paymentsEmpty}
              </p>
            ) : (
              <ul className="flex flex-col divide-y">
                {nextPayments.map((payment) => (
                  <li key={payment.id}>
                    <Link
                      href={`/orcamento/gastos/${payment.expense_id}` as Route}
                      className="flex min-h-12 items-center justify-between gap-3 py-2"
                    >
                      <span className="flex min-w-0 flex-col">
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
                      <span className="shrink-0 text-body font-semibold tabular-nums">
                        {formatWholeBRL(payment.amount_cents)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            tour="inicio-convidados"
            title={m.home.guestsCard}
            href="/convidados"
            more={m.home.guestsMore}
          >
            <p className="text-body">
              {m.home.guestsSummary(count.expectedGuests, count.rsvp.yes)}
            </p>
            <div
              aria-hidden="true"
              className="flex h-2.5 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full bg-success"
                style={{
                  width: `${(ratio(count.rsvp.yes, count.invitedGuests) ?? 0) * 100}%`,
                }}
              />
              <div
                className="h-full bg-danger/70"
                style={{
                  width: `${(ratio(count.rsvp.no, count.invitedGuests) ?? 0) * 100}%`,
                }}
              />
            </div>
          </Card>

          <Card
            tour="inicio-orcamento"
            title={m.home.budgetCard}
            href="/orcamento"
            more={m.home.paymentsMore}
          >
            <p className="text-body tabular-nums">
              {wedding.budget_cents
                ? m.home.budgetCommitted(
                    formatWholeBRL(total.committed),
                    formatWholeBRL(wedding.budget_cents),
                  )
                : m.home.budgetNoTotal(formatWholeBRL(total.committed))}
            </p>
            {wedding.budget_cents && (
              <div
                aria-hidden="true"
                className="h-2.5 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className={cn(
                    "h-full rounded-full",
                    remaining !== null && remaining < 0
                      ? "bg-danger"
                      : "bg-primary",
                  )}
                  style={{
                    width: `${Math.min(total.committed / wedding.budget_cents, 1) * 100}%`,
                  }}
                />
              </div>
            )}
          </Card>
        </div>

        <Milestones items={achievements} />
      </div>
      <Celebration
        weddingId={wedding.id}
        reached={achievements.filter((a) => a.reached).map((a) => a.key)}
      />
    </>
  );
}
