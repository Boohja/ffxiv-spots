type PaginationProps = Readonly<{
  current: number;
  total: number;
}>;

export function Pagination({ current, total }: Readonly<PaginationProps>) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-base p-1.5 text-xs text-text-secondary">
      <button type="button" className="h-8 w-8 rounded-full hover:bg-surface-raised">
        {"<"}
      </button>
      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-surface-overlay px-3 text-text-primary">
        {current}
      </span>
      <span>/</span>
      <span>{total}</span>
      <button type="button" className="h-8 w-8 rounded-full hover:bg-surface-raised">
        {">"}
      </button>
    </div>
  );
}
