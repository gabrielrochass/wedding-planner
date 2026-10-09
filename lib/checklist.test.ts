import { describe, expect, it } from "vitest";
import {
  currentPhase,
  daysBefore,
  dueDate,
  groupByPhase,
  phaseFor,
  starterTasks,
  taskState,
} from "./checklist";

describe("starterTasks", () => {
  it("includes church steps only for religious ceremonies", () => {
    const civil = starterTasks("civil").map((t) => t.template_key);
    const both = starterTasks("both").map((t) => t.template_key);
    expect(civil).not.toContain("curso-noivos");
    expect(both).toContain("curso-noivos");
    expect(both).toContain("processo-igreja");
  });

  it("always asks for the civil registry application within its 90 day validity", () => {
    for (const ceremony of ["civil", "religious", "both"] as const) {
      const task = starterTasks(ceremony).find(
        (t) => t.template_key === "habilitacao",
      );
      expect(task?.offset_days).toBeLessThanOrEqual(90);
    }
  });

  it("registers the religious wedding afterwards only when it has civil effect", () => {
    expect(
      starterTasks("religious").some(
        (t) => t.template_key === "registro-civil",
      ),
    ).toBe(true);
    expect(
      starterTasks("both").some((t) => t.template_key === "registro-civil"),
    ).toBe(false);
  });

  it("never uses dashes or middle dots in titles and notes", () => {
    for (const task of starterTasks("religious")) {
      expect(`${task.title} ${task.notes ?? ""}`).not.toMatch(/[—–·]/);
    }
  });
});

describe("dueDate", () => {
  it("counts back from the wedding date", () => {
    expect(dueDate({ offset_days: 80, due_on: null }, "2028-02-20")).toBe(
      "2027-12-02",
    );
  });

  it("prefers a fixed date", () => {
    expect(
      dueDate({ offset_days: 80, due_on: "2027-11-01" }, "2028-02-20"),
    ).toBe("2027-11-01");
  });

  it("has no date without a wedding date or a fixed date", () => {
    expect(dueDate({ offset_days: 80, due_on: null }, null)).toBeNull();
  });
});

describe("phases", () => {
  it("maps days before the wedding to a phase", () => {
    expect(phaseFor(400)).toBe("12m");
    expect(phaseFor(330)).toBe("12m");
    expect(phaseFor(200)).toBe("6m");
    expect(phaseFor(30)).toBe("1m");
    expect(phaseFor(7)).toBe("weeks");
    expect(phaseFor(0)).toBe("day");
    expect(phaseFor(-30)).toBe("after");
    expect(phaseFor(null)).toBe("undated");
  });

  it("uses the fixed date against the wedding date", () => {
    expect(
      daysBefore({ offset_days: null, due_on: "2028-02-10" }, "2028-02-20"),
    ).toBe(10);
  });

  it("groups tasks by phase, earliest first", () => {
    const groups = groupByPhase(
      [
        { id: "a", offset_days: 300, due_on: null },
        { id: "b", offset_days: 350, due_on: null },
        { id: "c", offset_days: 10, due_on: null },
        { id: "d", offset_days: null, due_on: null },
      ],
      "2028-02-20",
    );
    expect(groups.map(([key, list]) => [key, list.map((t) => t.id)])).toEqual([
      ["12m", ["b"]],
      ["9m", ["a"]],
      ["weeks", ["c"]],
      ["undated", ["d"]],
    ]);
  });

  it("knows where the couple is today", () => {
    expect(currentPhase("2028-02-20", "2026-10-09")).toBe("12m");
    expect(currentPhase("2028-02-20", "2028-01-10")).toBe("1m");
    expect(currentPhase(null, "2026-10-09")).toBeNull();
  });
});

describe("taskState", () => {
  const today = "2027-12-01";
  it("flags overdue, soon and later tasks", () => {
    expect(
      taskState(
        { offset_days: 90, due_on: null, done_at: null },
        "2028-02-20",
        today,
      ),
    ).toBe("overdue");
    expect(
      taskState(
        { offset_days: 80, due_on: null, done_at: null },
        "2028-02-20",
        today,
      ),
    ).toBe("soon");
    expect(
      taskState(
        { offset_days: 10, due_on: null, done_at: null },
        "2028-02-20",
        today,
      ),
    ).toBe("later");
    expect(
      taskState(
        { offset_days: 10, due_on: null, done_at: "x" },
        "2028-02-20",
        today,
      ),
    ).toBe("done");
    expect(
      taskState({ offset_days: 10, due_on: null, done_at: null }, null, today),
    ).toBe("undated");
  });
});
