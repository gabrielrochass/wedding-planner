import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/app-shell/page-header";
import { TaskEditor } from "@/components/tasks/task-editor";
import { getPeople, getTask, getVendors } from "@/lib/data";
import { m } from "@/lib/i18n";
import { requireWedding } from "@/lib/supabase/server";

export const metadata: Metadata = { title: m.tasks.editTask };

export default async function TaskPage({ params }: PageProps<"/tarefas/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [{ wedding }, task, people, vendors] = await Promise.all([
    requireWedding(),
    getTask(id),
    getPeople(),
    getVendors(),
  ]);
  if (!task) notFound();
  return (
    <>
      <PageHeader
        title={m.tasks.editTask}
        back={{ href: "/tarefas", label: m.tasks.title }}
      />
      {task.notes && task.template_key && (
        <p className="mb-6 rounded-2xl bg-blush px-4 py-3 text-subhead text-foreground">
          {task.notes}
        </p>
      )}
      <TaskEditor
        task={task}
        people={people}
        vendors={vendors.map(({ id, name }) => ({ id, name }))}
        hasDate={wedding.wedding_date !== null}
      />
    </>
  );
}
