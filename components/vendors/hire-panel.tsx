"use client";

import { HandshakeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Field } from "@/components/forms/field";
import { MoneyInput } from "@/components/forms/money-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/components/ui/toast";
import { hireVendor } from "@/lib/actions/vendors";
import { attempt, failed } from "@/lib/attempt";
import { splitInstallments } from "@/lib/budget";
import type { BudgetCategory, Vendor } from "@/lib/data";
import { formatShortDate } from "@/lib/dates";
import { m } from "@/lib/i18n";
import { formatBRL } from "@/lib/money";

const counts = Array.from({ length: 24 }, (_, index) => index + 1);

export function HirePanel({
  vendor,
  categories,
}: {
  vendor: Vendor;
  categories: BudgetCategory[];
}) {
  const router = useRouter();
  const [expenseId] = useState(() => crypto.randomUUID());
  const [amount, setAmount] = useState(vendor.quote_cents ?? 0);
  const [category, setCategory] = useState(
    vendor.category_id ?? categories[0]?.id ?? "",
  );
  const [count, setCount] = useState(1);
  const [firstDue, setFirstDue] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const preview =
    amount > 0 && firstDue ? splitInstallments(amount, count, firstDue) : [];

  function hire() {
    startTransition(async () => {
      const result = await attempt(
        hireVendor({
          vendorId: vendor.id,
          expenseId,
          categoryId: category,
          contractedCents: amount,
          plan: { count, firstDue },
        }),
        failed,
      );
      if (!result.ok) {
        setError(
          Object.values(result.errors ?? {})[0]?.[0] ??
            result.message ??
            m.common.tryAgain,
        );
        return;
      }
      toast.add({ title: m.vendors.hired(vendor.name), type: "success" });
      router.push(`/orcamento/gastos/${expenseId}`);
    });
  }

  return (
    <section
      id="contratar"
      aria-labelledby="contratar-titulo"
      className="flex scroll-mt-6 flex-col gap-4 rounded-3xl bg-linear-to-br from-blush to-card p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 id="contratar-titulo" className="text-title3 font-semibold">
          {m.vendors.hireTitle(vendor.name)}
        </h2>
        <p className="text-subhead text-muted-foreground">
          {m.vendors.hireHint}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="h-amount" label={m.budget.contractedValue}>
          <MoneyInput id="h-amount" value={amount} onChange={setAmount} />
        </Field>
        <Field id="h-category" label={m.budget.category}>
          <NativeSelect
            id="h-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id="h-count" label={m.budget.installmentsCount}>
          <NativeSelect
            id="h-count"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          >
            {counts.map((value) => (
              <option key={value} value={value}>
                {value}x
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id="h-first" label={m.budget.firstDue}>
          <Input
            id="h-first"
            type="date"
            min="2000-01-01"
            max="2100-12-31"
            value={firstDue}
            onChange={(e) => setFirstDue(e.target.value)}
            className="bg-card dark:bg-card"
          />
        </Field>
      </div>
      {preview.length > 0 && (
        <ol
          className="flex gap-2 overflow-x-auto pb-1"
          aria-label={m.budget.installments}
        >
          {preview.map((payment) => (
            <li
              key={payment.installment_number}
              className="flex shrink-0 flex-col rounded-xl bg-card px-3 py-2 text-center"
            >
              <span className="text-caption text-muted-foreground tabular-nums">
                {formatShortDate(payment.due_on)}
              </span>
              <span className="text-subhead font-semibold tabular-nums">
                {formatBRL(payment.amount_cents)}
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="text-footnote text-muted-foreground">{m.budget.procon}</p>
      <output className="block min-h-5 text-footnote text-destructive">
        {error}
      </output>
      <Button
        size="lg"
        onClick={hire}
        disabled={pending || categories.length === 0}
        focusableWhenDisabled
      >
        <HandshakeIcon aria-hidden="true" />
        {pending ? m.common.saving : m.vendors.hire}
      </Button>
    </section>
  );
}
