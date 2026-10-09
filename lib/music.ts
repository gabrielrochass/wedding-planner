export const ceremonyMoments = [
  "entrada-padrinhos",
  "entrada-pais",
  "entrada-noivo",
  "entrada-floristas",
  "entrada-aliancas",
  "entrada-noiva",
  "louvor-cerimonia",
  "votos",
  "beijo",
  "saida",
] as const;

export const partyMoments = [
  "entrada-salao",
  "primeira-danca",
  "louvor-ceia",
  "buque",
  "bolo",
  "festa",
  "nao-tocar",
] as const;

export const musicMoments = [...ceremonyMoments, ...partyMoments] as const;

export type MusicMoment = (typeof musicMoments)[number];

export type SongRow = { id: string; moment: string; chosen: boolean };

export function songsByMoment<T extends SongRow>(songs: readonly T[]) {
  const groups = new Map<MusicMoment, T[]>();
  for (const moment of musicMoments) groups.set(moment, []);
  for (const song of songs) groups.get(song.moment as MusicMoment)?.push(song);
  for (const list of groups.values()) {
    list.sort((a, b) => Number(b.chosen) - Number(a.chosen));
  }
  return groups;
}

export function chosenCount(songs: readonly SongRow[]) {
  const moments = new Set(
    songs
      .filter(
        (song) =>
          song.chosen && song.moment !== "nao-tocar" && song.moment !== "festa",
      )
      .map((song) => song.moment),
  );
  return moments.size;
}

export type LinkKind = "spotify" | "youtube" | "other";

export function linkKind(url: string): LinkKind {
  const host = URL.parse(url)?.hostname.replace(/^www\./, "") ?? "";
  if (host === "open.spotify.com" || host === "spotify.link") return "spotify";
  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtu.be" ||
    host === "music.youtube.com"
  ) {
    return "youtube";
  }
  return "other";
}

export function searchLinks(title: string, artist: string | null) {
  const query = encodeURIComponent([title, artist].filter(Boolean).join(" "));
  return {
    spotify: `https://open.spotify.com/search/${query}`,
    youtube: `https://www.youtube.com/results?search_query=${query}`,
  };
}
