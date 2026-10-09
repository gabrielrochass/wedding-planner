import { describe, expect, it } from "vitest";
import { headcount, initials, parseGuestLines } from "./guests";

describe("headcount", () => {
  const households = [
    {
      id: "1",
      side: "a",
      list: "a",
      save_the_date_on: "2027-06-01",
      invited_on: "2027-11-01",
      thanked_on: null,
      gift: "Panelas",
    },
    {
      id: "2",
      side: "b",
      list: "a",
      save_the_date_on: "2027-06-01",
      invited_on: null,
      thanked_on: null,
      gift: null,
    },
    {
      id: "3",
      side: "both",
      list: "b",
      save_the_date_on: null,
      invited_on: null,
      thanked_on: null,
      gift: null,
    },
  ] as const;
  const guests = [
    { household_id: "1", age_band: "adult", rsvp: "yes" },
    { household_id: "1", age_band: "child", rsvp: "yes" },
    { household_id: "2", age_band: "adult", rsvp: "no" },
    { household_id: "2", age_band: "baby", rsvp: "pending" },
    { household_id: "3", age_band: "adult", rsvp: "pending" },
  ] as const;
  const count = headcount([...households], [...guests]);

  it("counts only list A as invited", () => {
    expect(count.invitedGuests).toBe(4);
    expect(count.byList).toEqual({ pending: 0, a: 4, b: 1, out: 0 });
    expect(count.expectedGuests).toBe(3);
  });

  it("splits by side, age and answer", () => {
    expect(count.bySide).toEqual({ a: 2, b: 2, both: 0 });
    expect(count.bands).toEqual({ adult: 2, teen: 0, child: 1, baby: 1 });
    expect(count.rsvp).toEqual({ pending: 1, yes: 2, no: 1 });
  });

  it("tracks the invitation funnel by household", () => {
    expect(count.funnel).toEqual({
      listed: 2,
      saveTheDate: 2,
      invited: 1,
      answered: 1,
    });
    expect(count.gifts).toBe(1);
    expect(count.thanked).toBe(0);
  });
});

describe("parseGuestLines", () => {
  it("turns each line into a household with its people", () => {
    expect(
      parseGuestLines(
        "Rita e Theo Souza\n- Tio João, Tia Lu\n\n1. Vó Maria\nrita e theo souza",
      ),
    ).toEqual([
      { name: "Rita e Theo Souza", members: ["Rita", "Theo Souza"] },
      { name: "Tio João, Tia Lu", members: ["Tio João", "Tia Lu"] },
      { name: "Vó Maria", members: ["Vó Maria"] },
    ]);
  });

  it("keeps names that contain the letter e", () => {
    expect(parseGuestLines("Helena Esteves")[0].members).toEqual([
      "Helena Esteves",
    ]);
  });
});

describe("initials", () => {
  it("uses first and last meaningful words", () => {
    expect(initials("Família Souza")).toBe("FS");
    expect(initials("Rita e Theo da Silva")).toBe("RS");
    expect(initials("ana")).toBe("A");
  });
});
