import Link from "next/link";
import { ErrorState } from "@/components/ui/error-state";
import { buttonVariants } from "@/components/ui/button";

type NoAccessStateProps = {
  title?: string;
  description: string;
};

export function NoAccessState({
  title = "אין לך הרשאה למסך הזה",
  description,
}: NoAccessStateProps) {
  return (
    <ErrorState
      title={title}
      description={description}
      action={
        <Link href="/admin/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
          חזרה לדשבורד
        </Link>
      }
    />
  );
}
