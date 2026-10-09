import { addMonthsToDate, daysBetween, monthsBetween } from "@/lib/dates";

export const defaultContingency = 10;

export type StarterCategory = { name: string; icon: string; percent: number };

export const starterCategories: readonly StarterCategory[] = [
  { name: "Espaço", icon: "building", percent: 18 },
  { name: "Buffet e bebidas", icon: "utensils", percent: 32 },
  { name: "Foto e vídeo", icon: "camera", percent: 10 },
  { name: "Decoração e flores", icon: "flower", percent: 9 },
  { name: "Música", icon: "music", percent: 6 },
  { name: "Traje e beleza", icon: "shirt", percent: 7 },
  { name: "Bolo e doces", icon: "cake", percent: 4 },
  { name: "Alianças", icon: "gem", percent: 3 },
  { name: "Convites e papelaria", icon: "mail", percent: 2 },
  { name: "Cerimônia e documentos", icon: "church", percent: 2 },
  { name: "Lua de mel", icon: "plane", percent: 5 },
  { name: "Lembrancinhas e extras", icon: "gift", percent: 2 },
];

export function contingencyCents(budget: number, percent: number) {
  return Math.round((budget * percent) / 100);
}

export function plannedByCategory(
  budget: number | null,
  contingencyPercent: number,
) {
  return starterCategories.map((category) => ({
    name: category.name,
    icon: category.icon,
    planned_cents:
      budget === null
        ? null
        : Math.round(
            ((budget - contingencyCents(budget, contingencyPercent)) *
              category.percent) /
              100,
          ),
  }));
}

export type ExpenseRow = {
  id: string;
  category_id: string;
  estimated_cents: number | null;
  contracted_cents: number | null;
};

export type PaymentRow = {
  id: string;
  expense_id: string;
  amount_cents: number;
  due_on: string;
  paid_on: string | null;
  contributor_id: string | null;
};

export function expenseCost(expense: ExpenseRow) {
  return expense.contracted_cents ?? expense.estimated_cents ?? 0;
}

export function isContracted(expense: ExpenseRow) {
  return expense.contracted_cents !== null;
}

export type CategoryTotals = {
  planned: number;
  committed: number;
  contracted: number;
  paid: number;
};

const emptyTotals = (): CategoryTotals => ({
  planned: 0,
  committed: 0,
  contracted: 0,
  paid: 0,
});

export function summarize(
  categories: readonly { id: string; planned_cents: number | null }[],
  expenses: readonly ExpenseRow[],
  payments: readonly PaymentRow[],
) {
  const byCategory = new Map<string, CategoryTotals>();
  for (const category of categories) {
    byCategory.set(category.id, {
      ...emptyTotals(),
      planned: category.planned_cents ?? 0,
    });
  }
  const categoryOf = new Map(expenses.map((e) => [e.id, e.category_id]));
  for (const expense of expenses) {
    const totals = byCategory.get(expense.category_id);
    if (!totals) continue;
    totals.committed += expenseCost(expense);
    if (isContracted(expense)) totals.contracted += expenseCost(expense);
  }
  for (const payment of payments) {
    if (!payment.paid_on) continue;
    const category = categoryOf.get(payment.expense_id);
    const totals = category ? byCategory.get(category) : undefined;
    if (totals) totals.paid += payment.amount_cents;
  }
  const total = emptyTotals();
  for (const totals of byCategory.values()) {
    total.planned += totals.planned;
    total.committed += totals.committed;
    total.contracted += totals.contracted;
    total.paid += totals.paid;
  }
  return { byCategory, total };
}

export function remainingBudget(
  budget: number | null,
  contingencyPercent: number,
  committed: number,
) {
  if (budget === null) return null;
  return budget - contingencyCents(budget, contingencyPercent) - committed;
}

export function perGuest(cents: number, guests: number) {
  return guests > 0 ? Math.round(cents / guests) : null;
}

export function splitInstallments(
  total: number,
  count: number,
  firstDue: string,
  everyMonths = 1,
) {
  const base = Math.floor(total / count);
  const leftover = total - base * count;
  return Array.from({ length: count }, (_, index) => ({
    amount_cents: base + (index === 0 ? leftover : 0),
    due_on: addMonthsToDate(firstDue, index * everyMonths),
    installment_number: index + 1,
    installment_count: count,
  }));
}

export type PaymentState = "paid" | "overdue" | "soon" | "later";

export function paymentState(
  payment: Pick<PaymentRow, "due_on" | "paid_on">,
  today: string,
): PaymentState {
  if (payment.paid_on) return "paid";
  if (payment.due_on < today) return "overdue";
  return daysBetween(today, payment.due_on) <= 30 ? "soon" : "later";
}

export function upcomingPayments<T extends PaymentRow>(
  payments: readonly T[],
  limit: number,
) {
  return payments
    .filter((payment) => !payment.paid_on)
    .toSorted((a, b) => a.due_on.localeCompare(b.due_on))
    .slice(0, limit);
}

export function unpaidTotal(payments: readonly PaymentRow[]) {
  return payments
    .filter((payment) => !payment.paid_on)
    .reduce((sum, payment) => sum + payment.amount_cents, 0);
}

export function contributorTotals(
  contributors: readonly { id: string; promised_cents: number | null }[],
  payments: readonly PaymentRow[],
) {
  const paid = new Map<string, number>();
  for (const payment of payments) {
    if (!payment.paid_on || !payment.contributor_id) continue;
    paid.set(
      payment.contributor_id,
      (paid.get(payment.contributor_id) ?? 0) + payment.amount_cents,
    );
  }
  return contributors.map((contributor) => ({
    id: contributor.id,
    promised: contributor.promised_cents,
    paid: paid.get(contributor.id) ?? 0,
  }));
}

export function monthlySaving(
  remaining: number,
  weddingDate: string | null,
  today: string,
) {
  if (remaining <= 0 || !weddingDate || weddingDate < today) return null;
  const months = monthsBetween(today.slice(0, 7), weddingDate.slice(0, 7)) + 1;
  return Math.ceil(remaining / months / 100) * 100;
}
