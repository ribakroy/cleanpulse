import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

type ErrorStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-danger/8 px-5 py-8 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-danger/14 text-danger">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
