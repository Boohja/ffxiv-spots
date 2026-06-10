import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "icon";
  size?: "sm" | "md" | "lg";
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-active/70 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer";

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border-transparent bg-gradient-primary text-text-primary shadow-[0_8px_24px_-12px_rgba(34,211,238,0.9)] hover:bg-gradient-primary-hover hover:shadow-[0_14px_30px_-14px_rgba(34,211,238,0.95)]",
  secondary:
    "border-border-default bg-surface-elevated text-text-primary hover:border-border-active/60 hover:bg-surface-overlay",
  danger:
    "border-danger/60 bg-danger/15 text-rose-100 hover:border-danger hover:bg-danger/25",
  ghost:
    "border-transparent bg-transparent text-text-secondary hover:border-border-subtle hover:bg-surface-raised hover:text-text-primary",
  icon: "h-10 w-10 border-border-default bg-surface-base text-text-secondary hover:border-border-active/70 hover:text-text-primary",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4",
  lg: "h-11 px-5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
      {...props}
    />
  );
}
