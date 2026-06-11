export type SpotStateBadgeState = "draft" | "submitted" | "accepted" | "duplicate";

type SpotStateBadgeProps = Readonly<{
  state: SpotStateBadgeState;
  label?: string;
}>;

const stateLabels: Record<SpotStateBadgeState, string> = {
  draft: "Draft",
  submitted: "Submitted",
  accepted: "Accepted",
  duplicate: "Duplicate",
};

const stateClasses: Record<SpotStateBadgeState, string> = {
  draft: "border-slate-400/35 bg-slate-400/10 text-slate-200",
  submitted: "border-amber-400/45 bg-amber-400/10 text-amber-200",
  accepted: "border-emerald-400/45 bg-emerald-400/10 text-emerald-200",
  duplicate: "border-cyan-400/45 bg-cyan-400/10 text-cyan-200",
};

export function SpotStateBadge({ label, state }: SpotStateBadgeProps) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${stateClasses[state]}`}
    >
      {label ?? stateLabels[state]}
    </span>
  );
}
