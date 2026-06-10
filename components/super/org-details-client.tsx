"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  Edit2,
  KeyRound,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  updateOrgStatusAction,
  updateOrgDetailsAction,
  resetUserPasswordAction,
  createOrgUserAction,
} from "@/app/super/organizations/[id]/actions";
import type { OrganizationRecord, SafeUserRecord } from "@/lib/data/types";
import { formatRoleLabel } from "@/lib/auth/permissions";

const planLabels: Record<string, string> = {
  free: "חינמי",
  starter: "מתחיל",
  basic: "בסיסי",
  pro: "מקצועי",
  enterprise: "ארגוני",
};

type OrgDetailsClientProps = {
  org: OrganizationRecord;
  users: SafeUserRecord[];
  screensCount: number;
  branchesCount: number;
};

export function OrgDetailsClient({ org, users, screensCount, branchesCount }: OrgDetailsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // UI Modes
  const [isEditing, setIsEditing] = useState(false);
  const [activeResetUserId, setActiveResetUserId] = useState<string | null>(null);
  const [resetPasswordPlain, setResetPasswordPlain] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);

  // New User Form States
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"owner" | "admin" | "manager" | "cleaner">("admin");

  function clearMessages() {
    setError(null);
    setSuccessMsg(null);
  }

  function handleStatusChange(newStatus: "active" | "trial" | "suspended" | "cancelled") {
    clearMessages();
    const confirmed = window.confirm(`האם אתה בטוח שברצונך לשנות את סטטוס העסק ל: ${
      newStatus === "active" ? "פעיל" : newStatus === "trial" ? "תקופת ניסיון" : newStatus === "suspended" ? "מושעה" : "מבוטל"
    }?`);

    if (!confirmed) return;

    startTransition(async () => {
      const res = await updateOrgStatusAction(org.id, newStatus);
      if (res.success) {
        setSuccessMsg("סטטוס העסק עודכן בהצלחה.");
      } else {
        setError(res.error ?? "שגיאה בעדכון סטטוס העסק.");
      }
    });
  }

  async function handleUpdateDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearMessages();

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateOrgDetailsAction(org.id, formData);
      if (res.success) {
        setSuccessMsg("פרטי העסק עודכנו בהצלחה.");
        setIsEditing(false);
      } else {
        setError(res.error ?? "שגיאה בעדכון פרטי העסק.");
      }
    });
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (!activeResetUserId) return;

    startTransition(async () => {
      const res = await resetUserPasswordAction(org.id, activeResetUserId, resetPasswordPlain);
      if (res.success) {
        setSuccessMsg(`הסיסמה אופסה בהצלחה ל: ${resetPasswordPlain}. נא למסור אותה למשתמש.`);
        setActiveResetUserId(null);
        setResetPasswordPlain("");
      } else {
        setError(res.error ?? "שגיאה באיפוס הסיסמה.");
      }
    });
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    startTransition(async () => {
      const res = await createOrgUserAction(
        org.id,
        newUserEmail,
        newUserFullName,
        newUserPassword,
        newUserRole
      );
      if (res.success) {
        setSuccessMsg(`המשתמש ${newUserFullName} נוצר בהצלחה.`);
        setIsAddingUser(false);
        setNewUserEmail("");
        setNewUserFullName("");
        setNewUserPassword("");
      } else {
        setError(res.error ?? "שגיאה ביצירת משתמש נוסף.");
      }
    });
  }

  const computedStatus = org.status || (org.isActive ? "active" : "suspended");

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Messages */}
      {error && (
        <div className="rounded-[var(--radius-lg)] border border-danger/25 bg-danger/8 px-4 py-3 text-sm font-semibold text-danger">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="rounded-[var(--radius-lg)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          {successMsg}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: General status & Action Controls */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-md">ניהול מנוי וסטטוס</CardTitle>
              <CardDescription>שינוי מהיר של מצב הגישה של הלקוח.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="pb-3 border-b border-border flex items-center justify-between">
                <span className="text-sm text-muted">סטטוס נוכחי:</span>
                <Badge
                  variant={
                    computedStatus === "active"
                      ? "success"
                      : computedStatus === "trial"
                      ? "secondary"
                      : computedStatus === "suspended"
                      ? "danger"
                      : "outline"
                  }
                >
                  {computedStatus === "active"
                    ? "פעיל"
                    : computedStatus === "trial"
                    ? "תקופת ניסיון"
                    : computedStatus === "suspended"
                    ? "מושעה"
                    : computedStatus === "cancelled"
                    ? "מבוטל"
                    : "פעיל"}
                </Badge>
              </div>

              {/* Status Buttons */}
              <div className="space-y-2 pt-2">
                {computedStatus !== "active" && (
                  <Button
                    type="button"
                    variant="primary"
                    fullWidth
                    disabled={isPending}
                    onClick={() => handleStatusChange("active")}
                  >
                    להפעיל מנוי עסק
                  </Button>
                )}
                {computedStatus !== "suspended" && (
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    disabled={isPending}
                    onClick={() => handleStatusChange("suspended")}
                    className="border-rose-200 text-rose-700 hover:bg-rose-50"
                  >
                    השעיית גישה לעסק
                  </Button>
                )}
                {computedStatus !== "trial" && (
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    disabled={isPending}
                    onClick={() => handleStatusChange("trial")}
                  >
                    העברה לתקופת ניסיון
                  </Button>
                )}
                {computedStatus !== "cancelled" && (
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    disabled={isPending}
                    onClick={() => handleStatusChange("cancelled")}
                  >
                    ביטול מנוי עסק
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-brand-deep text-white border-none">
            <CardHeader>
              <CardTitle className="text-md text-white">מעבר מהיר</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-brand-water/90 leading-normal">
                התחברות לאדמין העסק. שימו לב שעליכם להשתמש בפרטי המשתמש של העסק כדי להיכנס לפורטל הניהול שלהם.
              </p>
              <a
                href={`/admin/dashboard`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-full items-center justify-center rounded-[var(--radius-md)] bg-brand hover:bg-brand/90 text-white font-bold text-sm transition-colors"
              >
                פתח פורטל אדמין עסק ↗
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Details forms & Lists */}
        <div className="md:col-span-2 space-y-6">
          {/* Organization Details Card */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">פרטי העסק והגדרות SaaS</CardTitle>
                <CardDescription>שם, הגדרות מנוי, גבייה ידנית והערות מנהל.</CardDescription>
              </div>
              {!isEditing && (
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="size-3 ml-1" />
                  עריכת פרטים
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleUpdateDetails} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="שם העסק *"
                      name="name"
                      type="text"
                      defaultValue={org.name}
                      required
                    />
                    <div className="space-y-1.5 text-right">
                      <label htmlFor="plan" className="text-xs font-semibold text-muted">
                        תוכנית מנוי
                      </label>
                      <select
                        id="plan"
                        name="plan"
                        defaultValue={org.plan || "basic"}
                        className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-border bg-white text-sm focus:outline-none focus:border-brand transition-colors"
                      >
                        <option value="free">Free (חינם)</option>
                        <option value="starter">Starter (מתחיל)</option>
                        <option value="basic">Basic (בסיסי)</option>
                        <option value="pro">Pro (מקצועי)</option>
                        <option value="enterprise">Enterprise (ארגוני)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="מגבלת מסכים מותרת"
                      name="allowedScreensLimit"
                      type="number"
                      defaultValue={org.allowedScreensLimit ?? 5}
                      min={1}
                      required
                    />
                    <Input
                      label="מחיר חודשי (ש״ח)"
                      name="monthlyPrice"
                      type="number"
                      defaultValue={org.monthlyPrice ?? 199}
                      min={0}
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      label="שם איש קשר"
                      name="contactName"
                      type="text"
                      defaultValue={org.contactName || ""}
                    />
                    <Input
                      label="טלפון ליצירת קשר"
                      name="contactPhone"
                      type="tel"
                      defaultValue={org.contactPhone || ""}
                    />
                    <Input
                      label="אימייל לגבייה"
                      name="billingEmail"
                      type="email"
                      defaultValue={org.billingEmail || ""}
                    />
                  </div>

                  <Textarea
                    label="הערות פנימיות לבעלים"
                    name="notes"
                    defaultValue={org.notes || ""}
                    placeholder="הערות פנימיות שאינן חשופות ללקוח..."
                    rows={3}
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      ביטול
                    </Button>
                    <Button type="submit" size="sm" disabled={isPending}>
                      שמירת שינויים
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="text-muted block">סוג תוכנית:</span>
                      <span className="font-semibold text-foreground">{planLabels[org.plan] || org.plan}</span>
                    </div>
                    <div>
                      <span className="text-muted block">מגבלת מסכים:</span>
                      <span className="font-semibold text-foreground">
                        {screensCount} / {org.allowedScreensLimit ?? 5} מסכים מוגדרים
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block">עלות חודשית:</span>
                      <span className="font-semibold text-foreground">
                        {org.monthlyPrice ? `${org.monthlyPrice} ₪ לחודש` : "חינם / ללא עלות"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block">סניפים פעילים:</span>
                      <span className="font-semibold text-foreground">{branchesCount} סניפים מוגדרים</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2 text-sm">
                    <h4 className="font-bold text-foreground text-xs">פרטי איש קשר לגבייה:</h4>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <span className="text-muted text-xs block">שם:</span>
                        <span className="text-foreground font-medium">{org.contactName || "לא הוגדר"}</span>
                      </div>
                      <div>
                        <span className="text-muted text-xs block">טלפון:</span>
                        <span className="text-foreground font-medium">{org.contactPhone || "לא הוגדר"}</span>
                      </div>
                      <div>
                        <span className="text-muted text-xs block">אימייל גבייה:</span>
                        <span className="text-foreground font-medium">{org.billingEmail || "לא הוגדר"}</span>
                      </div>
                    </div>
                  </div>

                  {org.notes && (
                    <div className="pt-3 border-t border-border">
                      <span className="text-muted text-xs block">הערות פנימיות:</span>
                      <p className="text-foreground bg-brand-soft/30 p-3 rounded-[var(--radius-md)] border border-border text-sm mt-1 whitespace-pre-line leading-relaxed">
                        {org.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Management Card */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="size-5 text-muted" />
                  משתמשי המערכת של העסק
                </CardTitle>
                <CardDescription>משתמשים הרשאים לגשת לפורטל הניהול של הארגון.</CardDescription>
              </div>
              {!isAddingUser && (
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingUser(true)}>
                  <UserPlus className="size-3.5 ml-1.5" />
                  הוספת משתמש לעסק
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Form to add user */}
              {isAddingUser && (
                <form onSubmit={handleAddUser} className="p-4 rounded-[var(--radius-lg)] border border-border bg-brand-soft/30 space-y-4">
                  <h4 className="font-bold text-foreground text-sm">הוספת משתמש חדש לעסק</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      label="שם מלא *"
                      type="text"
                      value={newUserFullName}
                      onChange={(e) => setNewUserFullName(e.target.value)}
                      required
                    />
                    <Input
                      label="אימייל להתחברות *"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      required
                    />
                    <Input
                      label="סיסמה *"
                      type="text"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-4 items-end justify-between">
                    <div className="space-y-1.5 text-right flex-1 max-w-[200px]">
                      <label htmlFor="role" className="text-xs font-semibold text-muted">
                        הרשאה (Role)
                      </label>
                      <select
                        id="role"
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as "owner" | "admin" | "manager" | "cleaner")}
                        className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-border bg-white text-sm focus:outline-none focus:border-brand transition-colors"
                      >
                        <option value="owner">Owner (בעלים)</option>
                        <option value="admin">Admin (מנהל על)</option>
                        <option value="manager">Manager (מנהל סניף)</option>
                        <option value="cleaner">Cleaner (צוות ניקיון)</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingUser(false)}>
                        ביטול
                      </Button>
                      <Button type="submit" size="sm" disabled={isPending}>
                        שמור משתמש
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* Reset Password Form Toggle */}
              {activeResetUserId && (
                <form onSubmit={handleResetPassword} className="p-4 rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50/20 space-y-4">
                  <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                    <KeyRound className="size-4" />
                    איפוס סיסמה למשתמש
                  </h4>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Input
                        label="הקלד סיסמה חדשה (מינימום 6 תווים) *"
                        type="text"
                        value={resetPasswordPlain}
                        onChange={(e) => setResetPasswordPlain(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => { setActiveResetUserId(null); setResetPasswordPlain(""); }}>
                        ביטול
                      </Button>
                      <Button type="submit" size="sm" disabled={isPending}>
                        שמור סיסמה חדשה
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* Users list */}
              <div className="divide-y divide-border">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        {user.fullName}
                        <Badge variant={user.role === "owner" || user.role === "admin" ? "primary" : "outline"} className="text-[10px]">
                          {formatRoleLabel(user.role)}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted mt-0.5">{user.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          clearMessages();
                          setActiveResetUserId(user.id);
                          setResetPasswordPlain("");
                        }}
                      >
                        <KeyRound className="size-3.5 ml-1" />
                        איפוס סיסמה
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
