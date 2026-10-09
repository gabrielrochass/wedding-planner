import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/app-shell/page-header";
import { IdeaEditor } from "@/components/ideas/idea-editor";
import { getIdea, getVendors } from "@/lib/data";
import { m } from "@/lib/i18n";
import { canHelp } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";

export const metadata: Metadata = { title: m.ideas.editIdea };

export default async function IdeaPage({ params }: PageProps<"/ideias/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [{ wedding, role }, idea, vendors] = await Promise.all([
    requireWedding(),
    getIdea(id),
    getVendors(),
  ]);
  if (!idea) notFound();
  return (
    <>
      <PageHeader
        title={idea.title}
        back={{ href: "/ideias", label: m.ideas.title }}
      />
      {canHelp(role) ? (
        <IdeaEditor
          idea={idea}
          weddingId={wedding.id}
          board={null}
          vendors={vendors.map(({ id: vendorId, name }) => ({
            id: vendorId,
            name,
          }))}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {idea.image_url && (
            // biome-ignore lint/performance/noImgElement: signed URLs from private storage
            <img src={idea.image_url} alt="" className="w-full rounded-2xl" />
          )}
          {idea.notes && (
            <p className="text-body whitespace-pre-line">{idea.notes}</p>
          )}
          <p className="text-subhead text-muted-foreground">
            {m.common.readOnly}
          </p>
        </div>
      )}
    </>
  );
}
