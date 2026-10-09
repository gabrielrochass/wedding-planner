export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label
        htmlFor={id}
        className="text-footnote font-medium text-muted-foreground"
      >
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-footnote text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-footnote text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(
  id: string,
  { hint, error }: { hint?: boolean; error?: string },
) {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}
