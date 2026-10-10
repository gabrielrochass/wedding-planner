import { describe, expect, it } from "vitest";
import { popupPlacement, tourToOpen } from "./tour";

describe("popupPlacement", () => {
  const viewport = { width: 390, height: 844 };
  const popup = { width: 320, height: 180 };

  it("opens above a target at the bottom of the screen", () => {
    const tabBarItem = { top: 790, left: 160, width: 70, height: 44 };
    const placement = popupPlacement(tabBarItem, viewport, popup);
    expect(placement.side).toBe("above");
    expect(placement.top).toBe(790 - 16 - 180);
  });

  it("opens below a target near the top", () => {
    const button = { top: 40, left: 330, width: 44, height: 44 };
    const placement = popupPlacement(button, viewport, popup);
    expect(placement.side).toBe("below");
    expect(placement.top).toBe(100);
  });

  it("docks at the bottom when a tall section leaves no room", () => {
    const section = { top: 60, left: 8, width: 374, height: 700 };
    const placement = popupPlacement(section, viewport, popup);
    expect(placement.side).toBe("docked");
    expect(placement.top).toBe(844 - 16 - 180);
  });

  it("stays inside the screen gutters", () => {
    const button = { top: 40, left: 330, width: 44, height: 44 };
    expect(popupPlacement(button, viewport, popup).left).toBe(390 - 16 - 320);
    const corner = { top: 40, left: 0, width: 44, height: 44 };
    expect(popupPlacement(corner, viewport, popup).left).toBe(16);
  });
});

describe("tourToOpen", () => {
  it("starts with the general tour wherever the person lands", () => {
    expect(tourToOpen("/tarefas", [], null)).toBe("geral");
  });

  it("then opens each page tour once", () => {
    expect(tourToOpen("/tarefas", ["geral"], null)).toBe("tarefas");
    expect(tourToOpen("/tarefas", ["geral", "tarefas"], null)).toBeNull();
    expect(tourToOpen("/tarefas/nova", ["geral"], null)).toBeNull();
  });

  it("replays on request", () => {
    expect(tourToOpen("/tarefas", ["geral", "tarefas"], "1")).toBe("tarefas");
    expect(tourToOpen("/orcamento", ["geral"], "geral")).toBe("geral");
  });
});
