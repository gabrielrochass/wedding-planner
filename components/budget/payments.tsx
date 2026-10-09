"use client";

import { CheckIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { PaymentBadge } from "@/components/budget/payment-badge";
import { Field } from "@/components/forms/field";
import { FormActions } from "@/components/forms/form-actions";
import { MoneyInput } from "@/components/forms/money-input";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { useToday } from "@/hooks/use-today";
import {
  deletePayment,
  savePayment,
  setPaymentPaid,
} from "@/lib/actions/budget";
import { attempt, failed } from "@/lib/attempt";
import { paymentState } from "@/lib/budget";
import type { Contributor, Payment } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import { m } from "@/lib/i18n";
import { formatBRL } from "@/lib/money";
import { Constants, type Enums } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type Method = Enums<"payment_method">;

function label(payment: Payment) {
  return payment.installment_number && payment.installment_count
    ? m.budget.installment(
        payment.installment_number,
        payment.installment_count,
      )
    : (payment.note ?? m.budget.payments);
}

function PaidToggle({
  payment,
  disabled,
}: {
  payment: Payment;
  disabled: boolean;
}) {
  const today = useToday();
  const [paidOn, setPaidOn] = useOptimistic(payment.paid_on);
  const [, startTransition] = useTransition();
  const paid = paidOn !== null;

  return (
    <label className="flex size-11 shrink-0 cursor-pointer items-center justify-center has-disabled:cursor-not-allowed">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={paid}
        disabled={disabled}
        aria-label={
          paid
            ? m.budget.markUnpaid(label(payment))
            : m.budget.markPaid(label(payment))
        }
        onChange={() =>
          startTransition(async () => {
            const next = paid ? null : today;
            setPaidOn(next);
            const result = await attempt(
              setPaymentPaid(payment.id, next),
              failed,
            );
            if (!result.ok) {
              toast.add({
                title: result.message ?? m.common.tryAgain,
                type: "error",
              });
            } else if (next) {
              toast.add({
                title: m.budget.paidToast(formatBRL(payment.amount_cents)),
                type: "success",
              });
            }
          })
        }
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex size-6 items-center justify-center rounded-full border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring peer-disabled:opacity-50",
          paid ? "border-success bg-success text-card" : "border-input",
        )}
      >
        {paid && <CheckIcon className="size-4" strokeWidth={3} />}
      </span>
    </label>
  );
}

export function PaymentSheet({
  expenseId,
  payment,
  contributors,
}: {
  expenseId: string;
  payment: Payment | null;
  contributors: Contributor[];
}) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(() => payment?.id ?? crypto.randomUUID());
  const [amount, setAmount] = useState(payment?.amount_cents ?? 0);
  const [dueOn, setDueOn] = useState(payment?.due_on ?? "");
  const [paidOn, setPaidOn] = useState(payment?.paid_on ?? "");
  const [method, setMethod] = useState<string>(payment?.method ?? "");
  const [contributor, setContributor] = useState(payment?.contributor_id ?? "");
  const [note, setNote] = useState(payment?.note ?? "");
  const [status, setStatus] = useState("");
  const [saving, startSave] = useTransition();
  const [removing, startRemove] = useTransition();

  function save() {
    startSave(async () => {
      const result = await attempt(
        savePayment(
          {
            id,
            expenseId,
            amountCents: amount,
            dueOn,
            paidOn: paidOn || null,
            method: (method || null) as Method | null,
            contributorId: contributor || null,
            note,
          },
          payment === null,
        ),
        failed,
      );
      if (!result.ok) {
        setStatus(
          Object.values(result.errors ?? {})[0]?.[0] ??
            result.message ??
            m.common.tryAgain,
        );
        return;
      }
      toast.add({ title: m.budget.paymentSaved, type: "success" });
      setOpen(false);
      if (!payment) {
        setId(crypto.randomUUID());
        setAmount(0);
        setDueOn("");
        setPaidOn("");
        setNote("");
      }
    });
  }

  function remove() {
    if (!payment) return;
    startRemove(async () => {
      const result = await attempt(deletePayment(payment.id), failed);
      if (!result.ok) {
        setStatus(result.message ?? m.common.tryAgain);
        return;
      }
      toast.add({ title: m.budget.paymentDeleted });
      setOpen(false);
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={payment ? `${m.common.edit}: ${label(payment)}` : undefined}
        className={buttonVariants({
          variant: payment ? "ghost" : "secondary",
          size: payment ? "icon-lg" : "lg",
        })}
      >
        {payment ? (
          <PencilIcon aria-hidden="true" className="size-5" />
        ) : (
          <>
            <PlusIcon aria-hidden="true" />
            {m.budget.newPayment}
          </>
        )}
      </SheetTrigger>
      <SheetContent title={payment ? label(payment) : m.budget.newPayment}>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
          className="flex flex-col gap-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id={`p-amount-${id}`} label={m.budget.amount}>
              <MoneyInput
                id={`p-amount-${id}`}
                value={amount}
                onChange={setAmount}
              />
            </Field>
            <Field id={`p-due-${id}`} label={m.budget.dueOn}>
              <Input
                id={`p-due-${id}`}
                type="date"
                min="2000-01-01"
                max="2100-12-31"
                value={dueOn}
                onChange={(e) => setDueOn(e.target.value)}
                className="bg-background"
              />
            </Field>
            <Field id={`p-paid-${id}`} label={m.budget.paidOn}>
              <Input
                id={`p-paid-${id}`}
                type="date"
                min="2000-01-01"
                max="2100-12-31"
                value={paidOn}
                onChange={(e) => setPaidOn(e.target.value)}
                className="bg-background"
              />
            </Field>
            <Field id={`p-method-${id}`} label={m.budget.method}>
              <NativeSelect
                id={`p-method-${id}`}
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="">{m.common.optional}</option>
                {Constants.public.Enums.payment_method.map((value) => (
                  <option key={value} value={value}>
                    {m.methods[value]}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            {contributors.length > 0 && (
              <Field id={`p-who-${id}`} label={m.budget.paidBy}>
                <NativeSelect
                  id={`p-who-${id}`}
                  value={contributor}
                  onChange={(e) => setContributor(e.target.value)}
                >
                  <option value="">{m.common.optional}</option>
                  {contributors.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            )}
            <Field id={`p-note-${id}`} label={m.budget.note}>
              <Input
                id={`p-note-${id}`}
                maxLength={120}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-background"
              />
            </Field>
          </div>
          <FormActions
            status={status}
            saving={saving}
            busy={saving || removing}
            submitLabel={m.common.save}
            onDelete={payment ? remove : undefined}
          />
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function PaymentList({
  expenseId,
  payments,
  contributors,
  editable,
}: {
  expenseId: string;
  payments: Payment[];
  contributors: Contributor[];
  editable: boolean;
}) {
  const today = useToday();
  const names = new Map(contributors.map((c) => [c.id, c.name]));

  return (
    <section aria-labelledby="pagamentos" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="pagamentos" className="text-headline font-semibold">
          {m.budget.payments}
        </h2>
        {editable && (
          <PaymentSheet
            expenseId={expenseId}
            payment={null}
            contributors={contributors}
          />
        )}
      </div>
      {payments.length > 0 && (
        <ul className="divide-y overflow-hidden rounded-2xl bg-card">
          {payments.map((payment) => {
            const state = paymentState(payment, today);
            const details = [
              payment.method ? m.methods[payment.method] : null,
              payment.contributor_id ? names.get(payment.contributor_id) : null,
            ].filter(Boolean);
            return (
              <li
                key={payment.id}
                className="flex items-center gap-1 pr-1 pl-1"
              >
                <PaidToggle payment={payment} disabled={!editable} />
                <div className="flex min-w-0 flex-1 flex-col py-2">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-body">{label(payment)}</span>
                    <span className="shrink-0 text-body font-semibold tabular-nums">
                      {formatBRL(payment.amount_cents)}
                    </span>
                  </span>
                  <span className="flex flex-wrap items-center gap-x-3">
                    <PaymentBadge
                      state={state}
                      label={
                        payment.paid_on
                          ? m.budget.paidLabel(
                              formatDate(payment.paid_on, today),
                            )
                          : m.budget.dueLabel(formatDate(payment.due_on, today))
                      }
                    />
                    {details.length > 0 && (
                      <span className="text-footnote text-muted-foreground">
                        {details.join(", ")}
                      </span>
                    )}
                  </span>
                </div>
                {editable && (
                  <PaymentSheet
                    expenseId={expenseId}
                    payment={payment}
                    contributors={contributors}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-footnote text-muted-foreground">{m.budget.procon}</p>
    </section>
  );
}
