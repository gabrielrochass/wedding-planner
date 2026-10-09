import { dueDate } from "@/lib/checklist";
import { toCsv } from "@/lib/csv";
import { todayInSaoPaulo } from "@/lib/dates";
import { m } from "@/lib/i18n";
import { formatPlainAmount } from "@/lib/money";
import type { Tables } from "@/lib/supabase/database.types";

const column = m.exportData.columns;

type Named = { id: string; name: string };

function amount(cents: number | null) {
  return cents === null ? "" : formatPlainAmount(cents);
}

function names(rows: readonly Named[]) {
  return new Map(rows.map(({ id, name }) => [id, name]));
}

export type HouseholdExport = Pick<
  Tables<"households">,
  | "id"
  | "name"
  | "side"
  | "list"
  | "phone"
  | "address"
  | "save_the_date_on"
  | "invited_on"
  | "gift"
  | "thanked_on"
>;
export type GuestExport = Pick<
  Tables<"guests">,
  "household_id" | "name" | "age_band" | "rsvp" | "is_plus_one" | "dietary"
>;

export function guestsCsv(
  households: readonly HouseholdExport[],
  guests: readonly GuestExport[],
  partners: { a: string; b: string },
) {
  const byId = new Map(households.map((h) => [h.id, h]));
  const sides = { a: partners.a, b: partners.b, both: m.guests.sideBoth };
  return toCsv(
    [
      column.household,
      column.name,
      column.side,
      column.list,
      column.age,
      column.rsvp,
      column.plusOne,
      column.dietary,
      column.phone,
      column.address,
      column.saveTheDate,
      column.invited,
      column.gift,
      column.thanked,
    ],
    guests.flatMap((guest) => {
      const h = byId.get(guest.household_id);
      if (!h) return [];
      return [
        [
          h.name,
          guest.name,
          sides[h.side],
          m.lists[h.list],
          m.ageBands[guest.age_band],
          m.rsvp[guest.rsvp],
          guest.is_plus_one ? column.yes : "",
          guest.dietary,
          h.phone,
          h.address,
          h.save_the_date_on,
          h.invited_on,
          h.gift,
          h.thanked_on,
        ],
      ];
    }),
  );
}

export type TaskExport = Pick<
  Tables<"tasks">,
  | "title"
  | "area"
  | "offset_days"
  | "due_on"
  | "assignee_id"
  | "assignee_label"
  | "done_at"
  | "notes"
>;

export function tasksCsv(
  tasks: readonly TaskExport[],
  weddingDate: string | null,
  people: ReadonlyMap<string, string>,
) {
  return toCsv(
    [
      column.title,
      column.area,
      column.due,
      column.assignee,
      column.done,
      column.notes,
    ],
    tasks.map((task) => [
      task.title,
      m.areas[task.area as keyof typeof m.areas] ?? task.area,
      dueDate(task, weddingDate),
      task.assignee_id
        ? (people.get(task.assignee_id) ?? "")
        : task.assignee_label,
      task.done_at ? todayInSaoPaulo(new Date(task.done_at)) : "",
      task.notes,
    ]),
  );
}

export type ExpenseExport = Pick<
  Tables<"expenses">,
  | "id"
  | "category_id"
  | "vendor_id"
  | "title"
  | "estimated_cents"
  | "contracted_cents"
>;
export type PaymentExport = Pick<
  Tables<"payments">,
  | "expense_id"
  | "amount_cents"
  | "due_on"
  | "paid_on"
  | "method"
  | "contributor_id"
>;

export function expensesCsv(
  expenses: readonly ExpenseExport[],
  payments: readonly PaymentExport[],
  lookups: {
    categories: readonly Named[];
    vendors: readonly Named[];
    contributors: readonly Named[];
  },
) {
  const categoryNames = names(lookups.categories);
  const vendorNames = names(lookups.vendors);
  const contributorNames = names(lookups.contributors);
  return toCsv(
    [
      column.category,
      column.expense,
      column.vendor,
      column.estimated,
      column.contracted,
      column.amount,
      column.dueOn,
      column.paidOn,
      column.method,
      column.paidBy,
    ],
    expenses.flatMap((expense) => {
      const base = [
        categoryNames.get(expense.category_id) ?? "",
        expense.title,
        expense.vendor_id ? (vendorNames.get(expense.vendor_id) ?? "") : "",
        amount(expense.estimated_cents),
        amount(expense.contracted_cents),
      ];
      const own = payments.filter((p) => p.expense_id === expense.id);
      if (own.length === 0) return [[...base, "", "", "", "", ""]];
      return own.map((payment) => [
        ...base,
        amount(payment.amount_cents),
        payment.due_on,
        payment.paid_on,
        payment.method ? m.methods[payment.method] : "",
        payment.contributor_id
          ? (contributorNames.get(payment.contributor_id) ?? "")
          : "",
      ]);
    }),
  );
}

export type VendorExport = Pick<
  Tables<"vendors">,
  | "name"
  | "category_id"
  | "status"
  | "contact_name"
  | "phone"
  | "email"
  | "instagram"
  | "website"
  | "quote_cents"
  | "quote_details"
  | "rating"
  | "notes"
>;

export function vendorsCsv(
  vendors: readonly VendorExport[],
  categories: readonly Named[],
) {
  const categoryNames = names(categories);
  return toCsv(
    [
      column.name,
      column.category,
      column.status,
      column.contact,
      column.phone,
      column.email,
      column.instagram,
      column.website,
      column.quote,
      column.quoteDetails,
      column.rating,
      column.notes,
    ],
    vendors.map((v) => [
      v.name,
      v.category_id ? (categoryNames.get(v.category_id) ?? "") : "",
      m.vendorStatus[v.status],
      v.contact_name,
      v.phone,
      v.email,
      v.instagram,
      v.website,
      amount(v.quote_cents),
      v.quote_details,
      v.rating,
      v.notes,
    ]),
  );
}
