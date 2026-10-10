"use client";

import { CopyIcon, LinkIcon, MessageCircleIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { ChoiceChips } from "@/components/forms/choice-chips";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { createInviteLink } from "@/lib/actions/wedding";
import { attempt, failed } from "@/lib/attempt";
import { m } from "@/lib/i18n";
import { type Role, roles } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function InviteLink({ couple }: { couple: string }) {
  const [role, setRole] = useState<Role>("couple");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function create() {
    startTransition(async () => {
      const result = await attempt(createInviteLink(role), failed);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setError("");
      setUrl(`${window.location.origin}/convite/${result.token}`);
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.add({ title: m.team.copied, type: "success" });
    } catch {
      document.getElementById("convite-url")?.focus();
    }
  }

  return (
    <section
      data-tour="equipe-convidar"
      aria-labelledby="convidar"
      className="flex flex-col gap-4 rounded-2xl bg-card p-5"
    >
      <h2 id="convidar" className="text-headline font-semibold">
        {m.team.invite}
      </h2>
      <ChoiceChips
        legend={m.team.inviteRole}
        name="papel"
        value={role}
        onChange={(value) => {
          setRole(value as Role);
          setUrl("");
        }}
        options={roles.map((value) => ({ value, label: m.roles[value] }))}
      />
      <p className="text-footnote text-muted-foreground">{m.roleHints[role]}</p>
      {url ? (
        <div className="flex flex-col gap-3">
          <input
            id="convite-url"
            readOnly
            value={url}
            onFocus={(event) => event.target.select()}
            aria-label={m.invite.title}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-base"
          />
          <p className="text-footnote text-muted-foreground">
            {m.team.linkReady}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" size="lg" variant="secondary" onClick={copy}>
              <CopyIcon aria-hidden="true" />
              {m.team.copy}
            </Button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(m.team.inviteMessage(couple, url))}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              <MessageCircleIcon aria-hidden="true" />
              {m.team.sendWhatsapp}
            </a>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          size="lg"
          onClick={create}
          disabled={pending}
          focusableWhenDisabled
        >
          <LinkIcon aria-hidden="true" />
          {pending ? m.team.creatingLink : m.team.createLink}
        </Button>
      )}
      <output className="block min-h-5 text-footnote text-destructive">
        {error}
      </output>
    </section>
  );
}
