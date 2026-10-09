"use client";

import { ClipboardPasteIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { addHomeItems } from "@/lib/actions/home";
import { attempt, failed } from "@/lib/attempt";
import { parseHomeRows } from "@/lib/home";
import { m } from "@/lib/i18n";

export function HomeImport() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [pending, startTransition] = useTransition();
  const parsed = parseHomeRows(text);

  function add() {
    startTransition(async () => {
      const result = await attempt(
        addHomeItems(
          parsed.map((item) => ({
            name: item.name,
            room: item.room,
            quantity: item.quantity,
            priority: "important",
            status: item.status,
            estimateCents: item.estimate_cents,
          })),
        ),
        failed,
      );
      if (!result.ok) {
        setStatus(result.message ?? m.common.tryAgain);
        return;
      }
      toast.add({
        title: m.enxoval.starterAdded(parsed.length),
        type: "success",
      });
      router.push("/enxoval");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <label
        htmlFor="planilha"
        className="text-footnote font-medium text-muted-foreground"
      >
        {m.enxoval.importLabel}
      </label>
      <textarea
        id="planilha"
        rows={10}
        value={text}
        onChange={(event) => setText(event.target.value)}
        aria-describedby="planilha-dica"
        className="w-full rounded-2xl border border-input bg-card px-4 py-3 font-mono text-base"
      />
      <p id="planilha-dica" className="text-footnote text-muted-foreground">
        {m.enxoval.importHint}
      </p>
      {parsed.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl bg-card p-4">
          <p className="text-headline font-semibold">
            {m.enxoval.importPreview(parsed.length)}
          </p>
          <ul className="flex flex-col divide-y text-subhead">
            {parsed.slice(0, 12).map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between gap-2 py-1.5"
              >
                <span className="truncate">
                  {item.quantity > 1
                    ? `${m.enxoval.quantityValue(item.quantity)} `
                    : ""}
                  {item.name}
                </span>
                <span className="shrink-0 text-footnote text-muted-foreground">
                  {m.rooms[item.room]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <output className="block min-h-5 text-footnote text-destructive">
        {status}
      </output>
      <Button
        size="lg"
        onClick={add}
        disabled={pending || parsed.length === 0}
        focusableWhenDisabled
      >
        <ClipboardPasteIcon aria-hidden="true" />
        {pending ? m.common.saving : m.enxoval.importAdd}
      </Button>
    </div>
  );
}
