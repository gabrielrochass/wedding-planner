import { describe, expect, it } from "vitest";
import { guessRoom, homeSummary, parseHomeRows } from "./home";

describe("guessRoom", () => {
  it("places common items in the right room", () => {
    expect(guessRoom("Jogo de panelas")).toBe("cozinha");
    expect(guessRoom("Taças de vinho")).toBe("mesa");
    expect(guessRoom("Jogo de lençol queen")).toBe("quarto");
    expect(guessRoom("Toalhas de banho")).toBe("banheiro");
    expect(guessRoom("Air fryer")).toBe("eletro");
    expect(guessRoom("Vassoura")).toBe("lavanderia");
    expect(guessRoom("Coisa estranha")).toBe("outros");
  });
});

describe("parseHomeRows", () => {
  it("reads rows pasted from a spreadsheet", () => {
    const pasted = [
      "Item\tQuantidade\tPreço\tComprado",
      "Jogo de panelas\t1\tR$ 599,90\tsim",
      "Taças de vinho\t6\t25,00\t",
      "",
      "Banheiro",
      "Toalha de rosto\t4",
      "jogo de panelas\t1",
    ].join("\n");
    expect(parseHomeRows(pasted)).toEqual([
      {
        name: "Jogo de panelas",
        room: "cozinha",
        quantity: 1,
        estimate_cents: 59990,
        status: "bought",
      },
      {
        name: "Taças de vinho",
        room: "mesa",
        quantity: 6,
        estimate_cents: 2500,
        status: "missing",
      },
      {
        name: "Toalha de rosto",
        room: "banheiro",
        quantity: 4,
        estimate_cents: null,
        status: "missing",
      },
    ]);
  });

  it("reads a plain list of names", () => {
    expect(
      parseHomeRows("- Liquidificador\n- Edredom").map((item) => [
        item.name,
        item.room,
      ]),
    ).toEqual([
      ["Liquidificador", "eletro"],
      ["Edredom", "quarto"],
    ]);
  });
});

describe("homeSummary", () => {
  it("adds up progress, estimate and what is still missing", () => {
    const summary = homeSummary([
      {
        room: "cozinha",
        quantity: 2,
        priority: "essential",
        status: "missing",
        estimate_cents: 1000,
        paid_cents: null,
      },
      {
        room: "cozinha",
        quantity: 1,
        priority: "important",
        status: "bought",
        estimate_cents: 5000,
        paid_cents: 4500,
      },
      {
        room: "quarto",
        quantity: 1,
        priority: "nice",
        status: "gifted",
        estimate_cents: 3000,
        paid_cents: null,
      },
    ]);
    expect(summary.total).toBe(3);
    expect(summary.done).toBe(2);
    expect(summary.estimate).toBe(10_000);
    expect(summary.remaining).toBe(2_000);
    expect(summary.spent).toBe(4_500);
    expect(summary.essentialsMissing).toBe(1);
    expect(summary.byRoom.get("cozinha")).toEqual({ total: 2, done: 1 });
  });
});
