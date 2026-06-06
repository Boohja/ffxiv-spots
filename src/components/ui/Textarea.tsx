import type { TextareaHTMLAttributes } from "react";

type TextareaProps = Readonly<TextareaHTMLAttributes<HTMLTextAreaElement>>;

export function Textarea({ className = "", ...props }: Readonly<TextareaProps>) {
  return (
    <textarea
      className={`min-h-24 w-full rounded-xl border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary outline-none transition placeholder:text-text-subtle focus:border-border-active focus:ring-2 focus:ring-border-active/35 ${className}`.trim()}
      {...props}
    />
  );
}
