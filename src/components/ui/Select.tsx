import type { SelectHTMLAttributes } from "react";

type SelectProps = Readonly<SelectHTMLAttributes<HTMLSelectElement>>;

export function Select({ className = "", children, ...props }: Readonly<SelectProps>) {
  return (
    <select
      className={`h-10 w-full rounded-lg border border-border-default bg-surface-base px-3 text-sm text-text-primary outline-none transition focus:border-border-active focus:ring-2 focus:ring-border-active/35 ${className}`.trim()}
      {...props}
    >
      {children}
    </select>
  );
}
