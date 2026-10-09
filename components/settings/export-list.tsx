"use client";

import { DownloadIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToday } from "@/hooks/use-today";
import { expensesCsv, guestsCsv, tasksCsv, vendorsCsv } from "@/lib/export";
import { m } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

type Supabase = ReturnType<typeof createClient>;
type Page<T> = PromiseLike<{ data: T[] | null; error: unknown }>;

const pageSize = 1000;

async function fetchAll<T>(page: (from: number, to: number) => Page<T>) {
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await page(from, from + pageSize - 1);
    if (error) throw error;
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < pageSize) return rows;
  }
}

type Context = {
  weddingId: string;
  weddingDate: string | null;
  partners: { a: string; b: string };
  people: [string, string][];
};

function rows<T>(
  supabase: Supabase,
  table:
    | "households"
    | "guests"
    | "tasks"
    | "expenses"
    | "payments"
    | "vendors"
    | "budget_categories"
    | "contributors",
  columns: string,
  weddingId: string,
) {
  return fetchAll<T>(
    (from, to) =>
      supabase
        .from(table)
        .select(columns)
        .eq("wedding_id", weddingId)
        .order("created_at")
        .order("id")
        .range(from, to) as unknown as Page<T>,
  );
}

const files = {
  guests: async (supabase: Supabase, context: Context) => {
    const [households, guests] = await Promise.all([
      rows<Parameters<typeof guestsCsv>[0][number]>(
        supabase,
        "households",
        "id, name, side, list, phone, address, save_the_date_on, invited_on, gift, thanked_on",
        context.weddingId,
      ),
      rows<Parameters<typeof guestsCsv>[1][number]>(
        supabase,
        "guests",
        "household_id, name, age_band, rsvp, is_plus_one, dietary",
        context.weddingId,
      ),
    ]);
    return {
      rows: guests.length,
      csv: guestsCsv(households, guests, context.partners),
    };
  },
  tasks: async (supabase: Supabase, context: Context) => {
    const tasks = await rows<Parameters<typeof tasksCsv>[0][number]>(
      supabase,
      "tasks",
      "title, area, offset_days, due_on, assignee_id, assignee_label, done_at, notes",
      context.weddingId,
    );
    return {
      rows: tasks.length,
      csv: tasksCsv(tasks, context.weddingDate, new Map(context.people)),
    };
  },
  expenses: async (supabase: Supabase, context: Context) => {
    const [expenses, payments, categories, vendors, contributors] =
      await Promise.all([
        rows<Parameters<typeof expensesCsv>[0][number]>(
          supabase,
          "expenses",
          "id, category_id, vendor_id, title, estimated_cents, contracted_cents",
          context.weddingId,
        ),
        rows<Parameters<typeof expensesCsv>[1][number]>(
          supabase,
          "payments",
          "expense_id, amount_cents, due_on, paid_on, method, contributor_id",
          context.weddingId,
        ),
        rows<{ id: string; name: string }>(
          supabase,
          "budget_categories",
          "id, name",
          context.weddingId,
        ),
        rows<{ id: string; name: string }>(
          supabase,
          "vendors",
          "id, name",
          context.weddingId,
        ),
        rows<{ id: string; name: string }>(
          supabase,
          "contributors",
          "id, name",
          context.weddingId,
        ),
      ]);
    return {
      rows: payments.length || expenses.length,
      csv: expensesCsv(expenses, payments, {
        categories,
        vendors,
        contributors,
      }),
    };
  },
  vendors: async (supabase: Supabase, context: Context) => {
    const [vendors, categories] = await Promise.all([
      rows<Parameters<typeof vendorsCsv>[0][number]>(
        supabase,
        "vendors",
        "name, category_id, status, contact_name, phone, email, instagram, website, quote_cents, quote_details, rating, notes",
        context.weddingId,
      ),
      rows<{ id: string; name: string }>(
        supabase,
        "budget_categories",
        "id, name",
        context.weddingId,
      ),
    ]);
    return { rows: vendors.length, csv: vendorsCsv(vendors, categories) };
  },
};

type FileKey = keyof typeof files;

const keys = Object.keys(files) as FileKey[];

export function ExportList(context: Context) {
  const today = useToday();
  const [busy, setBusy] = useState<FileKey | null>(null);
  const [status, setStatus] = useState("");

  async function download(key: FileKey) {
    setBusy(key);
    setStatus(m.exportData.preparing);
    try {
      const { rows: count, csv } = await files[key](createClient(), context);
      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `${m.exportData.fileNames[key]}-${today}.csv`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(m.exportData.done(m.exportData.files[key], count));
    } catch {
      setStatus(m.exportData.failed);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="divide-y overflow-hidden rounded-2xl bg-card">
        {keys.map((key) => (
          <li
            key={key}
            className="flex min-h-15 items-center justify-between gap-3 py-2 pr-2 pl-4"
          >
            <span className="text-body font-medium">
              {m.exportData.files[key]}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              aria-label={m.exportData.download(m.exportData.files[key])}
              disabled={busy !== null}
              focusableWhenDisabled
              onClick={() => download(key)}
            >
              <DownloadIcon aria-hidden="true" />
              {m.exportData.downloadShort}
            </Button>
          </li>
        ))}
      </ul>
      <output className="block min-h-5 text-footnote text-muted-foreground">
        {status}
      </output>
    </div>
  );
}
