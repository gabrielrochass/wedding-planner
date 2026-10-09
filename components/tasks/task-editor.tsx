"use client";

import { useRef, useState, useTransition } from "react";
import { ChoiceChips } from "@/components/forms/choice-chips";
import { describedBy, Field } from "@/components/forms/field";
import { FormActions } from "@/components/forms/form-actions";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/components/ui/toast";
import { useGoBack } from "@/hooks/use-go-back";
import { deleteTask, saveTask } from "@/lib/actions/tasks";
import { attempt, failed } from "@/lib/attempt";
import { type TaskArea, taskAreas } from "@/lib/checklist";
import type { Person, Task } from "@/lib/data";
import { m } from "@/lib/i18n";
import type { TaskInput } from "@/lib/schemas";

const other = "outra";

export function TaskEditor({
  task,
  people,
  vendors,
  hasDate,
}: {
  task: Task | null;
  people: Person[];
  vendors: { id: string; name: string }[];
  hasDate: boolean;
}) {
  const goBack = useGoBack("/tarefas");
  const [id] = useState(() => task?.id ?? crypto.randomUUID());
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
  const [titleError, setTitleError] = useState<string>();
  const [status, setStatus] = useState("");
  const [saving, startSave] = useTransition();
  const [removing, startRemove] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);

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
        setTitleError(result.errors?.title?.[0]);
        setStatus(result.errors?.dueOn?.[0] ?? result.message ?? "");
        if (result.errors?.title) titleRef.current?.focus();
        return;
      }
      toast.add({
        title: task ? m.tasks.saved : m.tasks.created,
        type: "success",
      });
      goBack();
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
      goBack();
    });
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      className="flex flex-col gap-6"
    >
      <Field id="task-title" label={m.tasks.taskTitle} error={titleError}>
        <Input
          ref={titleRef}
          id="task-title"
          maxLength={120}
          autoComplete="off"
          placeholder={m.tasks.taskTitlePlaceholder}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={titleError ? true : undefined}
          aria-describedby={describedBy("task-title", { error: titleError })}
          className="bg-card dark:bg-card"
        />
      </Field>

      <ChoiceChips
        legend={m.tasks.due}
        name="due-mode"
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
          id="task-offset"
          label={m.tasks.daysBefore}
          hint={m.tasks.dueHint}
        >
          <Input
            id="task-offset"
            inputMode="numeric"
            autoComplete="off"
            maxLength={5}
            value={offset}
            onChange={(event) =>
              setOffset(event.target.value.replace(/[^\d-]/g, ""))
            }
            aria-describedby="task-offset-hint"
            className="bg-card tabular-nums dark:bg-card"
          />
        </Field>
      ) : (
        <Field id="task-due" label={m.tasks.dueFixed}>
          <Input
            id="task-due"
            type="date"
            min="2000-01-01"
            max="2100-12-31"
            value={dueOn}
            onChange={(event) => setDueOn(event.target.value)}
            className="bg-card dark:bg-card"
          />
        </Field>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="task-area" label={m.tasks.area}>
          <NativeSelect
            id="task-area"
            value={area}
            onChange={(event) => setArea(event.target.value as TaskArea)}
          >
            {taskAreas.map((key) => (
              <option key={key} value={key}>
                {m.areas[key]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id="task-assignee" label={m.tasks.assignee}>
          <NativeSelect
            id="task-assignee"
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
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
          <Field id="task-assignee-label" label={m.tasks.assigneeLabel}>
            <Input
              id="task-assignee-label"
              maxLength={40}
              autoComplete="off"
              placeholder={m.tasks.assigneeLabelPlaceholder}
              value={assigneeLabel}
              onChange={(event) => setAssigneeLabel(event.target.value)}
              className="bg-card dark:bg-card"
            />
          </Field>
        )}
        {vendors.length > 0 && (
          <Field id="task-vendor" label={m.tasks.vendor}>
            <NativeSelect
              id="task-vendor"
              value={vendorId}
              onChange={(event) => setVendorId(event.target.value)}
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

      <Field id="task-notes" label={m.tasks.notes}>
        <textarea
          id="task-notes"
          rows={4}
          maxLength={2000}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-base"
        />
      </Field>

      <FormActions
        status={status}
        saving={saving}
        busy={saving || removing}
        submitLabel={task ? m.common.save : m.tasks.newTask}
        onDelete={task ? remove : undefined}
      />
    </form>
  );
}
