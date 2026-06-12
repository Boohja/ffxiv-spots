import Link from "next/link";

import { spotSearchHref } from "@/lib/spots/search-links";

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

export function SearchPill({
  filter,
  label,
}: Readonly<{
  filter: "expansion" | "landmark" | "region" | "tag" | "zone";
  label: string;
}>) {
  return <TagPill label={label} href={spotSearchHref(filter, label)} />;
}
