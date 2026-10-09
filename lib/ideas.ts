export const ideaBoards = [
  "decoracao",
  "papelaria",
  "bolo-doces",
  "traje",
  "fotos",
  "lembrancinhas",
  "padrinhos",
  "atividades",
  "votos",
  "outros",
] as const;

export type IdeaBoard = (typeof ideaBoards)[number];

export type IdeaRow = {
  board: string;
  status: "idea" | "approved" | "discarded";
  estimate_cents: number | null;
};

export function boardSummary(ideas: readonly IdeaRow[]) {
  const summary = new Map<
    IdeaBoard,
    { count: number; approved: number; estimate: number }
  >();
  for (const board of ideaBoards)
    summary.set(board, { count: 0, approved: 0, estimate: 0 });
  for (const idea of ideas) {
    const row = summary.get(idea.board as IdeaBoard);
    if (!row || idea.status === "discarded") continue;
    row.count += 1;
    if (idea.status === "approved") {
      row.approved += 1;
      row.estimate += idea.estimate_cents ?? 0;
    }
  }
  return summary;
}

export function imagePath(weddingId: string, ideaId: string, fileId: string) {
  return `${weddingId}/${ideaId}/${fileId}.webp`;
}
