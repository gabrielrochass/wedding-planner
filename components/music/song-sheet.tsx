"use client";

import { StarIcon } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { Field } from "@/components/forms/field";
import { SheetForm } from "@/components/forms/sheet-form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/components/ui/toast";
import { chooseSong, deleteSong, saveSong } from "@/lib/actions/creative";
import { attempt, failed } from "@/lib/attempt";
import type { Song } from "@/lib/data";
import { m } from "@/lib/i18n";
import { type MusicMoment, musicMoments } from "@/lib/music";
import { cn } from "@/lib/utils";

export function SongSheet({
  song,
  moment,
}: {
  song: Song | null;
  moment: MusicMoment;
}) {
  const [id, setId] = useState(() => song?.id ?? crypto.randomUUID());
  const [title, setTitle] = useState(song?.title ?? "");
  const [artist, setArtist] = useState(song?.artist ?? "");
  const [url, setUrl] = useState(song?.url ?? "");
  const [where, setWhere] = useState<MusicMoment>(
    (song?.moment as MusicMoment) ?? moment,
  );
  const [chosen, setChosen] = useState(song?.chosen ?? false);

  return (
    <SheetForm
      title={song ? m.music.editSong : m.music.addTo(m.moments[moment])}
      trigger={song ? "edit" : "icon-add"}
      triggerLabel={
        song
          ? `${m.common.edit}: ${song.title}`
          : m.music.addTo(m.moments[moment])
      }
      savedMessage={m.music.saved}
      deletedMessage={m.music.deleted}
      onSave={() =>
        saveSong(
          { id, moment: where, title, artist, url, chosen },
          song === null,
        )
      }
      onDelete={song ? () => deleteSong(song.id) : undefined}
      onSaved={() => {
        if (song) return;
        setId(crypto.randomUUID());
        setTitle("");
        setArtist("");
        setUrl("");
        setChosen(false);
      }}
    >
      <Field id={`s-title-${id}`} label={m.music.songTitle}>
        <Input
          id={`s-title-${id}`}
          maxLength={80}
          autoComplete="off"
          placeholder={m.music.songTitlePlaceholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-background"
        />
      </Field>
      <Field id={`s-artist-${id}`} label={m.music.artist}>
        <Input
          id={`s-artist-${id}`}
          maxLength={80}
          autoComplete="off"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="bg-background"
        />
      </Field>
      <Field id={`s-url-${id}`} label={m.music.link}>
        <Input
          id={`s-url-${id}`}
          type="url"
          inputMode="url"
          maxLength={500}
          placeholder="https://open.spotify.com/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-background"
        />
      </Field>
      <Field id={`s-moment-${id}`} label={m.music.moment}>
        <NativeSelect
          id={`s-moment-${id}`}
          value={where}
          onChange={(e) => setWhere(e.target.value as MusicMoment)}
        >
          {musicMoments.map((key) => (
            <option key={key} value={key}>
              {m.moments[key]}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <label className="flex min-h-11 items-center gap-3 text-body">
        <input
          type="checkbox"
          checked={chosen}
          onChange={(e) => setChosen(e.target.checked)}
          className="size-5 accent-primary"
        />
        {m.music.chosen}
      </label>
    </SheetForm>
  );
}

export function ChooseSong({
  song,
  disabled,
}: {
  song: Song;
  disabled: boolean;
}) {
  const [chosen, setChosen] = useOptimistic(song.chosen);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={chosen}
      aria-label={
        chosen ? m.music.unchoose(song.title) : m.music.choose(song.title)
      }
      disabled={disabled}
      onClick={() =>
        startTransition(async () => {
          setChosen(!chosen);
          const result = await attempt(chooseSong(song.id, !chosen), failed);
          if (!result.ok)
            toast.add({
              title: result.message ?? m.common.tryAgain,
              type: "error",
            });
        })
      }
      className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-muted disabled:opacity-50"
    >
      <StarIcon
        aria-hidden="true"
        className={cn(
          "size-5 transition-transform",
          chosen
            ? "scale-110 fill-chart-2 text-chart-2"
            : "text-muted-foreground",
        )}
      />
    </button>
  );
}
