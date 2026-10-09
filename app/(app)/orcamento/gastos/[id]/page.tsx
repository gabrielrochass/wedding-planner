import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/app-shell/page-header";
import { ExpenseEditor } from "@/components/budget/expense-editor";
import { PaymentList } from "@/components/budget/payments";
import { getBudget, getVendors } from "@/lib/data";
import { m } from "@/lib/i18n";
import { canEdit } from "@/lib/roles";
import { requireWedding } from "@/lib/supabase/server";

export const metadata: Metadata = { title: m.budget.editExpense };

export default async function ExpensePage({
  params,
}: PageProps<"/orcamento/gastos/[id]">) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [{ role }, budget, vendors] = await Promise.all([
    requireWedding(),
    getBudget(),
    getVendors(),
  ]);
  const expense = budget.expenses.find((e) => e.id === id);
  if (!expense) notFound();
  const category = budget.categories.find((c) => c.id === expense.category_id);
  const vendor = vendors.find((v) => v.id === expense.vendor_id);
  const editable = canEdit(role);

  return (
    <>
      <PageHeader
        title={expense.title}
        back={{
          href: `/orcamento/categorias/${expense.category_id}` as Route,
          label: category?.name ?? m.budget.title,
        }}
      />
      <div className="flex flex-col gap-10">
        {vendor && (
          <Link
            href={`/fornecedores/${vendor.id}` as Route}
            className="-mt-4 flex min-h-11 w-fit items-center text-subhead font-medium text-link"
          >
            {vendor.name}
          </Link>
        )}
        <PaymentList
          expenseId={expense.id}
          payments={budget.payments.filter((p) => p.expense_id === id)}
          contributors={budget.contributors}
          editable={editable}
        />
        {editable && (
          <ExpenseEditor
            expense={expense}
            categories={budget.categories}
            categoryId={null}
          />
        )}
      </div>
    </>
  );
}
