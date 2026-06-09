import { findScreenByPublicToken, updateScreenLastSeen } from "@/lib/data/repositories/screens";
import { getBranchById } from "@/lib/data/repositories/branches";
import { getRestroomById } from "@/lib/data/repositories/restrooms";
import { listIssueTypes } from "@/lib/data/repositories/issue-types";
import { PublicReportForm } from "@/components/kiosk/public-report-form";
import { Droplets } from "lucide-react";

export const metadata = {
  title: "טאבלט דיווח שירותים | CleanPulse",
};

interface KioskPageProps {
  params: Promise<{ token: string }>;
}

export default async function KioskPage({ params }: KioskPageProps) {
  const { token } = await params;

  // 1. Resolve screen using publicToken
  const screen = await findScreenByPublicToken(token);

  if (!screen || !screen.isActive) {
    return <PublicErrorState message="קישור זה אינו תקין או שמסך הטאבלט הושבת." />;
  }

  // 2. Update lastSeenAt (non-blocking for page load)
  await updateScreenLastSeen(screen.id);

  // 3. Resolve branch and restroom
  const branch = await getBranchById(screen.organizationId, screen.branchId);
  const restroom = await getRestroomById(screen.organizationId, screen.restroomId);

  if (!branch || !branch.isActive || !restroom || !restroom.isActive) {
    return <PublicErrorState message="אזור השירותים או הסניף אינם זמינים כרגע." />;
  }

  // 4. Load active issues list
  const issueTypes = await listIssueTypes();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="flex-1 flex flex-col justify-center max-w-5xl w-full mx-auto py-6">
        <PublicReportForm
          token={token}
          source="kiosk"
          branchName={branch.name}
          restroomName={restroom.name}
          issueTypes={issueTypes}
        />
      </div>
      <footer className="py-4 text-center text-xs text-muted/50">
        CleanPulse &copy; {new Date().getFullYear()} · מערכת בקרת איכות וניקיון שירותים
      </footer>
    </div>
  );
}

function PublicErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="surface-panel rounded-[var(--radius-xl)] max-w-md w-full p-8 space-y-6 shadow-panel">
        <div className="flex justify-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Droplets className="size-8 text-brand" />
          </span>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">CleanPulse</h1>
          <p className="text-lg font-medium text-foreground">{message}</p>
        </div>
        <p className="text-sm leading-7 text-muted">
          אם מדובר בתקלה מתמשכת, אנא פנה לצוות המקום.
        </p>
      </div>
    </div>
  );
}
