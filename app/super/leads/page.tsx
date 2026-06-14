import Link from "next/link";
import { Building2, CalendarClock, Mail, Phone, UsersRound } from "lucide-react";
import { updateContactLeadStatusAction } from "@/app/super/leads/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { contactLeadStatuses, listContactLeads } from "@/lib/data/repositories/contact-leads";
import { formatDateTime } from "@/lib/utils/format";
import type { ContactLeadRecord, ContactLeadStatus } from "@/lib/data/types";

export const metadata = {
  title: "CRM לידים | CleanPulse",
};

const statusMeta: Record<ContactLeadStatus, {
  label: string;
  description: string;
  badge: "primary" | "secondary" | "outline" | "success" | "warning" | "danger" | "neutral";
}> = {
  new: { label: "חדש", description: "נכנס מהטופס וממתין לטיפול.", badge: "primary" },
  contacted: { label: "נוצר קשר", description: "בוצעה פנייה ראשונה.", badge: "secondary" },
  qualified: { label: "מתאים", description: "עבר סינון ראשוני.", badge: "warning" },
  demo_scheduled: { label: "דמו נקבע", description: "יש המשך שיחה או דמו.", badge: "outline" },
  won: { label: "נסגר", description: "הפך ללקוח.", badge: "success" },
  lost: { label: "לא רלוונטי", description: "נסגר ללא המשך.", badge: "danger" },
};

function getFullName(lead: ContactLeadRecord) {
  return `${lead.firstName} ${lead.lastName}`.trim();
}

export default async function SuperLeadsPage() {
  const leads = await listContactLeads();
  const groupedLeads = contactLeadStatuses.map((status) => ({
    status,
    leads: leads.filter((lead) => lead.status === status),
  }));
  const openLeads = leads.filter((lead) => lead.status !== "won" && lead.status !== "lost").length;
  const newLeads = leads.filter((lead) => lead.status === "new").length;
  const wonLeads = leads.filter((lead) => lead.status === "won").length;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader
        title="CRM לידים"
        description="כל הפניות מטופס צור קשר, עם סטטוס, פרטים והערות טיפול."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "כל הלידים", value: leads.length, icon: UsersRound, tone: "bg-brand-soft text-brand" },
          { label: "פתוחים לטיפול", value: openLeads, icon: CalendarClock, tone: "bg-amber-50 text-amber-700" },
          { label: "חדשים", value: newLeads, icon: Mail, tone: "bg-sky-50 text-sky-700" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="border shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-muted">{label}</CardTitle>
              <span className={`flex size-10 items-center justify-center rounded-[15px] ${tone}`}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-foreground">{value}</p>
              <p className="mt-1 text-xs font-semibold text-muted">{wonLeads} נסגרו כלקוחות</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {leads.length === 0 ? (
        <Card className="border shadow-soft">
          <CardContent className="pt-6">
            <EmptyState title="אין לידים עדיין" description="ברגע שמישהו ישאיר פרטים בטופס צור קשר, הוא יופיע כאן." />
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
          {groupedLeads.map(({ status, leads: statusLeads }) => {
            const meta = statusMeta[status];

            return (
              <Card key={status} className="min-w-0 border shadow-soft">
                <CardHeader className="border-b border-border/70 bg-white/55">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-extrabold">{meta.label}</CardTitle>
                      <CardDescription className="mt-1 text-xs leading-5">{meta.description}</CardDescription>
                    </div>
                    <Badge variant={meta.badge}>{statusLeads.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {statusLeads.length === 0 ? (
                    <p className="rounded-[15px] border border-dashed border-border bg-surface-muted/45 px-3 py-5 text-center text-xs font-semibold text-muted">
                      אין לידים בסטטוס הזה.
                    </p>
                  ) : (
                    statusLeads.map((lead) => (
                      <article key={lead.id} className="rounded-[15px] border border-border bg-white p-3 shadow-soft">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-base font-extrabold text-foreground">{getFullName(lead)}</h2>
                            <p className="mt-1 truncate text-sm font-bold text-brand-deep">{lead.company}</p>
                          </div>
                          <Badge variant={meta.badge} className="shrink-0">{meta.label}</Badge>
                        </div>

                        <div className="mt-3 space-y-2 text-xs font-semibold text-muted">
                          <p className="flex items-center gap-2">
                            <Phone className="size-4 text-brand" aria-hidden="true" />
                            <a className="text-foreground hover:text-brand" href={`tel:${lead.phone}`}>{lead.phone}</a>
                          </p>
                          <p className="flex items-center gap-2">
                            <Mail className="size-4 text-brand" aria-hidden="true" />
                            <a className="truncate text-foreground hover:text-brand" href={`mailto:${lead.email}`}>{lead.email}</a>
                          </p>
                          <p className="flex items-center gap-2">
                            <Building2 className="size-4 text-brand" aria-hidden="true" />
                            {lead.branchesCount ? `${lead.branchesCount} סניפים` : "כמות סניפים לא צוינה"}
                          </p>
                          <p>נכנס: {formatDateTime(lead.createdAt)}</p>
                        </div>

                        {lead.message ? (
                          <p className="mt-3 rounded-[15px] bg-brand-soft/35 p-3 text-xs font-semibold leading-6 text-brand-deep">
                            {lead.message}
                          </p>
                        ) : null}

                        <form action={updateContactLeadStatusAction} className="mt-3 space-y-2 border-t border-border pt-3">
                          <input type="hidden" name="id" value={lead.id} />
                          <label className="grid gap-1 text-xs font-bold text-foreground">
                            סטטוס
                            <select
                              name="status"
                              defaultValue={lead.status}
                              className="h-10 rounded-[15px] border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none focus:border-brand focus:ring-3 focus:ring-brand/15"
                            >
                              {contactLeadStatuses.map((option) => (
                                <option key={option} value={option}>{statusMeta[option].label}</option>
                              ))}
                            </select>
                          </label>
                          <label className="grid gap-1 text-xs font-bold text-foreground">
                            הערת טיפול
                            <textarea
                              name="notes"
                              rows={3}
                              defaultValue={lead.notes ?? ""}
                              className="rounded-[15px] border border-border bg-white px-3 py-2 text-sm font-semibold leading-6 text-foreground outline-none focus:border-brand focus:ring-3 focus:ring-brand/15"
                              placeholder="מה קרה בשיחה? מה הצעד הבא?"
                            />
                          </label>
                          <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
                            עדכון ליד
                          </button>
                        </form>
                      </article>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      <div className="flex justify-end">
        <Link href="/super/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
          חזרה למרכז השליטה
        </Link>
      </div>
    </div>
  );
}
