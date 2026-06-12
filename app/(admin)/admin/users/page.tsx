import { AdminUsersClient } from "@/components/admin/admin-users-client";
import { NoAccessState } from "@/components/admin/no-access-state";
import { PageHeader } from "@/components/ui/page-header";
import { canManageUsers } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { listBranchesByOrganization } from "@/lib/data/repositories/branches";
import { listRestroomsByOrganization } from "@/lib/data/repositories/restrooms";
import { listShiftsByOrganization } from "@/lib/data/repositories/shifts";
import { listUsersByOrganization } from "@/lib/data/repositories/users";

export const metadata = {
  title: "ניהול משתמשים | CleanPulse",
};

export default async function AdminUsersPage() {
  const user = await requireUser();

  if (!canManageUsers(user)) {
    return <NoAccessState title="אין גישה לניהול משתמשים" description="רק owner או admin יכולים לנהל משתמשים עסקיים." />;
  }

  const [users, branches, restrooms, shifts] = await Promise.all([
    listUsersByOrganization(user.organizationId),
    listBranchesByOrganization(user.organizationId),
    listRestroomsByOrganization(user.organizationId),
    listShiftsByOrganization(user.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="משתמשים והרשאות"
        description="ניהול צוות עסקי, תפקידים, שיוך אזורים וסיסמאות זמניות."
      />

      <AdminUsersClient users={users} branches={branches} restrooms={restrooms} shifts={shifts} />
    </div>
  );
}
