"use client";

import { ArrowRightIcon, PencilIcon, PlusIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ChoiceChips } from "@/components/forms/choice-chips";
import { Field } from "@/components/forms/field";
import { FormActions } from "@/components/forms/form-actions";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { deleteTask, saveTask } from "@/lib/actions/tasks";
import { attempt, failed } from "@/lib/attempt";
import { areaHref, type TaskArea, taskAreas } from "@/lib/checklist";
import type { Person, Task } from "@/lib/data";
import { m } from "@/lib/i18n";
import type { TaskInput } from "@/lib/schemas";

const other = "outra";

export function TaskSheet({
  task,
  people,
  vendors,
  hasDate,
  trigger,
}: {
  task: Task | null;
  people: Person[];
  vendors: { id: string; name: string }[];
  hasDate: boolean;
  trigger: "add" | "edit";
}) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(() => task?.id ?? crypto.randomUUID());
  const [title, setTitle] = useState(task?.title ?? "");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [area, setArea] = useState<TaskArea>(
    (task?.area as TaskArea) ?? "geral",
  );
  const [mode, setMode] = useState<"relative" | "fixed">(
    task?.due_on || !hasDate ? "fixed" : "relative",
  );
  const [offset, setOffset] = useState(String(task?.offset_days ?? ""));
  const [dueOn, setDueOn] = useState(task?.due_on ?? "");
  const [assignee, setAssignee] = useState(
    task?.assignee_id ?? (task?.assignee_label ? other : ""),
  );
  const [assigneeLabel, setAssigneeLabel] = useState(
    task?.assignee_label ?? "",
  );
  const [vendorId, setVendorId] = useState(task?.vendor_id ?? "");
  const [status, setStatus] = useState("");
  const [saving, startSave] = useTransition();
  const [removing, startRemove] = useTransition();

  function input(): TaskInput {
    const days = Number.parseInt(offset, 10);
    return {
      id,
      title,
      notes,
      area,
      offsetDays: mode === "relative" && Number.isFinite(days) ? days : null,
      dueOn: mode === "fixed" && dueOn ? dueOn : null,
      assigneeId: assignee && assignee !== other ? assignee : null,
      assigneeLabel: assignee === other ? assigneeLabel : "",
      vendorId: vendorId || null,
    };
  }

  function save() {
    startSave(async () => {
      const result = await attempt(saveTask(input(), task === null), failed);
      if (!result.ok) {
        setStatus(
          Object.values(result.errors ?? {})[0]?.[0] ??
            result.message ??
            m.common.tryAgain,
        );
        return;
      }
      setStatus("");
      toast.add({
        title: task ? m.tasks.saved : m.tasks.created,
        type: "success",
      });
      setOpen(false);
      if (!task) {
        setId(crypto.randomUUID());
        setTitle("");
        setNotes("");
        setArea("geral");
        setMode(hasDate ? "relative" : "fixed");
        setOffset("");
        setDueOn("");
        setAssignee("");
        setAssigneeLabel("");
        setVendorId("");
      }
    });
  }

  function remove() {
    if (!task) return;
    const snapshot = input();
    startRemove(async () => {
      const result = await attempt(deleteTask(task.id), failed);
      if (!result.ok) {
        setStatus(result.message ?? m.common.tryAgain);
        return;
      }
      setOpen(false);
      toast.add({
        title: m.tasks.deleted,
        timeout: 10_000,
        actionProps: {
          children: m.common.undo,
          onClick: async () => {
            const restored = await attempt(saveTask(snapshot, true), failed);
            toast.add({
              title: restored.ok ? m.tasks.restored : m.common.tryAgain,
              type: restored.ok ? "success" : "error",
            });
          },
        },
      });
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={
          trigger === "edit" ? `${m.common.edit}: ${task?.title}` : undefined
        }
        className={buttonVariants({
          variant: trigger === "add" ? "secondary" : "ghost",
          size: trigger === "add" ? "icon-lg" : "icon-lg",
        })}
      >
        {trigger === "edit" ? (
          <PencilIcon aria-hidden="true" className="size-5" />
        ) : (
          <PlusIcon aria-hidden="true" className="size-6" />
        )}
      </SheetTrigger>
      <SheetContent title={task ? m.tasks.editTask : m.tasks.newTask}>
        {task?.notes && task.template_key && (
          <p className="rounded-2xl bg-blush px-4 py-3 text-subhead text-foreground">
            {task.notes}
          </p>
        )}
        {task && areaHref[task.area as TaskArea] && (
          <Link
            href={areaHref[task.area as TaskArea] as Route}
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-2 text-subhead font-medium text-link"
          >
            {m.areas[task.area as keyof typeof m.areas]}
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </Link>
        )}
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
          className="flex flex-col gap-5"
        >
          <Field id={`t-title-${id}`} label={m.tasks.taskTitle}>
            <Input
              id={`t-title-${id}`}
              maxLength={120}
              autoComplete="off"
              placeholder={m.tasks.taskTitlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background"
            />
          </Field>

          <ChoiceChips
            legend={m.tasks.due}
            name={`due-mode-${id}`}
            value={mode}
            onChange={(value) => setMode(value as "relative" | "fixed")}
            options={[
              ...(hasDate
                ? [{ value: "relative", label: m.tasks.dueRelative }]
                : []),
              { value: "fixed", label: m.tasks.dueFixed },
            ]}
          />
          {mode === "relative" ? (
            <Field
              id={`t-offset-${id}`}
              label={m.tasks.daysBefore}
              hint={m.tasks.dueHint}
            >
              <Input
                id={`t-offset-${id}`}
                inputMode="numeric"
                autoComplete="off"
                maxLength={5}
                value={offset}
                onChange={(e) =>
                  setOffset(e.target.value.replace(/[^\d-]/g, ""))
                }
                aria-describedby={`t-offset-${id}-hint`}
                className="bg-background tabular-nums"
              />
            </Field>
          ) : (
            <Field id={`t-due-${id}`} label={m.tasks.dueFixed}>
              <Input
                id={`t-due-${id}`}
                type="date"
                min="2000-01-01"
                max="2100-12-31"
                value={dueOn}
                onChange={(e) => setDueOn(e.target.value)}
                className="bg-background"
              />
            </Field>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id={`t-area-${id}`} label={m.tasks.area}>
              <NativeSelect
                id={`t-area-${id}`}
                value={area}
                onChange={(e) => setArea(e.target.value as TaskArea)}
              >
                {taskAreas.map((key) => (
                  <option key={key} value={key}>
                    {m.areas[key]}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field id={`t-assignee-${id}`} label={m.tasks.assignee}>
              <NativeSelect
                id={`t-assignee-${id}`}
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">{m.tasks.nobody}</option>
                {people.map((person) => (
                  <option key={person.user_id} value={person.user_id}>
                    {person.display_name ?? m.team.unnamed}
                  </option>
                ))}
                <option value={other}>{m.tasks.assigneeOther}</option>
              </NativeSelect>
            </Field>
            {assignee === other && (
              <Field id={`t-label-${id}`} label={m.tasks.assigneeLabel}>
                <Input
                  id={`t-label-${id}`}
                  maxLength={40}
                  autoComplete="off"
                  placeholder={m.tasks.assigneeLabelPlaceholder}
                  value={assigneeLabel}
                  onChange={(e) => setAssigneeLabel(e.target.value)}
                  className="bg-background"
                />
              </Field>
            )}
            {vendors.length > 0 && (
              <Field id={`t-vendor-${id}`} label={m.tasks.vendor}>
                <NativeSelect
                  id={`t-vendor-${id}`}
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                >
                  <option value="">{m.tasks.noVendor}</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            )}
          </div>

          <Field id={`t-notes-${id}`} label={m.tasks.notes}>
            <textarea
              id={`t-notes-${id}`}
              rows={3}
              maxLength={2000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base"
            />
          </Field>

          <FormActions
            status={status}
            saving={saving}
            busy={saving || removing}
            submitLabel={m.common.save}
            onDelete={task ? remove : undefined}
          />
        </form>
      </SheetContent>
    </Sheet>
  );
}
