import type { ReactNode } from "react";
import { SuperShell } from "@/components/super/super-shell";
import { requireSuperAdmin } from "@/lib/auth/session";

export const metadata = {
  title: "לוח בקרה של הבעלים | CleanPulse",
  description: "מערכת ניהול על עבור CleanPulse",
};

export default async function SuperAreaLayout({ children }: { children: ReactNode }) {
  // Enforce super_admin authentication
  const user = await requireSuperAdmin();

  return (
    <SuperShell user={user}>
      {children}
    </SuperShell>
  );
}
