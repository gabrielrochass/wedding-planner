import type { Metadata } from "next";
import { z } from "zod";
import { PageHeader } from "@/components/app-shell/page-header";
import { ExpenseEditor } from "@/components/budget/expense-editor";
import { getBudget } from "@/lib/data";
import { m } from "@/lib/i18n";

export const metadata: Metadata = { title: m.budget.newExpense };

export default async function NewExpensePage({
  searchParams,
}: PageProps<"/orcamento/gastos/novo">) {
  const raw = (await searchParams).categoria;
  const { categories } = await getBudget();
  const parsed = z.uuid().safeParse(raw);
  const categoryId =
    parsed.success && categories.some((c) => c.id === parsed.data)
      ? parsed.data
      : null;

  return (
    <>
      <PageHeader
        title={m.budget.newExpense}
        back={{ href: "/orcamento", label: m.budget.title }}
      />
      <ExpenseEditor
        expense={null}
        categories={categories}
        categoryId={categoryId}
      />
    </>
  );
}
