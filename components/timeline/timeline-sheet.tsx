"use client";

import { useState } from "react";
import { Field } from "@/components/forms/field";
import { SheetForm } from "@/components/forms/sheet-form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { deleteTimelineItem, saveTimelineItem } from "@/lib/actions/creative";
import type { TimelineItem } from "@/lib/data";
import { m } from "@/lib/i18n";

export function TimelineSheet({
  item,
  songs,
}: {
  item: TimelineItem | null;
  songs: { id: string; title: string }[];
}) {
  const [id, setId] = useState(() => item?.id ?? crypto.randomUUID());
  const [startsAt, setStartsAt] = useState(item?.starts_at.slice(0, 5) ?? "");
  const [endsAt, setEndsAt] = useState(item?.ends_at?.slice(0, 5) ?? "");
  const [title, setTitle] = useState(item?.title ?? "");
  const [place, setPlace] = useState(item?.place ?? "");
  const [responsible, setResponsible] = useState(item?.responsible ?? "");
  const [songId, setSongId] = useState(item?.song_id ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");

  return (
    <SheetForm
      title={item ? item.title : m.timeline.newItem}
      trigger={item ? "edit" : "add"}
      triggerLabel={
        item ? `${m.common.edit}: ${item.title}` : m.timeline.newItem
      }
      savedMessage={m.timeline.saved}
      deletedMessage={m.timeline.deleted}
      onSave={() =>
        saveTimelineItem(
          {
            id,
            startsAt,
            endsAt: endsAt || null,
            title,
            place,
            responsible,
            notes,
            songId: songId || null,
          },
          item === null,
        )
      }
      onDelete={item ? () => deleteTimelineItem(item.id) : undefined}
      onSaved={() => {
        if (item) return;
        setId(crypto.randomUUID());
        setStartsAt(endsAt);
        setEndsAt("");
        setTitle("");
        setPlace("");
        setResponsible("");
        setSongId("");
        setNotes("");
      }}
    >
      <div className="grid grid-cols-2 gap-5">
        <Field id={`t-start-${id}`} label={m.timeline.startsAt}>
          <Input
            id={`t-start-${id}`}
            type="time"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="bg-background tabular-nums"
          />
        </Field>
        <Field id={`t-end-${id}`} label={m.timeline.endsAt}>
          <Input
            id={`t-end-${id}`}
            type="time"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="bg-background tabular-nums"
          />
        </Field>
      </div>
      <Field id={`t-title-${id}`} label={m.timeline.itemTitle}>
        <Input
          id={`t-title-${id}`}
          maxLength={80}
          autoComplete="off"
          placeholder={m.timeline.itemTitlePlaceholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-background"
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`t-place-${id}`} label={m.timeline.place}>
          <Input
            id={`t-place-${id}`}
            maxLength={120}
            autoComplete="off"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            className="bg-background"
          />
        </Field>
        <Field id={`t-who-${id}`} label={m.timeline.responsible}>
          <Input
            id={`t-who-${id}`}
            maxLength={80}
            autoComplete="off"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
            className="bg-background"
          />
        </Field>
      </div>
      {songs.length > 0 && (
        <Field id={`t-song-${id}`} label={m.timeline.song}>
          <NativeSelect
            id={`t-song-${id}`}
            value={songId}
            onChange={(e) => setSongId(e.target.value)}
          >
            <option value="">{m.timeline.noSong}</option>
            {songs.map((song) => (
              <option key={song.id} value={song.id}>
                {song.title}
              </option>
            ))}
          </NativeSelect>
        </Field>
      )}
      <Field id={`t-notes-${id}`} label={m.timeline.notes}>
        <textarea
          id={`t-notes-${id}`}
          rows={3}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base"
        />
      </Field>
    </SheetForm>
  );
}
