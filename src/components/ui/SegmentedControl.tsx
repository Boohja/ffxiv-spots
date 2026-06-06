type SegmentedItem = {
  id: string;
  label: string;
};

type SegmentedControlProps = Readonly<{
  items: SegmentedItem[];
  activeId: string;
}>;

export function SegmentedControl({ items, activeId }: Readonly<SegmentedControlProps>) {
  return (
    <div className="inline-flex h-11 items-center rounded-full border border-border-default bg-surface-base p-1">
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <button
            key={item.id}
            type="button"
            className={`inline-flex h-9 items-center rounded-full px-4 text-xs font-semibold tracking-wide transition ${
              isActive
                ? "bg-gradient-primary text-text-primary"
                : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
