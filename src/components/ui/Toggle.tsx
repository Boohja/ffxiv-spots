type ToggleProps = Readonly<{
  enabled?: boolean;
  label: string;
}>;

export function Toggle({ enabled = false, label }: Readonly<ToggleProps>) {
  return (
    <label className="inline-flex items-center gap-2 text-xs text-text-secondary">
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${
          enabled ? "border-border-active bg-brand-azure/40" : "border-border-default bg-surface-base"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-text-primary transition ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
      <span>{label}</span>
    </label>
  );
}
