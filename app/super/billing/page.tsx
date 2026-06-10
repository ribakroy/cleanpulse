import Link from "next/link";
import { Coins, ShieldAlert, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { listOrganizations } from "@/lib/data/repositories/organizations";

const planLabels: Record<string, string> = {
  free: "חינמי",
  starter: "מתחיל",
  basic: "בסיסי",
  pro: "מקצועי",
  enterprise: "ארגוני",
};

export const revalidate = 0; // Dynamic

export default async function SuperBillingPage() {
  const organizations = await listOrganizations();

  // MRR calculations
  const totalMRR = organizations.reduce((acc, org) => {
    if (org.status === "suspended" || org.status === "cancelled") return acc;
    return acc + (org.monthlyPrice || 0);
  }, 0);

  const payingClientsCount = organizations.filter(
    (org) => (org.monthlyPrice || 0) > 0 && (org.status === "active" || (!org.status && org.isActive))
  ).length;

  const trialClientsCount = organizations.filter((org) => org.status === "trial").length;
  const overdueClients = organizations.filter((org) => org.billingStatus === "past_due");

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">גבייה ותוכניות מנוי</h1>
        <p className="text-sm text-muted mt-1">
          מעקב אחר סטטוס התשלומים, הכנסה חודשית חוזרת וניהול ידני של מנויי הלקוחות.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total MRR */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">הכנסה חודשית חוזרת</CardTitle>
            <Coins className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(totalMRR)}
            </div>
            <p className="text-xs text-muted mt-1">מלקוחות פעילים בלבד</p>
          </CardContent>
        </Card>

        {/* Paying Customers */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">לקוחות משלמים</CardTitle>
            <TrendingUp className="size-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{payingClientsCount}</div>
            <p className="text-xs text-muted mt-1">מנויים פעילים בעלות חודשית</p>
          </CardContent>
        </Card>

        {/* Trial Customers */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">לקוחות בתקופת ניסיון</CardTitle>
            <Users className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{trialClientsCount}</div>
            <p className="text-xs text-muted mt-1">גישת הדגמה לזמן מוגבל</p>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">פיגור בתשלום</CardTitle>
            <AlertTriangle className="size-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-danger">{overdueClients.length}</div>
            <p className="text-xs text-danger mt-1">דורשים טיפול וגבייה ידנית</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert */}
      {overdueClients.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-danger/25 bg-danger/5 p-4 space-y-2 text-sm text-danger">
          <div className="flex items-center gap-2 font-bold">
            <ShieldAlert className="size-5 text-danger" />
            <span>לקוחות בפיגור תשלום הדורשים טיפול מיידי:</span>
          </div>
          <ul className="list-disc pr-5 space-y-1">
            {overdueClients.map((c) => (
              <li key={c.id}>
                <Link href={`/super/organizations/${c.id}`} className="underline hover:text-danger/90 font-semibold">
                  {c.name}
                </Link>{" "}
                - עלות מנוי: {c.monthlyPrice} ₪ (איש קשר: {c.contactName || c.billingEmail || "לא הוגדר"})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Billings Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>יומן לקוחות ומצבי גבייה</CardTitle>
          <CardDescription>ריכוז פרטי התוכניות והמחירים של כל העסקים במערכת.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b border-border bg-brand-soft/30 text-muted font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-5">שם עסק</th>
                  <th className="py-3">תוכנית מנוי</th>
                  <th className="py-3">מחיר חודשי</th>
                  <th className="py-3">סטטוס גבייה</th>
                  <th className="py-3">אימייל חיוב</th>
                  <th className="py-3">הערות גבייה / הסדר</th>
                  <th className="py-3 pl-5 text-center">כרטיס לקוח</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {organizations.map((org) => {
                  const billStatus = org.billingStatus || (org.status === "trial" ? "trialing" : "active");
                  return (
                    <tr key={org.id} className="hover:bg-brand-soft/30 transition-colors">
                      <td className="py-4 px-5 font-bold text-foreground">
                        <Link href={`/super/organizations/${org.id}`} className="hover:text-brand transition-colors">
                          {org.name}
                        </Link>
                      </td>
                      <td className="py-4 capitalize font-semibold">{planLabels[org.plan] || org.plan}</td>
                      <td className="py-4 font-medium text-foreground">
                        {org.monthlyPrice ? `${org.monthlyPrice} ₪/חודש` : "חינם / ללא עלות"}
                      </td>
                      <td className="py-4">
                        <Badge
                          variant={
                            billStatus === "active" || billStatus === "manual"
                              ? "success"
                              : billStatus === "trialing"
                              ? "secondary"
                              : billStatus === "past_due"
                              ? "danger"
                              : "outline"
                          }
                        >
                          {billStatus === "active"
                            ? "משולם"
                            : billStatus === "trialing"
                            ? "בתקופת ניסיון"
                            : billStatus === "past_due"
                            ? "פיגור בתשלום"
                            : billStatus === "cancelled"
                            ? "מבוטל"
                            : billStatus === "manual"
                            ? "חשבונית ידנית"
                            : "משולם"}
                        </Badge>
                      </td>
                      <td className="py-4 text-xs text-muted font-mono">
                        {org.billingEmail || "אין אימייל חיוב"}
                      </td>
                      <td className="py-4 text-xs max-w-[200px] truncate text-muted">
                        {org.notes || "אין הערות מיוחדות"}
                      </td>
                      <td className="py-4 pl-5 text-center">
                        <Link
                          href={`/super/organizations/${org.id}`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          נהל מנוי
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
