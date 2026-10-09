import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell/page-header";
import { TaskEditor } from "@/components/tasks/task-editor";
import { getPeople, getVendors } from "@/lib/data";
import { m } from "@/lib/i18n";
import { requireWedding } from "@/lib/supabase/server";

export const metadata: Metadata = { title: m.tasks.newTask };

export default async function NewTaskPage() {
  const [{ wedding }, people, vendors] = await Promise.all([
    requireWedding(),
    getPeople(),
    getVendors(),
  ]);
  return (
    <>
      <PageHeader
        title={m.tasks.newTask}
        back={{ href: "/tarefas", label: m.tasks.title }}
      />
      <TaskEditor
        task={null}
        people={people}
        vendors={vendors.map(({ id, name }) => ({ id, name }))}
        hasDate={wedding.wedding_date !== null}
      />
    </>
  );
}
