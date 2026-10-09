import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/app-shell/page-header";
import { CategoryEditor } from "@/components/budget/category-editor";
import { getBudget } from "@/lib/data";
import { m } from "@/lib/i18n";

export const metadata: Metadata = { title: m.budget.editCategory };

export default async function EditCategoryPage({
  params,
}: PageProps<"/orcamento/categorias/[id]/editar">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { categories } = await getBudget();
  const category = categories.find((c) => c.id === id);
  if (!category) notFound();
  return (
    <>
      <PageHeader
        title={m.budget.editCategory}
        back={{
          href: `/orcamento/categorias/${id}` as Route,
          label: category.name,
        }}
      />
      <CategoryEditor category={category} />
    </>
  );
}
