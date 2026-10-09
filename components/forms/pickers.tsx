import { m } from "@/lib/i18n";
import { categoryIcons } from "@/lib/icons";

export function IconPicker({
  legend,
  value,
  onChange,
}: {
  legend: string;
  value: string;
  onChange: (icon: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-footnote font-medium text-muted-foreground">
        {legend}
      </legend>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-2">
        {Object.entries(categoryIcons).map(([key, Icon]) => (
          <label
            key={key}
            className="relative flex size-11 cursor-pointer items-center justify-center rounded-full bg-secondary text-secondary-foreground ring-offset-2 ring-offset-background has-checked:bg-primary has-checked:text-primary-foreground has-checked:ring-2 has-checked:ring-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-ring forced-colors:has-checked:outline-2 forced-colors:has-checked:outline-[Highlight]"
          >
            <input
              type="radio"
              name="icon"
              value={key}
              checked={value === key}
              onChange={() => onChange(key)}
              aria-label={m.icons[key as keyof typeof m.icons]}
              className="sr-only"
            />
            <Icon aria-hidden="true" className="size-5" />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
