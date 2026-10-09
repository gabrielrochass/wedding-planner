import { describe, expect, it } from "vitest";
import { boardSummary, imagePath } from "./ideas";
import { chosenCount, linkKind, searchLinks, songsByMoment } from "./music";
import { moveRow, pairs } from "./party";
import { currentItem, formatTime, overlaps } from "./timeline";

describe("music", () => {
  const songs = [
    { id: "1", moment: "entrada-noiva", chosen: false },
    { id: "2", moment: "entrada-noiva", chosen: true },
    { id: "3", moment: "festa", chosen: true },
    { id: "4", moment: "votos", chosen: true },
  ];

  it("puts the chosen song first in its moment", () => {
    expect(
      songsByMoment(songs)
        .get("entrada-noiva")
        ?.map((s) => s.id),
    ).toEqual(["2", "1"]);
  });

  it("counts ceremony moments with a chosen song", () => {
    expect(chosenCount(songs)).toBe(2);
  });

  it("recognizes streaming links", () => {
    expect(linkKind("https://open.spotify.com/track/1")).toBe("spotify");
    expect(linkKind("https://youtu.be/abc")).toBe("youtube");
    expect(linkKind("https://music.youtube.com/watch?v=1")).toBe("youtube");
    expect(linkKind("https://example.com")).toBe("other");
  });

  it("builds search links", () => {
    expect(searchLinks("Can I Have This Dance", "HSM").spotify).toBe(
      "https://open.spotify.com/search/Can%20I%20Have%20This%20Dance%20HSM",
    );
  });
});

describe("party", () => {
  const members = [
    { id: "lia", side: "a", pair_id: "rafa", entrance_order: 0 },
    { id: "rafa", side: "b", pair_id: "lia", entrance_order: 1 },
    { id: "theo", side: "b", pair_id: null, entrance_order: 2 },
    { id: "ana", side: "both", pair_id: null, entrance_order: 3 },
  ] as const;

  it("walks pairs together, each on their side", () => {
    expect(
      pairs([...members]).map((row) => [
        row.left?.id ?? null,
        row.right?.id ?? null,
      ]),
    ).toEqual([
      ["lia", "rafa"],
      [null, "theo"],
      ["ana", null],
    ]);
  });

  it("moves a whole row and keeps pairs together", () => {
    expect(moveRow([...members], "theo", -1)).toEqual([
      { id: "theo", entrance_order: 1 },
      { id: "lia", entrance_order: 2 },
      { id: "rafa", entrance_order: 3 },
      { id: "ana", entrance_order: 4 },
    ]);
    expect(moveRow([...members], "lia", -1)).toBeNull();
  });
});

describe("timeline", () => {
  const items = [
    { id: "a", starts_at: "16:00:00", ends_at: "17:00:00" },
    { id: "b", starts_at: "16:30:00", ends_at: null },
    { id: "c", starts_at: "18:00:00", ends_at: null },
  ];

  it("formats times the Brazilian way", () => {
    expect(formatTime("16:30:00")).toBe("16h30");
  });

  it("flags clashing times", () => {
    expect([...overlaps(items)].sort()).toEqual(["a", "b"]);
  });

  it("knows what is happening now", () => {
    expect(currentItem(items, "17:10")?.id).toBe("b");
    expect(currentItem(items, "15:00")).toBeNull();
  });
});

describe("ideas", () => {
  it("adds up approved ideas per board and ignores discarded ones", () => {
    const summary = boardSummary([
      { board: "decoracao", status: "approved", estimate_cents: 50_000 },
      { board: "decoracao", status: "idea", estimate_cents: 99_000 },
      { board: "decoracao", status: "discarded", estimate_cents: 10_000 },
    ]);
    expect(summary.get("decoracao")).toEqual({
      count: 2,
      approved: 1,
      estimate: 50_000,
    });
  });

  it("stores photos inside the wedding folder", () => {
    expect(imagePath("w", "i", "f")).toBe("w/i/f.webp");
  });
});
