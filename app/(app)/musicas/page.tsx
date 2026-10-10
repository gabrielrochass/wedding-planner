import { CirclePlayIcon, MusicIcon, SearchIcon } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell/page-header";
import { ChooseSong, SongSheet } from "@/components/music/song-sheet";
import { getSongs, type Song } from "@/lib/data";
import { m } from "@/lib/i18n";
import {
  ceremonyMoments,
  chosenCount,
  linkKind,
  type MusicMoment,
  partyMoments,
  searchLinks,
  songsByMoment,
} from "@/lib/music";
import { canHelp } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: m.music.title };

const where = {
  spotify: "Spotify",
  youtube: "YouTube",
  other: "site",
} as const;

function Moment({
  moment,
  list,
  editable,
}: {
  moment: MusicMoment;
  list: Song[];
  editable: boolean;
}) {
  const chosen = list.find((song) => song.chosen);
  return (
    <li
      data-tour="musicas-momento"
      className={cn(
        "flex flex-col gap-1 rounded-2xl bg-card p-3",
        chosen && "ring-1 ring-chart-2/60",
      )}
    >
      <div className="flex items-center gap-2 pl-1">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            chosen
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          <MusicIcon className="size-4" />
        </span>
        <h3 className="min-w-0 flex-1 text-body font-semibold">
          {m.moments[moment]}
        </h3>
        {editable && <SongSheet song={null} moment={moment} />}
      </div>
      {moment === "nao-tocar" && (
        <p className="pl-11 text-footnote text-muted-foreground">
          {m.music.doNotPlayHint}
        </p>
      )}
      {list.length > 0 && (
        <ul className="flex flex-col">
          {list.map((song) => {
            const search = searchLinks(song.title, song.artist);
            return (
              <li key={song.id} className="flex items-center gap-1">
                <ChooseSong song={song} disabled={!editable} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={cn(
                      "truncate text-body",
                      song.chosen && "font-medium",
                    )}
                  >
                    {song.title}
                  </span>
                  {song.artist && (
                    <span className="truncate text-footnote text-muted-foreground">
                      {song.artist}
                    </span>
                  )}
                </span>
                {song.url ? (
                  <a
                    href={song.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={m.music.listen(
                      song.title,
                      where[linkKind(song.url)],
                    )}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-link hover:bg-muted"
                  >
                    <CirclePlayIcon aria-hidden="true" className="size-6" />
                  </a>
                ) : (
                  <a
                    href={search.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={m.music.searchOn("Spotify", song.title)}
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <SearchIcon aria-hidden="true" className="size-5" />
                  </a>
                )}
                {editable && <SongSheet song={song} moment={moment} />}
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

export default async function MusicPage() {
  const [{ role }, songs] = await Promise.all([requireWedding(), getSongs()]);
  const editable = canHelp(role);
  const groups = songsByMoment(songs);
  const done = chosenCount(
    songs.filter((s) =>
      (ceremonyMoments as readonly string[]).includes(s.moment),
    ),
  );

  return (
    <>
      <PageHeader title={m.music.title} />
      <div className="flex flex-col gap-8">
        <p className="text-body text-muted-foreground">{m.music.intro}</p>
        <div data-tour="musicas-progresso" className="flex flex-col gap-2">
          <span className="text-subhead">
            {m.music.progress(done, ceremonyMoments.length)}
          </span>
          <div
            aria-hidden="true"
            className="h-2 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full origin-left animate-grow-x rounded-full bg-primary"
              style={{ width: `${(done / ceremonyMoments.length) * 100}%` }}
            />
          </div>
        </div>
        {(
          [
            ["cerimonia", m.music.ceremony, ceremonyMoments],
            ["festa", m.music.party, partyMoments],
          ] as const
        ).map(([key, label, moments]) => (
          <section
            key={key}
            data-tour={`musicas-${key}`}
            aria-labelledby={`musicas-${key}`}
            className="flex flex-col gap-3"
          >
            <h2
              id={`musicas-${key}`}
              className="font-display text-title2 font-bold tracking-tight"
            >
              {label}
            </h2>
            <ol className="flex flex-col gap-3">
              {moments.map((moment) => (
                <Moment
                  key={moment}
                  moment={moment}
                  list={groups.get(moment) ?? []}
                  editable={editable}
                />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}
