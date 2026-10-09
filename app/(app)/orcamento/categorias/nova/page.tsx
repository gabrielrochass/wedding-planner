import type { Metadata } from "next";
import { PageHeader } from "@/components/app-shell/page-header";
import { CategoryEditor } from "@/components/budget/category-editor";
import { m } from "@/lib/i18n";

export const metadata: Metadata = { title: m.budget.newCategory };

export default function NewCategoryPage() {
  return (
    <>
      <PageHeader
        title={m.budget.newCategory}
        back={{ href: "/orcamento", label: m.budget.title }}
      />
      <CategoryEditor category={null} />
    </>
  );
}
