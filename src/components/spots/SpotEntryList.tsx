import Image from "next/image";
import Link from "next/link";

import type { SpotEntry, SpotEntryState } from "@/lib/spots/entry-list";

type SpotEntryListProps = Readonly<{
  entries: SpotEntry[];
  emptyMessage: string;
  showSubmitter?: boolean;
}>;

const stateLabels: Record<SpotEntryState, string> = {
  draft: "Draft",
  submitted: "Submitted",
  accepted: "Accepted",
  duplicate: "Duplicate",
};

const stateClasses: Record<SpotEntryState, string> = {
  draft: "border-slate-400/35 bg-slate-400/10 text-slate-200",
  submitted: "border-amber-400/45 bg-amber-400/10 text-amber-200",
  accepted: "border-emerald-400/45 bg-emerald-400/10 text-emerald-200",
  duplicate: "border-cyan-400/45 bg-cyan-400/10 text-cyan-200",
};

export function SpotEntryList({ entries, emptyMessage, showSubmitter = false }: SpotEntryListProps) {
  if (entries.length === 0) {
    return (
      <section className="glass-panel rounded-lg p-6 text-center">
        <p className="text-sm font-semibold text-text-primary">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {entries.map((entry) => (
        <SpotEntryListItem key={entry.id} entry={entry} showSubmitter={showSubmitter} />
      ))}
    </ul>
  );
}

function SpotEntryListItem({
  entry,
  showSubmitter,
}: Readonly<{
  entry: SpotEntry;
  showSubmitter: boolean;
}>) {
  const spotHref = showSubmitter || entry.state === "draft" ? `/spots/${entry.slug}/edit` : `/spots/${entry.slug}`;

  return (
    <li>
          <article className="glass-panel overflow-hidden rounded-lg transition hover:border-border-active/60">
            <div className="grid min-h-28 grid-cols-[112px_minmax(0,1fr)] sm:grid-cols-[136px_minmax(0,1fr)]">
              <Link
                href={spotHref}
                className="relative min-h-28 overflow-hidden border-r border-border-subtle bg-surface-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-active"
              >
                {entry.image ? (
                  <Image
                    src={entry.image.url}
                    alt={entry.image.alt ?? ""}
                    fill
                    sizes="136px"
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src="/spots/placeholder.webp"
                    alt=""
                    fill
                    sizes="136px"
                    className="object-cover grayscale"
                  />
                )}
              </Link>

              <div className="min-w-0 space-y-3 p-3">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-text-primary">
                      <Link
                        href={spotHref}
                        className="transition hover:text-brand-spark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-active"
                      >
                        {entry.title}
                      </Link>
                    </h2>
                    <p className="mt-1 truncate text-sm text-text-secondary">{entry.zone}</p>
                  </div>
                  <StateChip state={entry.state} />
                </div>

                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <EntryFact label="Coordinates" value={formatCoordinates(entry)} />
                  <EntryFact label="Created" value={formatDate(entry.created_at)} />
                </dl>

                {showSubmitter ? <SubmitterLine entry={entry} /> : null}
              </div>
            </div>
          </article>
        </li>
  );
}

function StateChip({ state }: Readonly<{ state: SpotEntryState }>) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${stateClasses[state]}`}
    >
      {stateLabels[state]}
    </span>
  );
}

function EntryFact({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-base px-2 py-1.5">
      <dt className="text-[11px] text-text-muted">{label}</dt>
      <dd className="mt-0.5 truncate font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

function SubmitterLine({ entry }: Readonly<{ entry: SpotEntry }>) {
  const submitter = entry.submitter;

  if (!submitter) {
    return <p className="truncate text-xs text-text-muted">Submitted by unknown user</p>;
  }

  return (
    <p className="truncate text-xs text-text-muted">
      Submitted by{" "}
      <Link
        href={`/users/${submitter.id}`}
        className="font-semibold text-brand-spark transition hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-active"
      >
        {submitter.displayname ?? submitter.username ?? "XIVSpots user"}
      </Link>
    </p>
  );
}

function formatCoordinates(entry: Pick<SpotEntry, "x" | "y" | "z">) {
  return entry.z === null ? `X ${entry.x}, Y ${entry.y}` : `X ${entry.x}, Y ${entry.y}, Z ${entry.z}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}
