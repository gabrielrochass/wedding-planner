"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ChoiceChips } from "@/components/forms/choice-chips";
import { describedBy, Field } from "@/components/forms/field";
import { FormActions } from "@/components/forms/form-actions";
import { MoneyInput } from "@/components/forms/money-input";
import { PhotoPicker } from "@/components/ideas/photo-picker";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/components/ui/toast";
import { deleteIdea, saveIdea } from "@/lib/actions/creative";
import { attempt, failed } from "@/lib/attempt";
import type { Idea } from "@/lib/data";
import { m } from "@/lib/i18n";
import { type IdeaBoard, ideaBoards } from "@/lib/ideas";
import { Constants, type Enums } from "@/lib/supabase/database.types";

export function IdeaEditor({
  idea,
  weddingId,
  board,
  vendors,
}: {
  idea: Idea | null;
  weddingId: string;
  board: IdeaBoard | null;
  vendors: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [id] = useState(() => idea?.id ?? crypto.randomUUID());
  const [title, setTitle] = useState(idea?.title ?? "");
  const [where, setWhere] = useState<IdeaBoard>(
    (idea?.board as IdeaBoard) ?? board ?? "decoracao",
  );
  const [url, setUrl] = useState(idea?.url ?? "");
  const [notes, setNotes] = useState(idea?.notes ?? "");
  const [status, setStatus] = useState<Enums<"idea_status">>(
    idea?.status ?? "idea",
  );
  const [estimate, setEstimate] = useState(idea?.estimate_cents ?? 0);
  const [vendorId, setVendorId] = useState(idea?.vendor_id ?? "");
  const [photo, setPhoto] = useState({
    path: idea?.image_path ?? null,
    preview: idea?.image_url ?? null,
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [message, setMessage] = useState("");
  const [saving, startSave] = useTransition();
  const [removing, startRemove] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);

  function save() {
    startSave(async () => {
      const result = await attempt(
        saveIdea(
          {
            id,
            board: where,
            title,
            notes,
            url,
            imagePath: photo.path,
            status,
            estimateCents: estimate > 0 ? estimate : null,
            vendorId: vendorId || null,
          },
          idea === null,
        ),
        failed,
      );
      if (!result.ok) {
        const found = Object.fromEntries(
          Object.entries(result.errors ?? {}).map(([k, v]) => [k, v?.[0]]),
        );
        setErrors(found);
        setMessage(result.message ?? "");
        if (found.title) titleRef.current?.focus();
        return;
      }
      toast.add({
        title: idea ? m.ideas.saved : m.ideas.created,
        type: "success",
      });
      router.replace(`/ideias?quadro=${where}`);
    });
  }

  function remove() {
    if (!idea) return;
    startRemove(async () => {
      const result = await attempt(deleteIdea(idea.id), failed);
      if (!result.ok) {
        setMessage(result.message ?? m.common.tryAgain);
        return;
      }
      toast.add({ title: m.ideas.deleted });
      router.replace("/ideias");
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
      <PhotoPicker
        weddingId={weddingId}
        ideaId={id}
        path={photo.path}
        preview={photo.preview}
        onChange={(path, preview) => setPhoto({ path, preview })}
      />
      <Field id="i-title" label={m.ideas.ideaTitle} error={errors.title}>
        <Input
          ref={titleRef}
          id="i-title"
          maxLength={80}
          autoComplete="off"
          placeholder={m.ideas.ideaTitlePlaceholder}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={describedBy("i-title", { error: errors.title })}
          className="bg-card dark:bg-card"
        />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="i-board" label={m.ideas.board}>
          <NativeSelect
            id="i-board"
            value={where}
            onChange={(event) => setWhere(event.target.value as IdeaBoard)}
          >
            {ideaBoards.map((key) => (
              <option key={key} value={key}>
                {m.boards[key]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id="i-estimate" label={m.ideas.estimate}>
          <MoneyInput
            id="i-estimate"
            value={estimate}
            onChange={setEstimate}
            placeholder={m.common.optional}
          />
        </Field>
      </div>
      <Field id="i-url" label={m.ideas.link} error={errors.url}>
        <Input
          id="i-url"
          type="url"
          inputMode="url"
          maxLength={500}
          placeholder={m.ideas.linkPlaceholder}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          aria-invalid={errors.url ? true : undefined}
          aria-describedby={describedBy("i-url", { error: errors.url })}
          className="bg-card dark:bg-card"
        />
      </Field>
      <ChoiceChips
        legend={m.ideas.status}
        name="situacao"
        value={status}
        onChange={(value) => setStatus(value as typeof status)}
        options={Constants.public.Enums.idea_status.map((value) => ({
          value,
          label: m.ideaStatus[value],
        }))}
      />
      {vendors.length > 0 && (
        <Field id="i-vendor" label={m.ideas.vendor}>
          <NativeSelect
            id="i-vendor"
            value={vendorId}
            onChange={(event) => setVendorId(event.target.value)}
          >
            <option value="">{m.ideas.noVendor}</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
      )}
      <Field id="i-notes" label={m.ideas.notes}>
        <textarea
          id="i-notes"
          rows={3}
          maxLength={2000}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-base"
        />
      </Field>
      <FormActions
        status={message}
        saving={saving}
        busy={saving || removing}
        submitLabel={idea ? m.common.save : m.ideas.newIdea}
        onDelete={idea ? remove : undefined}
      />
    </form>
  );
}
