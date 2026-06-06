import type { ButtonHTMLAttributes } from "react";

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function Chip({ active = false, className = "", ...props }: ChipProps) {
  return (
    <button
      className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-xs font-semibold tracking-wide transition ${
        active
          ? "neon-outline border-border-active bg-surface-overlay text-brand-spark"
          : "border-border-default bg-surface-base text-text-secondary hover:border-border-active/60 hover:text-text-primary"
      } ${className}`.trim()}
      {...props}
    />
  );
}
