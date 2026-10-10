import { describe, expect, it } from "vitest";
import {
  monthlySaving,
  paymentState,
  perGuest,
  plannedByCategory,
  remainingBudget,
  splitInstallments,
  starterCategories,
  summarize,
  upcomingPayments,
} from "./budget";

describe("starterCategories", () => {
  it("splits the whole budget", () => {
    expect(starterCategories.reduce((sum, c) => sum + c.percent, 0)).toBe(100);
  });

  it("keeps the reserve out of the planned amounts", () => {
    const planned = plannedByCategory(10_000_000, 10);
    const total = planned.reduce((sum, c) => sum + (c.planned_cents ?? 0), 0);
    expect(total).toBe(9_000_000);
    expect(
      plannedByCategory(null, 10).every((c) => c.planned_cents === null),
    ).toBe(true);
  });

  it("gives more room to what the couple cares about without changing the total", () => {
    const plain = plannedByCategory(8_765_432, 10);
    const photos = plannedByCategory(8_765_432, 10, ["fotos", "lua-de-mel"]);
    const total = (list: typeof plain) =>
      list.reduce((sum, c) => sum + (c.planned_cents ?? 0), 0);
    const of = (list: typeof plain, name: string) =>
      list.find((c) => c.name === name)?.planned_cents ?? 0;
    expect(total(photos)).toBe(total(plain));
    expect(of(photos, "Foto e vídeo")).toBeGreaterThan(
      of(plain, "Foto e vídeo"),
    );
    expect(of(photos, "Lua de mel")).toBeGreaterThan(of(plain, "Lua de mel"));
    expect(of(photos, "Espaço")).toBeLessThan(of(plain, "Espaço"));
  });
});

const expenses = [
  {
    id: "e1",
    category_id: "c1",
    estimated_cents: null,
    contracted_cents: 1_800_000,
  },
  {
    id: "e2",
    category_id: "c2",
    estimated_cents: 500_000,
    contracted_cents: null,
  },
];
const payments = [
  {
    id: "p1",
    expense_id: "e1",
    amount_cents: 600_000,
    due_on: "2027-03-10",
    paid_on: "2027-03-10",
  },
  {
    id: "p2",
    expense_id: "e1",
    amount_cents: 600_000,
    due_on: "2027-04-10",
    paid_on: null,
  },
  {
    id: "p3",
    expense_id: "e1",
    amount_cents: 600_000,
    due_on: "2027-02-10",
    paid_on: null,
  },
];

describe("summarize", () => {
  it("adds committed, contracted and paid per category", () => {
    const { byCategory, total } = summarize(
      [
        { id: "c1", planned_cents: 2_000_000 },
        { id: "c2", planned_cents: null },
      ],
      expenses,
      payments,
    );
    expect(byCategory.get("c1")).toEqual({
      planned: 2_000_000,
      committed: 1_800_000,
      contracted: 1_800_000,
      paid: 600_000,
    });
    expect(byCategory.get("c2")).toEqual({
      planned: 0,
      committed: 500_000,
      contracted: 0,
      paid: 0,
    });
    expect(total).toEqual({
      planned: 2_000_000,
      committed: 2_300_000,
      contracted: 1_800_000,
      paid: 600_000,
    });
  });
});

describe("remainingBudget", () => {
  it("subtracts the reserve and what is committed", () => {
    expect(remainingBudget(8_000_000, 10, 2_300_000)).toBe(4_900_000);
    expect(remainingBudget(null, 10, 2_300_000)).toBeNull();
  });
});

describe("splitInstallments", () => {
  it("puts leftover cents on the first installment and keeps the day", () => {
    expect(splitInstallments(100_000, 3, "2027-01-31")).toEqual([
      {
        amount_cents: 33_334,
        due_on: "2027-01-31",
        installment_number: 1,
        installment_count: 3,
      },
      {
        amount_cents: 33_333,
        due_on: "2027-02-28",
        installment_number: 2,
        installment_count: 3,
      },
      {
        amount_cents: 33_333,
        due_on: "2027-03-31",
        installment_number: 3,
        installment_count: 3,
      },
    ]);
  });
});

describe("payments", () => {
  it("knows the state of each payment", () => {
    expect(
      paymentState(
        { due_on: "2027-03-10", paid_on: "2027-03-01" },
        "2027-04-01",
      ),
    ).toBe("paid");
    expect(
      paymentState({ due_on: "2027-03-10", paid_on: null }, "2027-04-01"),
    ).toBe("overdue");
    expect(
      paymentState({ due_on: "2027-04-20", paid_on: null }, "2027-04-01"),
    ).toBe("soon");
    expect(
      paymentState({ due_on: "2027-08-20", paid_on: null }, "2027-04-01"),
    ).toBe("later");
  });

  it("lists unpaid payments by due date", () => {
    expect(upcomingPayments(payments, 5).map((p) => p.id)).toEqual([
      "p3",
      "p2",
    ]);
  });
});

describe("planning helpers", () => {
  it("rounds monthly savings up to whole reais", () => {
    expect(monthlySaving(1_000_000, "2028-02-20", "2027-12-15")).toBe(333_400);
    expect(monthlySaving(0, "2028-02-20", "2027-12-15")).toBeNull();
    expect(monthlySaving(1_000, null, "2027-12-15")).toBeNull();
  });

  it("divides the cost by guests", () => {
    expect(perGuest(3_000_000, 150)).toBe(20_000);
    expect(perGuest(3_000_000, 0)).toBeNull();
  });
});
