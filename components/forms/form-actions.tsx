import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "@/lib/i18n";

export function FormActions({
  status,
  saving,
  busy,
  submitLabel,
  onDelete,
}: {
  status: string;
  saving: boolean;
  busy: boolean;
  submitLabel: string;
  onDelete?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <output className="block min-h-5 text-footnote text-destructive">
        {status}
      </output>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            size="lg"
            disabled={busy}
            focusableWhenDisabled
            onClick={onDelete}
          >
            <Trash2Icon aria-hidden="true" />
            {m.common.delete}
          </Button>
        )}
        <Button type="submit" size="lg" disabled={busy} focusableWhenDisabled>
          {saving ? m.common.saving : submitLabel}
        </Button>
      </div>
    </div>
  );
}
