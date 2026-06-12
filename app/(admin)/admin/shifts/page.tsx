import { revalidatePath } from "next/cache";
import { CalendarClock, Plus, Save, UsersRound, XCircle } from "lucide-react";
import { NoAccessState } from "@/components/admin/no-access-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { canManageUsers } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { createActivityLog } from "@/lib/data/repositories/activity-logs";
import { listBranchesByOrganization } from "@/lib/data/repositories/branches";
import { listRestroomsByOrganization } from "@/lib/data/repositories/restrooms";
import { createShift, deactivateShift, listShiftsByOrganization, updateShift } from "@/lib/data/repositories/shifts";
import { listUsersByOrganization } from "@/lib/data/repositories/users";
import type { SafeUserRecord } from "@/lib/data/types";

export const metadata = {
  title: "משמרות | CleanPulse",
};

const weekdayOptions = [
  { value: 0, label: "א׳" },
  { value: 1, label: "ב׳" },
  { value: 2, label: "ג׳" },
  { value: 3, label: "ד׳" },
  { value: 4, label: "ה׳" },
  { value: 5, label: "ו׳" },
  { value: 6, label: "ש׳" },
];

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseDays(formData: FormData) {
  return formData
    .getAll("daysOfWeek")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6);
}

function getStrings(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function assertTime(value: string, label: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new Error(`${label} צריכה להיות בפורמט HH:mm`);
  }

  return value;
}

async function assertBranch(organizationId: string, branchId: string) {
  const branches = await listBranchesByOrganization(organizationId);
  const branch = branches.find((candidate) => candidate.id === branchId);

  if (!branch) {
    throw new Error("הסניף שנבחר אינו שייך לארגון");
  }

  return branch;
}

async function assertRestrooms(organizationId: string, restroomIds: string[]) {
  const restrooms = await listRestroomsByOrganization(organizationId);
  const validRestroomIds = new Set(restrooms.map((restroom) => restroom.id));

  if (restroomIds.some((id) => !validRestroomIds.has(id))) {
    throw new Error("נבחר אזור שירותים שאינו שייך לארגון");
  }
}

async function assertUsers(organizationId: string, userIds: string[]) {
  const users = await listUsersByOrganization(organizationId);
  const validUserIds = new Set(users.map((candidate) => candidate.id));

  if (userIds.some((id) => !validUserIds.has(id))) {
    throw new Error("נבחר עובד שאינו שייך לארגון");
  }
}

async function logShiftAction(actor: SafeUserRecord, action: string, shiftId: string, metadata?: Record<string, unknown>) {
  await createActivityLog({
    organizationId: actor.organizationId,
    actorUserId: actor.id,
    actorFullName: actor.fullName,
    actorRole: actor.role,
    incidentId: null,
    action,
    actionType: action,
    targetType: "shift",
    targetId: shiftId,
    shiftId,
    metadata: {
      actorName: actor.fullName,
      actorRole: actor.role,
      ...metadata,
    },
  });
}

export default async function AdminShiftsPage() {
  const user = await requireUser();

  if (!canManageUsers(user)) {
    return <NoAccessState title="אין גישה לניהול משמרות" description="רק owner או admin יכולים לנהל משמרות." />;
  }

  const [branches, restrooms, users, shifts] = await Promise.all([
    listBranchesByOrganization(user.organizationId),
    listRestroomsByOrganization(user.organizationId),
    listUsersByOrganization(user.organizationId),
    listShiftsByOrganization(user.organizationId),
  ]);
  const branchNames = new Map(branches.map((branch) => [branch.id, branch.name] as const));
  const userNames = new Map(users.map((candidate) => [candidate.id, candidate.fullName] as const));
  const assignableUsers = users.filter((candidate) =>
    candidate.isActive !== false && ["operations_worker", "cleaner", "area_manager", "manager"].includes(candidate.role),
  );

  async function handleCreateShift(formData: FormData) {
    "use server";
    const actor = await requireUser();
    if (!canManageUsers(actor)) throw new Error("אין הרשאה לניהול משמרות");

    const branchId = getString(formData, "branchId");
    const name = getString(formData, "name");
    const startsAt = assertTime(getString(formData, "startsAt"), "שעת התחלה");
    const endsAt = assertTime(getString(formData, "endsAt"), "שעת סיום");
    const daysOfWeek = parseDays(formData);
    const restroomIds = getStrings(formData, "restroomIds");
    const assignedUserIds = getStrings(formData, "assignedUserIds");

    if (name.length < 2) {
      throw new Error("שם משמרת חייב להכיל לפחות 2 תווים");
    }

    await assertBranch(actor.organizationId, branchId);
    await assertRestrooms(actor.organizationId, restroomIds);
    await assertUsers(actor.organizationId, assignedUserIds);
    const created = await createShift({
      organizationId: actor.organizationId,
      branchId,
      restroomIds,
      assignedUserIds,
      name,
      startsAt,
      endsAt,
      daysOfWeek,
      isActive: true,
    });

    await logShiftAction(actor, "shift_created", created.id, {
      branchId,
      name,
      startsAt,
      endsAt,
      daysOfWeek,
      restroomIds,
      assignedUserIds,
    });

    revalidatePath("/admin/shifts");
    revalidatePath("/admin/users");
    revalidatePath("/admin/reports/team");
  }

  async function handleUpdateShift(formData: FormData) {
    "use server";
    const actor = await requireUser();
    if (!canManageUsers(actor)) throw new Error("אין הרשאה לניהול משמרות");

    const shiftId = getString(formData, "shiftId");
    const branchId = getString(formData, "branchId");
    const name = getString(formData, "name");
    const startsAt = assertTime(getString(formData, "startsAt"), "שעת התחלה");
    const endsAt = assertTime(getString(formData, "endsAt"), "שעת סיום");
    const daysOfWeek = parseDays(formData);
    const restroomIds = getStrings(formData, "restroomIds");
    const assignedUserIds = getStrings(formData, "assignedUserIds");
    const isActive = formData.get("isActive") === "on";

    if (name.length < 2) {
      throw new Error("שם משמרת חייב להכיל לפחות 2 תווים");
    }

    await assertBranch(actor.organizationId, branchId);
    await assertRestrooms(actor.organizationId, restroomIds);
    await assertUsers(actor.organizationId, assignedUserIds);
    await updateShift(actor.organizationId, shiftId, {
      branchId,
      restroomIds,
      assignedUserIds,
      name,
      startsAt,
      endsAt,
      daysOfWeek,
      isActive,
    });

    await logShiftAction(actor, "shift_updated", shiftId, {
      branchId,
      name,
      startsAt,
      endsAt,
      daysOfWeek,
      restroomIds,
      assignedUserIds,
      isActive,
    });

    revalidatePath("/admin/shifts");
    revalidatePath("/admin/users");
    revalidatePath("/admin/reports/team");
  }

  async function handleDeactivateShift(formData: FormData) {
    "use server";
    const actor = await requireUser();
    if (!canManageUsers(actor)) throw new Error("אין הרשאה לניהול משמרות");

    const shiftId = getString(formData, "shiftId");
    await deactivateShift(actor.organizationId, shiftId);
    await logShiftAction(actor, "shift_disabled", shiftId);

    revalidatePath("/admin/shifts");
    revalidatePath("/admin/users");
    revalidatePath("/admin/reports/team");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="משמרות"
        description="הגדרת משמרות בסיסית למדידת פעילות צוות לפי שעות, סניף ועובד."
      />

      <Card className="border-brand-water/20 bg-brand-soft/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="size-4 text-brand" />
            יצירת משמרת
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreateShift} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Input name="name" label="שם משמרת" placeholder="בוקר" required minLength={2} />
            <Input name="startsAt" type="time" label="שעת התחלה" required dir="ltr" className="text-left" />
            <Input name="endsAt" type="time" label="שעת סיום" required dir="ltr" className="text-left" />
            <Select name="branchId" label="סניף" required>
              <option value="">בחר סניף</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
            <div className="space-y-2 xl:col-span-3">
              <p className="text-sm font-medium text-foreground">אזורי שירותים במשמרת</p>
              <div className="grid max-h-44 gap-2 overflow-y-auto rounded-[var(--radius-md)] border border-border bg-white/70 p-3 md:grid-cols-2">
                {restrooms.map((restroom) => (
                  <label key={restroom.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="restroomIds" value={restroom.id} className="size-4 accent-brand" />
                    <span>
                      {restroom.name}
                      <span className="text-xs text-muted"> · {branchNames.get(restroom.branchId) ?? "סניף לא ידוע"}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2 xl:col-span-2">
              <p className="text-sm font-medium text-foreground">עובדים משויכים</p>
              <div className="grid max-h-44 gap-2 overflow-y-auto rounded-[var(--radius-md)] border border-border bg-white/70 p-3 md:grid-cols-2">
                {assignableUsers.map((candidate) => (
                  <label key={candidate.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="assignedUserIds" value={candidate.id} className="size-4 accent-brand" />
                    <span>{candidate.fullName}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2 xl:col-span-5">
              <p className="text-sm font-medium text-foreground">ימים פעילים</p>
              <div className="flex flex-wrap gap-2">
                {weekdayOptions.map((day) => (
                  <label key={day.value} className="rounded-full border border-border bg-white px-3 py-2 text-sm font-bold">
                    <input type="checkbox" name="daysOfWeek" value={day.value} defaultChecked className="ml-2 accent-brand" />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-end xl:col-span-5">
              <Button type="submit">
                <CalendarClock className="size-4" />
                צור משמרת
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>משמרות קיימות ({shifts.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {shifts.length === 0 ? (
            <p className="rounded-[var(--radius-md)] border border-border bg-surface-muted/60 p-5 text-sm text-muted">
              עדיין אין משמרות. צור משמרת כדי לאפשר שיוך עובדים ודוחות לפי משמרת.
            </p>
          ) : (
            shifts.map((shift) => (
              <div key={shift.id} className="rounded-[var(--radius-lg)] border border-border bg-white/82 p-4 shadow-soft">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-extrabold text-foreground">{shift.name}</h2>
                      <Badge variant={shift.isActive ? "secondary" : "outline"}>{shift.isActive ? "פעילה" : "לא פעילה"}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {branchNames.get(shift.branchId ?? "") ?? "סניף לא ידוע"} · {shift.startsAt}-{shift.endsAt}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="inline-flex items-center gap-1">
                        <UsersRound className="size-3.5" />
                        {(shift.assignedUserIds ?? []).length} עובדים במשמרת
                      </span>
                      <span>· {(shift.restroomIds ?? []).length || "כל"} אזורים</span>
                    </p>
                  </div>
                  {shift.isActive ? (
                    <form action={handleDeactivateShift}>
                      <input type="hidden" name="shiftId" value={shift.id} />
                      <Button type="submit" variant="danger" size="sm">
                        <XCircle className="size-4" />
                        השבת
                      </Button>
                    </form>
                  ) : null}
                </div>

                <details className="rounded-[var(--radius-md)] border border-border bg-surface-muted/40 p-3">
                  <summary className="cursor-pointer text-sm font-bold text-brand-deep">עריכה</summary>
                  <form action={handleUpdateShift} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <input type="hidden" name="shiftId" value={shift.id} />
                    <Input name="name" label="שם משמרת" defaultValue={shift.name} required minLength={2} />
                    <Input name="startsAt" type="time" label="שעת התחלה" defaultValue={shift.startsAt} required dir="ltr" className="text-left" />
                    <Input name="endsAt" type="time" label="שעת סיום" defaultValue={shift.endsAt} required dir="ltr" className="text-left" />
                    <Select name="branchId" label="סניף" defaultValue={shift.branchId ?? ""} required>
                      <option value="">בחר סניף</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </Select>
                    <label className="flex h-12 items-center gap-2 self-end rounded-[var(--radius-md)] border border-border bg-white px-4 text-sm font-bold">
                      <input type="checkbox" name="isActive" defaultChecked={shift.isActive} className="size-4 accent-brand" />
                      פעילה
                    </label>
                    <div className="space-y-2 xl:col-span-3">
                      <p className="text-sm font-medium text-foreground">אזורי שירותים במשמרת</p>
                      <div className="grid max-h-44 gap-2 overflow-y-auto rounded-[var(--radius-md)] border border-border bg-white/70 p-3 md:grid-cols-2">
                        {restrooms.map((restroom) => (
                          <label key={restroom.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              name="restroomIds"
                              value={restroom.id}
                              defaultChecked={(shift.restroomIds ?? []).includes(restroom.id)}
                              className="size-4 accent-brand"
                            />
                            <span>
                              {restroom.name}
                              <span className="text-xs text-muted"> · {branchNames.get(restroom.branchId) ?? "סניף לא ידוע"}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 xl:col-span-2">
                      <p className="text-sm font-medium text-foreground">עובדים משויכים</p>
                      <div className="grid max-h-44 gap-2 overflow-y-auto rounded-[var(--radius-md)] border border-border bg-white/70 p-3 md:grid-cols-2">
                        {assignableUsers.map((candidate) => (
                          <label key={candidate.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              name="assignedUserIds"
                              value={candidate.id}
                              defaultChecked={(shift.assignedUserIds ?? []).includes(candidate.id)}
                              className="size-4 accent-brand"
                            />
                            <span>{userNames.get(candidate.id) ?? candidate.fullName}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 xl:col-span-5">
                      <p className="text-sm font-medium text-foreground">ימים פעילים</p>
                      <div className="flex flex-wrap gap-2">
                        {weekdayOptions.map((day) => (
                          <label key={day.value} className="rounded-full border border-border bg-white px-3 py-2 text-sm font-bold">
                            <input
                              type="checkbox"
                              name="daysOfWeek"
                              value={day.value}
                              defaultChecked={(shift.daysOfWeek ?? []).includes(day.value)}
                              className="ml-2 accent-brand"
                            />
                            {day.label}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end xl:col-span-5">
                      <Button type="submit" size="sm">
                        <Save className="size-4" />
                        שמור משמרת
                      </Button>
                    </div>
                  </form>
                </details>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
