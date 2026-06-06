import Link from "next/link";

type TagPillProps = Readonly<{
  label: string;
  href?: string;
}>;

export function TagPill({ label, href }: TagPillProps) {
  const className =
    "inline-flex min-h-7 items-center rounded-full border border-border-default bg-surface-base px-3 py-1 text-xs font-semibold text-text-secondary transition hover:border-border-active/60 hover:text-brand-spark";

  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return <span className={className}>{label}</span>;
}
