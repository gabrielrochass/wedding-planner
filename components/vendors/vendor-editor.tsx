"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { describedBy, Field } from "@/components/forms/field";
import { FormActions } from "@/components/forms/form-actions";
import { MoneyInput } from "@/components/forms/money-input";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/components/ui/toast";
import { useGoBack } from "@/hooks/use-go-back";
import { deleteVendor, saveVendor } from "@/lib/actions/vendors";
import { attempt, failed } from "@/lib/attempt";
import type { BudgetCategory, Vendor } from "@/lib/data";
import { m } from "@/lib/i18n";
import { type VendorStatus, vendorStatuses } from "@/lib/vendors";

const textArea =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-base";

export function VendorEditor({
  vendor,
  categories,
}: {
  vendor: Vendor | null;
  categories: BudgetCategory[];
}) {
  const goBack = useGoBack("/fornecedores");
  const router = useRouter();
  const [id] = useState(() => vendor?.id ?? crypto.randomUUID());
  const [name, setName] = useState(vendor?.name ?? "");
  const [category, setCategory] = useState(vendor?.category_id ?? "");
  const [status, setStatus] = useState<VendorStatus>(
    vendor?.status ?? "researching",
  );
  const [contactName, setContactName] = useState(vendor?.contact_name ?? "");
  const [phone, setPhone] = useState(vendor?.phone ?? "");
  const [email, setEmail] = useState(vendor?.email ?? "");
  const [instagram, setInstagram] = useState(vendor?.instagram ?? "");
  const [website, setWebsite] = useState(vendor?.website ?? "");
  const [quote, setQuote] = useState(vendor?.quote_cents ?? 0);
  const [details, setDetails] = useState(vendor?.quote_details ?? "");
  const [capacity, setCapacity] = useState(
    vendor?.capacity ? String(vendor.capacity) : "",
  );
  const [rating, setRating] = useState(
    vendor?.rating ? String(vendor.rating) : "",
  );
  const [visitOn, setVisitOn] = useState(vendor?.visit_on ?? "");
  const [notes, setNotes] = useState(vendor?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [message, setMessage] = useState("");
  const [saving, startSave] = useTransition();
  const [removing, startRemove] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  function save() {
    startSave(async () => {
      const seats = Number.parseInt(capacity, 10);
      const result = await attempt(
        saveVendor(
          {
            id,
            categoryId: category || null,
            name,
            status,
            contactName,
            phone,
            email,
            instagram,
            website,
            quoteCents: quote > 0 ? quote : null,
            quoteDetails: details,
            capacity: Number.isFinite(seats) && seats > 0 ? seats : null,
            rating: rating ? Number(rating) : null,
            visitOn: visitOn || null,
            notes,
          },
          vendor === null,
        ),
        failed,
      );
      if (!result.ok) {
        const found = Object.fromEntries(
          Object.entries(result.errors ?? {}).map(([key, value]) => [
            key,
            value?.[0],
          ]),
        );
        setErrors(found);
        setMessage(result.message ?? "");
        if (found.name) nameRef.current?.focus();
        return;
      }
      toast.add({
        title: vendor ? m.vendors.saved : m.vendors.created,
        type: "success",
      });
      if (vendor) goBack();
      else router.replace(`/fornecedores/${id}`);
    });
  }

  function remove() {
    if (!vendor) return;
    startRemove(async () => {
      const result = await attempt(deleteVendor(vendor.id), failed);
      if (!result.ok) {
        setMessage(result.message ?? m.common.tryAgain);
        return;
      }
      toast.add({ title: m.vendors.deleted });
      router.replace("/fornecedores");
    });
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      className="flex flex-col gap-6"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="v-name" label={m.vendors.name} error={errors.name}>
          <Input
            ref={nameRef}
            id="v-name"
            maxLength={80}
            autoComplete="off"
            placeholder={m.vendors.namePlaceholder}
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("v-name", { error: errors.name })}
            className="bg-card dark:bg-card"
          />
        </Field>
        <Field id="v-category" label={m.vendors.category}>
          <NativeSelect
            id="v-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">{m.vendors.noCategory}</option>
            {categories.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id="v-status" label={m.vendors.status}>
          <NativeSelect
            id="v-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as VendorStatus)}
          >
            {vendorStatuses.map((option) => (
              <option key={option} value={option}>
                {m.vendorStatus[option]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id="v-quote" label={m.vendors.quote}>
          <MoneyInput id="v-quote" value={quote} onChange={setQuote} />
        </Field>
      </div>

      <Field id="v-details" label={m.vendors.quoteDetails}>
        <textarea
          id="v-details"
          rows={3}
          maxLength={2000}
          placeholder={m.vendors.quoteDetailsPlaceholder}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          className={textArea}
        />
      </Field>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-headline font-semibold">
          {m.vendors.contact}
        </legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="v-contact" label={m.vendors.contactName}>
            <Input
              id="v-contact"
              maxLength={80}
              autoComplete="off"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="bg-card dark:bg-card"
            />
          </Field>
          <Field id="v-phone" label={m.vendors.phone}>
            <Input
              id="v-phone"
              type="tel"
              inputMode="tel"
              maxLength={30}
              autoComplete="off"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-card dark:bg-card"
            />
          </Field>
          <Field id="v-email" label={m.vendors.email} error={errors.email}>
            <Input
              id="v-email"
              type="email"
              inputMode="email"
              maxLength={120}
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy("v-email", { error: errors.email })}
              className="bg-card dark:bg-card"
            />
          </Field>
          <Field id="v-instagram" label={m.vendors.instagram}>
            <Input
              id="v-instagram"
              maxLength={80}
              autoComplete="off"
              placeholder="@"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="bg-card dark:bg-card"
            />
          </Field>
          <Field id="v-website" label={m.vendors.website}>
            <Input
              id="v-website"
              type="url"
              inputMode="url"
              maxLength={300}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="bg-card dark:bg-card"
            />
          </Field>
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field id="v-capacity" label={m.vendors.capacity}>
          <Input
            id="v-capacity"
            inputMode="numeric"
            maxLength={5}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value.replace(/\D/g, ""))}
            className="bg-card tabular-nums dark:bg-card"
          />
        </Field>
        <Field id="v-rating" label={m.vendors.rating}>
          <NativeSelect
            id="v-rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            <option value="">{m.vendors.noRating}</option>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {m.vendors.ratingOption(value)}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id="v-visit" label={m.vendors.visitOn}>
          <Input
            id="v-visit"
            type="date"
            min="2000-01-01"
            max="2100-12-31"
            value={visitOn}
            onChange={(e) => setVisitOn(e.target.value)}
            className="bg-card dark:bg-card"
          />
        </Field>
      </div>

      <Field id="v-notes" label={m.vendors.notes}>
        <textarea
          id="v-notes"
          rows={3}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={textArea}
        />
      </Field>

      <FormActions
        status={message}
        saving={saving}
        busy={saving || removing}
        submitLabel={vendor ? m.common.save : m.vendors.newVendor}
        onDelete={vendor ? remove : undefined}
      />
    </form>
  );
}
