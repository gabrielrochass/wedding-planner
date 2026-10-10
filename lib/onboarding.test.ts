import { describe, expect, it } from "vitest";
import { toggle, weddingDateFor } from "./onboarding";

describe("weddingDateFor", () => {
  it("keeps an exact date as is", () => {
    expect(weddingDateFor("exact", "2028-02-20", "")).toEqual({
      date: "2028-02-20",
      estimate: false,
    });
  });

  it("plans from the first day of an estimated month", () => {
    expect(weddingDateFor("month", "2028-02-20", "2028-02")).toEqual({
      date: "2028-02-01",
      estimate: true,
    });
  });

  it("has no date while the couple does not know it", () => {
    expect(weddingDateFor("unknown", "2028-02-20", "2028-02")).toEqual({
      date: null,
      estimate: false,
    });
    expect(weddingDateFor("month", "", "")).toEqual({
      date: null,
      estimate: false,
    });
  });
});

describe("toggle", () => {
  it("adds and removes a choice", () => {
    expect(toggle(["a"], "b")).toEqual(["a", "b"]);
    expect(toggle(["a", "b"], "a")).toEqual(["b"]);
  });

  it("stops adding at the limit but still removes", () => {
    expect(toggle(["a", "b", "c"], "d", 3)).toEqual(["a", "b", "c"]);
    expect(toggle(["a", "b", "c"], "b", 3)).toEqual(["a", "c"]);
  });
});
