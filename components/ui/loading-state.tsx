type LoadingStateProps = {
  title: string;
  description: string;
};

export function LoadingState({ title, description }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-lg)] border border-border bg-white/75 px-5 py-8 text-center">
      <span
        className="mb-4 inline-flex size-10 animate-spin rounded-full border-2 border-brand/30 border-t-brand"
        aria-label="טעינה"
      />
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-7 text-muted">{description}</p>
    </div>
  );
}
