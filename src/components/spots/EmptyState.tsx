import Link from "next/link";

export function EmptyState() {
  return (
    <section className="glass-panel rounded-lg p-8 text-center">
      <p className="text-sm font-semibold uppercase text-brand-spark">No matching spots</p>
      <h2 className="mt-2 text-2xl font-semibold text-text-primary">Try a broader search</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-secondary">
        Remove a filter, search by a region name, or browse curated picks while more submissions are prepared.
      </p>
      <Link
        href="/spots"
        className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-border-default bg-surface-elevated px-4 text-sm font-semibold text-text-primary transition hover:border-border-active/60"
      >
        Reset filters
      </Link>
    </section>
  );
}
