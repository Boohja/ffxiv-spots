type StepIndicatorProps = Readonly<{
  steps: string[];
  activeStep: number;
}>;

export function StepIndicator({ steps, activeStep }: Readonly<StepIndicatorProps>) {
  return (
    <ol className="flex items-center gap-2 text-xs">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === activeStep;

        return (
          <li key={step} className="flex items-center gap-2 text-text-secondary">
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                isActive
                  ? "border-border-active bg-brand-azure/30 text-brand-spark"
                  : "border-border-default bg-surface-base"
              }`}
            >
              {stepNumber}
            </span>
            <span>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
