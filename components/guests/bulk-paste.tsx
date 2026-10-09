"use client";

import { SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { addHouseholds } from "@/lib/actions/guests";
import { attempt, failed } from "@/lib/attempt";
import { parseGuestLines } from "@/lib/guests";
import { m } from "@/lib/i18n";

export function BulkPaste() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [pending, startTransition] = useTransition();
  const parsed = parseGuestLines(text);
  const people = parsed.reduce(
    (sum, household) => sum + household.members.length,
    0,
  );

  function add() {
    startTransition(async () => {
      const input = parsed.map((household) => ({
        id: crypto.randomUUID(),
        name: household.name,
        members: household.members.map((name) => ({
          id: crypto.randomUUID(),
          name: name.slice(0, 80),
        })),
      }));
      const result = await attempt(addHouseholds(input), failed);
      if (!result.ok) {
        setStatus(result.message ?? m.common.tryAgain);
        return;
      }
      toast.add({ title: m.guests.bulkAdded(input.length), type: "success" });
      router.push("/convidados/triagem");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <label
        htmlFor="lista-nomes"
        className="text-footnote font-medium text-muted-foreground"
      >
        {m.guests.bulkLabel}
      </label>
      <textarea
        id="lista-nomes"
        rows={10}
        value={text}
        onChange={(event) => setText(event.target.value)}
        aria-describedby="lista-dica"
        className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-base"
      />
      <p id="lista-dica" className="text-footnote text-muted-foreground">
        {m.guests.bulkHint}
      </p>
      {parsed.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl bg-card p-4">
          <p className="text-headline font-semibold">
            {m.guests.bulkPreview(parsed.length, people)}
          </p>
          <ul className="flex flex-wrap gap-2">
            {parsed.slice(0, 30).map((household) => (
              <li
                key={household.name}
                className="rounded-full bg-blush px-3 py-1 text-footnote text-link"
              >
                {household.members.join(", ")}
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
        <SparklesIcon aria-hidden="true" />
        {pending ? m.common.saving : m.guests.bulkAdd}
      </Button>
    </div>
  );
}
