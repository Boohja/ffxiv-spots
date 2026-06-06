import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = Readonly<
  InputHTMLAttributes<HTMLInputElement> & {
    leading?: ReactNode;
    trailing?: ReactNode;
  }
>;

export function Input({ className = "", leading, trailing, ...props }: InputProps) {
  return (
    <label className="relative block w-full">
      {leading ? (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-subtle">
          {leading}
        </span>
      ) : null}
      <input
        className={`w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary shadow-[inset_0_0_0_1px_rgba(34,211,238,0.03)] outline-none transition placeholder:text-text-subtle focus:border-border-active focus:ring-2 focus:ring-border-active/35 ${leading ? "pl-10" : ""} ${trailing ? "pr-10" : ""} ${className}`.trim()}
        {...props}
      />
      {trailing ? (
        <span className="absolute inset-y-0 right-3 flex items-center text-text-subtle">
          {trailing}
        </span>
      ) : null}
    </label>
  );
}
