"use client";

import { useState } from "react";
import { Field } from "@/components/forms/field";
import { MoneyInput } from "@/components/forms/money-input";
import { SheetForm } from "@/components/forms/sheet-form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { deleteHomeItem, saveHomeItem } from "@/lib/actions/home";
import type { HomeItem } from "@/lib/data";
import {
  type HomePriority,
  type HomeRoom,
  type HomeStatus,
  homePriorities,
  homeRooms,
  homeStatuses,
} from "@/lib/home";
import { m } from "@/lib/i18n";

export function HomeItemSheet({
  item,
  room,
  households,
}: {
  item: HomeItem | null;
  room: HomeRoom | null;
  households: { id: string; name: string }[];
}) {
  const [id, setId] = useState(() => item?.id ?? crypto.randomUUID());
  const [name, setName] = useState(item?.name ?? "");
  const [where, setWhere] = useState<HomeRoom>(
    (item?.room as HomeRoom) ?? room ?? "cozinha",
  );
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1));
  const [priority, setPriority] = useState<HomePriority>(
    item?.priority ?? "important",
  );
  const [status, setStatus] = useState<HomeStatus>(item?.status ?? "missing");
  const [estimate, setEstimate] = useState(item?.estimate_cents ?? 0);
  const [paid, setPaid] = useState(item?.paid_cents ?? 0);
  const [store, setStore] = useState(item?.store ?? "");
  const [url, setUrl] = useState(item?.url ?? "");
  const [householdId, setHouseholdId] = useState(item?.household_id ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");

  return (
    <SheetForm
      title={item ? item.name : m.enxoval.newItem}
      trigger={item ? "edit" : "add"}
      triggerLabel={item ? `${m.common.edit}: ${item.name}` : m.enxoval.newItem}
      savedMessage={m.enxoval.saved}
      deletedMessage={m.enxoval.deleted}
      onSave={() =>
        saveHomeItem(
          {
            id,
            room: where,
            name,
            quantity: Math.max(1, Number.parseInt(quantity, 10) || 1),
            priority,
            status,
            estimateCents: estimate > 0 ? estimate : null,
            paidCents: paid > 0 ? paid : null,
            store,
            url,
            householdId: householdId || null,
            notes,
          },
          item === null,
        )
      }
      onDelete={item ? () => deleteHomeItem(item.id) : undefined}
      onSaved={() => {
        if (item) return;
        setId(crypto.randomUUID());
        setName("");
        setQuantity("1");
        setEstimate(0);
        setPaid(0);
        setStore("");
        setUrl("");
        setHouseholdId("");
        setNotes("");
      }}
    >
      <Field id={`h-name-${id}`} label={m.enxoval.name}>
        <Input
          id={`h-name-${id}`}
          maxLength={80}
          autoComplete="off"
          placeholder={m.enxoval.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background"
        />
      </Field>
      <div className="grid grid-cols-2 gap-5">
        <Field id={`h-room-${id}`} label={m.enxoval.room}>
          <NativeSelect
            id={`h-room-${id}`}
            value={where}
            onChange={(e) => setWhere(e.target.value as HomeRoom)}
          >
            {homeRooms.map((key) => (
              <option key={key} value={key}>
                {m.rooms[key]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id={`h-qty-${id}`} label={m.enxoval.quantity}>
          <Input
            id={`h-qty-${id}`}
            inputMode="numeric"
            maxLength={3}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ""))}
            className="bg-background tabular-nums"
          />
        </Field>
        <Field id={`h-priority-${id}`} label={m.enxoval.priority}>
          <NativeSelect
            id={`h-priority-${id}`}
            value={priority}
            onChange={(e) => setPriority(e.target.value as HomePriority)}
          >
            {homePriorities.map((key) => (
              <option key={key} value={key}>
                {m.homePriority[key]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id={`h-status-${id}`} label={m.enxoval.status}>
          <NativeSelect
            id={`h-status-${id}`}
            value={status}
            onChange={(e) => setStatus(e.target.value as HomeStatus)}
          >
            {homeStatuses.map((key) => (
              <option key={key} value={key}>
                {m.homeStatus[key]}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      {status === "gifted" && households.length > 0 && (
        <Field id={`h-gift-${id}`} label={m.enxoval.giftFrom}>
          <NativeSelect
            id={`h-gift-${id}`}
            value={householdId}
            onChange={(e) => setHouseholdId(e.target.value)}
          >
            <option value="">{m.enxoval.noGift}</option>
            {households.map((household) => (
              <option key={household.id} value={household.id}>
                {household.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`h-estimate-${id}`} label={m.enxoval.estimate}>
          <MoneyInput
            id={`h-estimate-${id}`}
            value={estimate}
            onChange={setEstimate}
            placeholder={m.common.optional}
          />
        </Field>
        <Field id={`h-paid-${id}`} label={m.enxoval.paid}>
          <MoneyInput
            id={`h-paid-${id}`}
            value={paid}
            onChange={setPaid}
            placeholder={m.common.optional}
          />
        </Field>
        <Field id={`h-store-${id}`} label={m.enxoval.store}>
          <Input
            id={`h-store-${id}`}
            maxLength={80}
            autoComplete="off"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            className="bg-background"
          />
        </Field>
        <Field id={`h-url-${id}`} label={m.enxoval.link}>
          <Input
            id={`h-url-${id}`}
            type="url"
            inputMode="url"
            maxLength={500}
            placeholder="https://"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-background"
          />
        </Field>
      </div>
      <Field id={`h-notes-${id}`} label={m.enxoval.notes}>
        <textarea
          id={`h-notes-${id}`}
          rows={2}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base"
        />
      </Field>
    </SheetForm>
  );
}
