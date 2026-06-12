"use client";

import Link from "next/link";
import { useActionState, useMemo, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { BarChart3, KeyRound, Save, Search, UserPlus, UserX } from "lucide-react";
import {
  createBusinessUserAction,
  disableBusinessUserAction,
  resetBusinessUserPasswordAction,
  updateBusinessUserAction,
  type UserManagementActionState,
} from "@/app/(admin)/admin/users/actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatRoleLabel } from "@/lib/auth/permissions";
import type { BranchRecord, RestroomRecord, SafeUserRecord, ShiftRecord } from "@/lib/data/types";
import type { UserRole } from "@/types/domain";

type AdminUsersClientProps = {
  users: SafeUserRecord[];
  branches: BranchRecord[];
  restrooms: RestroomRecord[];
  shifts: ShiftRecord[];
};

const initialActionState: UserManagementActionState = {
  ok: false,
  message: null,
};

const createRoleOptions: Array<{ value: UserRole; label: string }> = [
  { value: "admin", label: "מנהל על עסקי" },
  { value: "area_manager", label: "מנהל אזור" },
  { value: "operations_worker", label: "עובד תפעולי" },
];

const editRoleOptions: Array<{ value: UserRole; label: string }> = [
  { value: "owner", label: "בעלים" },
  { value: "admin", label: "מנהל על עסקי" },
  { value: "area_manager", label: "מנהל אזור" },
  { value: "operations_worker", label: "עובד תפעולי" },
  { value: "manager", label: "מנהל אזור (legacy)" },
  { value: "cleaner", label: "עובד תפעולי (legacy)" },
];

function uniqueIds(ids: string[]) {
  return Array.from(new Set(ids));
}

function SubmitButton({
  children,
  variant = "primary",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} size="sm" disabled={pending}>
      {pending ? "שומר..." : children}
    </Button>
  );
}

function ActionMessage({ state }: { state: UserManagementActionState }) {
  if (!state.message) return null;

  return (
    <div
      className={`rounded-[var(--radius-md)] border px-4 py-3 text-sm font-semibold ${
        state.ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <p>{state.message}</p>
      {state.temporaryPassword ? (
        <p dir="ltr" className="mt-2 rounded bg-white px-3 py-2 font-mono text-sm text-foreground">
          {state.temporaryPassword}
        </p>
      ) : null}
    </div>
  );
}

function ScopeFields({
  branches,
  restrooms,
  user,
}: {
  branches: BranchRecord[];
  restrooms: RestroomRecord[];
  user?: SafeUserRecord | undefined;
}) {
  const allowedBranchIds = new Set(user?.allowedBranchIds ?? []);
  const allowedRestroomIds = new Set([...(user?.allowedRestroomIds ?? []), ...(user?.assignedRestroomIds ?? [])]);
  const branchNames = new Map(branches.map((branch) => [branch.id, branch.name] as const));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-2">
        <p className="text-sm font-bold text-foreground">סניפים מורשים</p>
        <div className="max-h-44 space-y-2 overflow-y-auto rounded-[var(--radius-md)] border border-border bg-white/70 p-3">
          {branches.length === 0 ? (
            <p className="text-xs text-muted">אין סניפים זמינים.</p>
          ) : (
            branches.map((branch) => (
              <label key={branch.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="allowedBranchIds"
                  value={branch.id}
                  defaultChecked={allowedBranchIds.has(branch.id)}
                  className="size-4 accent-brand"
                />
                <span>{branch.name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-bold text-foreground">אזורי שירותים מורשים</p>
        <div className="max-h-44 space-y-2 overflow-y-auto rounded-[var(--radius-md)] border border-border bg-white/70 p-3">
          {restrooms.length === 0 ? (
            <p className="text-xs text-muted">אין אזורי שירותים זמינים.</p>
          ) : (
            restrooms.map((restroom) => (
              <label key={restroom.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="allowedRestroomIds"
                  value={restroom.id}
                  defaultChecked={allowedRestroomIds.has(restroom.id)}
                  className="size-4 accent-brand"
                />
                <span>
                  {restroom.name}
                  <span className="text-xs text-muted"> · {branchNames.get(restroom.branchId) ?? "סניף לא ידוע"}</span>
                </span>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function UserStatusBadge({ user }: { user: SafeUserRecord }) {
  return (
    <Badge variant={user.isActive === false ? "outline" : "secondary"}>
      {user.isActive === false ? "לא פעיל" : "פעיל"}
    </Badge>
  );
}

export function AdminUsersClient({ users, branches, restrooms, shifts }: AdminUsersClientProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [roleFilter, setRoleFilter] = useState("");
  const [createState, createAction] = useActionState(createBusinessUserAction, initialActionState);
  const [updateState, updateAction] = useActionState(updateBusinessUserAction, initialActionState);
  const [disableState, disableAction] = useActionState(disableBusinessUserAction, initialActionState);
  const [resetState, resetAction] = useActionState(resetBusinessUserPasswordAction, initialActionState);
  const shiftNames = useMemo(() => new Map(shifts.map((shift) => [shift.id, shift.name] as const)), [shifts]);
  const branchNames = useMemo(() => new Map(branches.map((branch) => [branch.id, branch.name] as const)), [branches]);
  const restroomNames = useMemo(() => new Map(restrooms.map((restroom) => [restroom.id, restroom.name] as const)), [restrooms]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const isActive = user.isActive !== false;

      if (statusFilter === "active" && !isActive) return false;
      if (statusFilter === "inactive" && isActive) return false;
      if (roleFilter && user.role !== roleFilter) return false;

      if (normalizedQuery) {
        const haystack = `${user.fullName} ${user.email} ${user.phone ?? ""} ${user.jobTitle ?? ""}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }

      return true;
    });
  }, [query, roleFilter, statusFilter, users]);

  const latestActionState = [resetState, disableState, updateState, createState].find((state) => state.message) ?? initialActionState;

  return (
    <div className="space-y-6">
      <ActionMessage state={latestActionState} />

      <Card className="border-brand-water/20 bg-brand-soft/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="size-4 text-brand" />
            יצירת משתמש חדש
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Input name="fullName" label="שם מלא" placeholder="דני כהן" required minLength={2} />
              <Input name="email" label="אימייל" type="email" placeholder="user@example.com" required />
              <Input name="phone" label="טלפון" placeholder="אופציונלי" />
              <Input name="jobTitle" label="תפקיד פנימי" placeholder="אופציונלי" />
              <Select name="role" label="תפקיד" defaultValue="operations_worker" required>
                {createRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select name="defaultShiftId" label="משמרת קבועה" defaultValue="">
                <option value="">ללא משמרת קבועה</option>
                {shifts.filter((shift) => shift.isActive).map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name}
                  </option>
                ))}
              </Select>
              <Input
                name="temporaryPassword"
                label="סיסמה זמנית"
                placeholder="ריק = יצירה אוטומטית"
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <ScopeFields branches={branches} restrooms={restrooms} />

            <div className="flex justify-end">
              <SubmitButton>
                <UserPlus className="size-4" />
                צור משתמש
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <CardTitle>משתמשים בארגון ({filteredUsers.length})</CardTitle>
              <p className="mt-1 text-sm text-muted">חיפוש, עריכת תפקידים, scopes ואיפוס סיסמאות.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[640px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="חיפוש שם או מייל"
                  className="h-11 w-full rounded-[var(--radius-md)] border border-border bg-white/90 py-2 pr-10 pl-3 text-sm outline-none focus:border-brand focus:ring-3 focus:ring-brand/15"
                />
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 rounded-[var(--radius-md)] border border-border bg-white/90 px-3 text-sm outline-none focus:border-brand"
              >
                <option value="active">פעילים</option>
                <option value="inactive">לא פעילים</option>
                <option value="all">הכל</option>
              </select>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="h-11 rounded-[var(--radius-md)] border border-border bg-white/90 px-3 text-sm outline-none focus:border-brand"
              >
                <option value="">כל התפקידים</option>
                {editRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredUsers.length === 0 ? (
            <p className="rounded-[var(--radius-md)] border border-border bg-white/70 p-6 text-center text-sm text-muted">
              לא נמצאו משתמשים לפי הסינון שנבחר.
            </p>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="rounded-[var(--radius-lg)] border border-border bg-white/82 p-4 shadow-soft">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-extrabold text-foreground">{user.fullName}</h3>
                      <UserStatusBadge user={user} />
                      <Badge variant="outline">{formatRoleLabel(user.role)}</Badge>
                    </div>
                    <p className="text-sm text-muted">{user.email}</p>
                    <p className="text-xs text-muted">
                      {[user.phone, user.jobTitle].filter(Boolean).join(" · ") || "אין פרטים נוספים"}
                    </p>
                    <p className="text-xs text-muted">
                      משמרת: {user.defaultShiftId ? shiftNames.get(user.defaultShiftId) ?? "לא זמינה" : "לא הוגדרה"}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(user.allowedBranchIds ?? []).slice(0, 3).map((branchId) => (
                        <Badge key={branchId} variant="outline" className="text-[11px]">
                          {branchNames.get(branchId) ?? "סניף לא זמין"}
                        </Badge>
                      ))}
                      {uniqueIds([
                        ...(user.allowedRestroomIds ?? []),
                        ...(user.assignedRestroomIds ?? []),
                      ]).slice(0, 3).map((restroomId) => (
                        <Badge key={restroomId} variant="outline" className="text-[11px]">
                          {restroomNames.get(restroomId) ?? "אזור לא זמין"}
                        </Badge>
                      ))}
                      {!(user.allowedBranchIds?.length || user.allowedRestroomIds?.length || user.assignedRestroomIds?.length) ? (
                        <Badge variant="outline" className="text-[11px]">
                          {user.role === "owner" || user.role === "admin" ? "גישה לכל הארגון" : "ללא scope"}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/reports/team?userId=${encodeURIComponent(user.id)}`}
                      className={buttonVariants({ variant: "secondary", size: "sm" })}
                    >
                      <BarChart3 className="size-4" />
                      צפייה בפעילות
                    </Link>
                    <form
                      action={resetAction}
                      onSubmit={(event) => {
                        if (!window.confirm("ליצור סיסמה זמנית חדשה למשתמש הזה?")) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <SubmitButton variant="outline">
                        <KeyRound className="size-4" />
                        איפוס סיסמה
                      </SubmitButton>
                    </form>
                    {user.isActive !== false ? (
                      <form
                        action={disableAction}
                        onSubmit={(event) => {
                          if (!window.confirm("להשבית את המשתמש? הוא לא יוכל להתחבר עד שיופעל מחדש.")) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="userId" value={user.id} />
                        <SubmitButton variant="danger">
                          <UserX className="size-4" />
                          השבתה
                        </SubmitButton>
                      </form>
                    ) : null}
                  </div>
                </div>

                {(resetState.targetUserId === user.id && resetState.temporaryPassword) ||
                (createState.targetUserId === user.id && createState.temporaryPassword) ? (
                  <div className="mt-4 rounded-[var(--radius-md)] border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                    <p>סיסמה זמנית להצגה חד־פעמית:</p>
                    <p dir="ltr" className="mt-2 rounded bg-white px-3 py-2 font-mono text-foreground">
                      {resetState.targetUserId === user.id ? resetState.temporaryPassword : createState.temporaryPassword}
                    </p>
                  </div>
                ) : null}

                <details className="mt-4 rounded-[var(--radius-md)] border border-border bg-surface-muted/40 p-3">
                  <summary className="cursor-pointer text-sm font-bold text-brand-deep">עריכת משתמש והרשאות</summary>
                  <form action={updateAction} className="mt-4 space-y-5">
                    <input type="hidden" name="userId" value={user.id} />
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <Input name="fullName" label="שם מלא" defaultValue={user.fullName} required minLength={2} />
                      <Input name="email" label="אימייל" type="email" defaultValue={user.email} required />
                      <Input name="phone" label="טלפון" defaultValue={user.phone ?? ""} />
                      <Input name="jobTitle" label="תפקיד פנימי" defaultValue={user.jobTitle ?? ""} />
                      <Select name="role" label="תפקיד" defaultValue={user.role} required>
                        {editRoleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                      <Select name="defaultShiftId" label="משמרת קבועה" defaultValue={user.defaultShiftId ?? ""}>
                        <option value="">ללא משמרת קבועה</option>
                        {shifts.map((shift) => (
                          <option key={shift.id} value={shift.id}>
                            {shift.name}{shift.isActive ? "" : " (לא פעילה)"}
                          </option>
                        ))}
                      </Select>
                      <label className="flex h-12 items-center gap-2 self-end rounded-[var(--radius-md)] border border-border bg-white/90 px-4 text-sm font-bold">
                        <input
                          type="checkbox"
                          name="isActive"
                          defaultChecked={user.isActive !== false}
                          className="size-4 accent-brand"
                        />
                        משתמש פעיל
                      </label>
                    </div>

                    <ScopeFields branches={branches} restrooms={restrooms} user={user} />

                    {updateState.targetUserId === user.id && updateState.message ? (
                      <ActionMessage state={updateState} />
                    ) : null}

                    <div className="flex justify-end">
                      <SubmitButton>
                        <Save className="size-4" />
                        שמירת שינויים
                      </SubmitButton>
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
