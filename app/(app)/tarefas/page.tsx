import { ListChecksIcon, PlusIcon } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/app-shell/empty-state";
import { PageHeader } from "@/components/app-shell/page-header";
import { TaskBadge } from "@/components/tasks/task-badge";
import { TaskCheck } from "@/components/tasks/task-check";
import { buttonVariants } from "@/components/ui/button";
import { dueDate, groupByPhase, taskState } from "@/lib/checklist";
import { getPeople, getTasks } from "@/lib/data";
import { formatDate, todayInSaoPaulo } from "@/lib/dates";
import { m } from "@/lib/i18n";
import { canHelp } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: m.tasks.title };

const filters = ["abertas", "minhas", "todas"] as const;
type Filter = (typeof filters)[number];
const filterLabels: Record<Filter, string> = {
  abertas: m.tasks.filterOpen,
  minhas: m.tasks.filterMine,
  todas: m.tasks.filterAll,
};

export default async function TasksPage({
  searchParams,
}: PageProps<"/tarefas">) {
  const raw = (await searchParams).ver;
  const filter: Filter = filters.includes(raw as Filter)
    ? (raw as Filter)
    : "abertas";
  const [{ wedding, role, userId }, tasks, people] = await Promise.all([
    requireWedding(),
    getTasks(),
    getPeople(),
  ]);
  const today = todayInSaoPaulo();
  const date = wedding.wedding_date;
  const names = new Map(
    people.map((p) => [p.user_id, p.display_name ?? m.team.unnamed]),
  );
  const visible = tasks.filter((task) =>
    filter === "todas"
      ? true
      : filter === "minhas"
        ? task.assignee_id === userId
        : !task.done_at,
  );
  const done = tasks.filter((task) => task.done_at).length;
  const editable = canHelp(role);

  return (
    <>
      <PageHeader
        title={m.tasks.title}
        action={
          editable ? (
            <Link
              href="/tarefas/nova"
              aria-label={m.tasks.newTask}
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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-subhead">
            <span className="text-muted-foreground">
              {m.tasks.progress(done, tasks.length)}
            </span>
            <span className="font-semibold tabular-nums">
              {tasks.length ? Math.round((done / tasks.length) * 100) : 0}%
            </span>
          </div>
          <div
            aria-hidden="true"
            className="h-2 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full origin-left animate-grow-x rounded-full bg-success"
              style={{
                width: `${tasks.length ? (done / tasks.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <nav aria-label={m.tasks.filters} className="flex gap-2">
          {filters.map((key) => (
            <Link
              key={key}
              href={
                (key === "abertas"
                  ? "/tarefas"
                  : `/tarefas?ver=${key}`) as Route
              }
              aria-current={filter === key ? "page" : undefined}
              className="flex min-h-11 items-center rounded-full bg-secondary px-4 text-subhead font-medium aria-[current=page]:bg-foreground aria-[current=page]:text-background"
            >
              {filterLabels[key]}
            </Link>
          ))}
        </nav>

        {visible.length === 0 ? (
          <EmptyState
            icon={ListChecksIcon}
            title={m.tasks.emptyTitle}
            description={m.tasks.emptyDescription}
          />
        ) : (
          groupByPhase(visible, date).map(([phase, list]) => (
            <section
              key={phase}
              id={`fase-${phase}`}
              aria-labelledby={`titulo-${phase}`}
              className="flex scroll-mt-6 flex-col gap-2"
            >
              <h2
                id={`titulo-${phase}`}
                className="flex items-baseline justify-between gap-3 px-1"
              >
                <span className="text-headline font-semibold">
                  {m.phases[phase]}
                </span>
                <span className="text-footnote text-muted-foreground tabular-nums">
                  {list.filter((t) => t.done_at).length}/{list.length}
                </span>
              </h2>
              <ul className="divide-y overflow-hidden rounded-2xl bg-card">
                {list.map((task) => {
                  const due = dueDate(task, date);
                  const state = taskState(task, date, today);
                  const assignee = task.assignee_id
                    ? names.get(task.assignee_id)
                    : task.assignee_label;
                  return (
                    <li
                      key={task.id}
                      className="flex items-center gap-1 pr-3 pl-1"
                    >
                      <TaskCheck
                        id={task.id}
                        title={task.title}
                        done={!!task.done_at}
                        disabled={!editable}
                      />
                      <Link
                        href={`/tarefas/${task.id}` as Route}
                        className="flex min-h-14 min-w-0 flex-1 flex-col justify-center gap-0.5 py-2"
                      >
                        <span
                          className={cn(
                            "text-body",
                            task.done_at &&
                              "text-muted-foreground line-through",
                          )}
                        >
                          {task.title}
                        </span>
                        <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          {!task.done_at && (
                            <TaskBadge
                              state={state}
                              label={
                                due
                                  ? m.tasks.dueOn(formatDate(due, today))
                                  : undefined
                              }
                            />
                          )}
                          <span className="text-footnote text-muted-foreground">
                            {m.areas[task.area as keyof typeof m.areas]}
                          </span>
                          {assignee && (
                            <span className="text-footnote text-muted-foreground">
                              {assignee}
                            </span>
                          )}
                          {task.template_key && (
                            <span className="rounded-full bg-blush px-2 text-caption2 font-semibold text-link">
                              {m.tasks.legal}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  );
}
