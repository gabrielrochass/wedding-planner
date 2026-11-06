"use client";

import { Loader2Icon } from "lucide-react";
import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton({
  children,
  ...props
}: ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return (
    <Button {...props} type="submit" disabled={pending} focusableWhenDisabled>
      {pending && (
        <Loader2Icon aria-hidden="true" className="size-4 animate-spin" />
      )}
      {children}
    </Button>
  );
}
