type BadgeVariant = "verified" | "active" | "pending" | "hidden";

type BadgeProps = Readonly<{
  label: string;
  variant: BadgeVariant;
}>;

const variantClasses: Record<BadgeVariant, string> = {
  verified: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
  active: "border-cyan-400/40 bg-cyan-500/10 text-cyan-200",
  pending: "border-amber-400/40 bg-amber-500/10 text-amber-200",
  hidden: "border-rose-400/35 bg-rose-500/10 text-rose-200",
};

export function Badge({ label, variant }: Readonly<BadgeProps>) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${variantClasses[variant]}`}
    >
      {label}
    </span>
  );
}
