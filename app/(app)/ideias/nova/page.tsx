import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell/page-header";
import { IdeaEditor } from "@/components/ideas/idea-editor";
import { getVendors } from "@/lib/data";
import { m } from "@/lib/i18n";
import { type IdeaBoard, ideaBoards } from "@/lib/ideas";
import { requireWedding } from "@/lib/supabase/server";

export const metadata: Metadata = { title: m.ideas.newIdea };

export default async function NewIdeaPage({
  searchParams,
}: PageProps<"/ideias/nova">) {
  const raw = (await searchParams).quadro;
  const board = ideaBoards.includes(raw as IdeaBoard)
    ? (raw as IdeaBoard)
    : null;
  const [{ wedding }, vendors] = await Promise.all([
    requireWedding(),
    getVendors(),
  ]);
  return (
    <>
      <PageHeader
        title={m.ideas.newIdea}
        back={{ href: "/ideias", label: m.ideas.title }}
      />
      <IdeaEditor
        idea={null}
        weddingId={wedding.id}
        board={board}
        vendors={vendors.map(({ id, name }) => ({ id, name }))}
      />
    </>
  );
}
