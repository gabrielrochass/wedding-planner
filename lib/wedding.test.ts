import { describe, expect, it } from "vitest";
import { cheapestQuote, normalizeInstagram, safeWebsite } from "./vendors";
import {
  daysUntil,
  journey,
  milestones,
  overallProgress,
  ratio,
} from "./wedding";
import { formatPhone, normalizePhone, whatsappLink } from "./whatsapp";

describe("wedding", () => {
  it("counts days until the wedding", () => {
    expect(daysUntil("2028-02-20", "2026-10-09")).toBe(499);
    expect(daysUntil(null, "2026-10-09")).toBeNull();
  });

  it("marks the journey around the current phase", () => {
    const steps = journey("2028-02-20", "2027-12-01");
    expect(steps.find((s) => s.state === "current")?.key).toBe("3m");
    expect(steps.filter((s) => s.state === "past").map((s) => s.key)).toEqual([
      "12m",
      "9m",
      "6m",
    ]);
    expect(
      journey(null, "2027-12-01").every((s) => s.state === "upcoming"),
    ).toBe(true);
  });

  it("averages only the parts that exist", () => {
    expect(ratio(1, 4)).toBe(0.25);
    expect(ratio(1, 0)).toBeNull();
    expect(overallProgress([0.5, null, 1])).toBe(0.75);
    expect(overallProgress([null])).toBe(0);
  });

  it("reaches milestones from real numbers", () => {
    const reached = milestones({
      hasDate: true,
      hiredVendors: 1,
      listedHouseholds: 9,
      savedTheDate: 0,
      invitedHouseholds: 0,
      tasksDone: 5,
      tasksTotal: 10,
      confirmedGuests: 0,
      expectedGuests: 0,
      committed: 100,
      paid: 100,
    })
      .filter((item) => item.reached)
      .map((item) => item.key);
    expect(reached).toEqual([
      "date",
      "firstVendor",
      "halfChecklist",
      "allPaid",
    ]);
  });
});

describe("whatsapp", () => {
  it("normalizes Brazilian phones", () => {
    expect(normalizePhone("(81) 99999-0000")).toBe("5581999990000");
    expect(normalizePhone("+55 81 3333-4444")).toBe("558133334444");
    expect(normalizePhone("12345")).toBeNull();
  });

  it("formats and links phones", () => {
    expect(formatPhone("81999990000")).toBe("(81) 99999-0000");
    expect(whatsappLink("81999990000", "Oi, tudo bem?")).toBe(
      "https://wa.me/5581999990000?text=Oi%2C%20tudo%20bem%3F",
    );
    expect(whatsappLink("abc", "Oi")).toBeNull();
  });
});

describe("vendors", () => {
  it("finds the cheapest quote", () => {
    expect(
      cheapestQuote([
        { id: "a", category_id: "c", status: "quoted", quote_cents: 300 },
        { id: "b", category_id: "c", status: "quoted", quote_cents: 200 },
        { id: "c", category_id: "c", status: "quoted", quote_cents: null },
      ]),
    ).toBe("b");
  });

  it("cleans instagram handles and websites", () => {
    expect(normalizeInstagram("https://www.instagram.com/sitio.flores/")).toBe(
      "sitio.flores",
    );
    expect(normalizeInstagram("@sitio_flores")).toBe("sitio_flores");
    expect(normalizeInstagram("nome com espaço")).toBeNull();
    expect(safeWebsite("sitio.com.br")).toBe("https://sitio.com.br/");
    expect(safeWebsite("javascript:alert(1)") ?? "").not.toMatch(
      /^javascript:/,
    );
  });
});
