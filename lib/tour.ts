export type Box = { top: number; left: number; width: number; height: number };

export type Size = { width: number; height: number };

export function popupPlacement(
  target: Box,
  viewport: Size,
  popup: Size,
  gap = 16,
  gutter = 16,
) {
  const below = viewport.height - (target.top + target.height) - gap - gutter;
  const above = target.top - gap - gutter;
  const side =
    below >= popup.height
      ? "below"
      : above >= popup.height
        ? "above"
        : "docked";
  const wanted =
    side === "below"
      ? target.top + target.height + gap
      : side === "above"
        ? target.top - gap - popup.height
        : viewport.height - gutter - popup.height;
  const top = Math.max(
    gutter,
    Math.min(wanted, viewport.height - gutter - popup.height),
  );
  const centered = target.left + target.width / 2 - popup.width / 2;
  const left = Math.max(
    gutter,
    Math.min(centered, viewport.width - gutter - popup.width),
  );
  return { side, top, left };
}

export const pageTours = {
  "/": "inicio",
  "/tarefas": "tarefas",
  "/orcamento": "orcamento",
  "/fornecedores": "fornecedores",
  "/convidados": "convidados",
  "/mais": "mais",
  "/equipe": "equipe",
  "/ideias": "ideias",
  "/musicas": "musicas",
  "/cortejo": "cortejo",
  "/cronograma": "cronograma",
  "/enxoval": "enxoval",
  "/ajustes": "ajustes",
} as const;

export type PageTour = (typeof pageTours)[keyof typeof pageTours];
export type TourId = "geral" | PageTour;

export const tourIds = [
  "geral",
  ...Object.values(pageTours),
] as readonly TourId[];

export function tourForPath(pathname: string): PageTour | null {
  return pageTours[pathname as keyof typeof pageTours] ?? null;
}

export function tourToOpen(
  pathname: string,
  seen: readonly string[],
  requested: string | null,
): TourId | null {
  const page = tourForPath(pathname);
  if (requested === "geral") return "geral";
  if (requested === "1") return page;
  if (!seen.includes("geral")) return "geral";
  return page && !seen.includes(page) ? page : null;
}
