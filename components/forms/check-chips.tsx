import { CheckIcon } from "lucide-react";
import type { ChoiceOption } from "@/components/forms/choice-chips";

export function CheckChips({
  legend,
  name,
  options,
  value,
  onChange,
  max,
}: {
  legend: string;
  name: string;
  options: readonly ChoiceOption[];
  value: readonly string[];
  onChange: (value: string) => void;
  max?: number;
}) {
  const full = max !== undefined && value.length >= max;

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 text-footnote font-medium text-muted-foreground">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = value.includes(option.value);
          return (
            <label
              key={option.value}
              className="flex min-h-11 max-w-full min-w-0 cursor-pointer items-center gap-2 rounded-full bg-secondary px-4 text-subhead font-medium text-secondary-foreground transition-colors select-none has-checked:bg-foreground has-checked:text-background has-disabled:cursor-not-allowed has-disabled:opacity-60 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring forced-colors:border forced-colors:has-checked:forced-color-adjust-none forced-colors:has-checked:bg-[Highlight] forced-colors:has-checked:text-[HighlightText]"
            >
              <input
                type="checkbox"
                name={name}
                value={option.value}
                checked={checked}
                disabled={full && !checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {checked ? (
                <CheckIcon aria-hidden="true" className="size-4 shrink-0" />
              ) : (
                option.icon
              )}
              <span className="truncate">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
