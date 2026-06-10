import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createIssueTypeLabelMap, formatIncidentTitle } from "@/lib/admin/presenters";
import { canResolveIncident, canViewIncidents } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { listBranchesByOrganization } from "@/lib/data/repositories/branches";
import { listIncidentsByOrganization } from "@/lib/data/repositories/incidents";
import { listIssueTypes } from "@/lib/data/repositories/issue-types";
import { listRestroomsByOrganization } from "@/lib/data/repositories/restrooms";
import { formatDateTime } from "@/lib/utils/format";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { getSlaBadgeStyles } from "@/lib/utils/sla";
import { IncidentsPolling } from "@/components/admin/incidents-polling";

export const metadata = {
  title: "ניהול דיווחים | CleanPulse",
};

type NotificationLog = {
  id: string;
  incidentId: string;
  recipientId: string | null;
  provider: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
};

interface PageProps {
  searchParams: Promise<{
    status?: string;
    branchId?: string;
    restroomId?: string;
    issueKey?: string;
    source?: string;
    search?: string;
  }>;
}

function NotificationStatusBadge({ logs }: { logs: NotificationLog[] }) {
  if (logs.length === 0) return null;

  const hasFailed = logs.some((l) => l.status === "failed");
  if (hasFailed) {
    return (
      <Badge className="bg-red-50 text-red-700 border border-red-200 shadow-sm font-semibold text-xs">
        התראת מייל נכשלה
      </Badge>
    );
  }

  const hasNoRecipients = logs.some((l) => l.status === "no_recipients");
  if (hasNoRecipients) {
    return (
      <Badge className="bg-slate-100 text-slate-700 border border-slate-200 shadow-sm font-semibold text-xs">
        אין נמענים להתרעה
      </Badge>
    );
  }

  const hasMockSent = logs.some((l) => l.status === "mock_sent");
  if (hasMockSent) {
    return (
      <Badge className="bg-sky-50 text-sky-700 border border-sky-200 shadow-sm font-semibold text-xs">
        התראה נשלחה
      </Badge>
    );
  }

  const hasSent = logs.some((l) => l.status === "sent");
  if (hasSent) {
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm font-semibold text-xs">
        התראת מייל נשלחה
      </Badge>
    );
  }

  return null;
}

export default async function AdminIncidentsPage({ searchParams }: PageProps) {
  const user = await requireUser();

  if (!canViewIncidents(user)) {
    return <EmptyState title="אין גישה לדיווחים" description="למשתמש הנוכחי אין הרשאה לצפייה בדיווחים." />;
  }

  const params = await searchParams;
  const filterStatus = params.status || "";
  const filterBranch = params.branchId || "";
  const filterRestroom = params.restroomId || "";
  const filterIssue = params.issueKey || "";
  const filterSource = params.source || "";
  const filterSearch = (params.search || "").trim().toLowerCase();

  const [incidents, branches, restrooms, issueTypes, notificationLogs] = await Promise.all([
    listIncidentsByOrganization(user.organizationId),
    listBranchesByOrganization(user.organizationId),
    listRestroomsByOrganization(user.organizationId),
    listIssueTypes(),
    getDataAdapter().query("notification_logs", { organizationId: user.organizationId }),
  ]);

  const issueTypeLabels = createIssueTypeLabelMap(issueTypes);
  const branchNames = new Map(branches.map((b) => [b.id, b.name] as const));
  const restroomNames = new Map(restrooms.map((r) => [r.id, r.name] as const));

  // Group notification logs by incidentId
  const logsByIncident = new Map<string, NotificationLog[]>();
  for (const log of (notificationLogs as NotificationLog[])) {
    const list = logsByIncident.get(log.incidentId) || [];
    list.push(log);
    logsByIncident.set(log.incidentId, list);
  }

  // Filter in memory
  const filteredIncidents = incidents.filter((incident) => {
    if (filterStatus && incident.status !== filterStatus) return false;
    if (filterBranch && incident.branchId !== filterBranch) return false;
    if (filterRestroom && incident.restroomId !== filterRestroom) return false;
    if (filterIssue && incident.issueKey !== filterIssue) return false;
    if (filterSource && incident.source !== filterSource) return false;
    
    if (filterSearch) {
      const branchName = (branchNames.get(incident.branchId) || "").toLowerCase();
      const restroomName = (restroomNames.get(incident.restroomId) || "").toLowerCase();
      const title = formatIncidentTitle(incident, issueTypeLabels).toLowerCase();
      const match = branchName.includes(filterSearch) || 
                    restroomName.includes(filterSearch) || 
                    title.includes(filterSearch) || 
                    incident.id.toLowerCase().includes(filterSearch);
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="דיווחים"
        description="רשימה נקייה לטיפול מהיר לפי מיקום, סוג תקלה וסטטוס."
        actions={
          <div className="flex items-center gap-2">
            <IncidentsPolling />
            <Badge variant={canResolveIncident(user) ? "success" : "outline"}>
              {canResolveIncident(user) ? "מורשה לעדכן סטטוס" : "צפייה בלבד"}
            </Badge>
          </div>
        }
      />

      {/* Filter Bar */}
      <form
        method="GET"
        action="/admin/incidents"
        className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 items-end bg-white/70 border border-border p-4 rounded-xl shadow-soft"
      >
        <Input
          name="search"
          label="חיפוש"
          placeholder="חיפוש חופשי..."
          defaultValue={params.search || ""}
        />

        <Select name="status" label="סטטוס" defaultValue={filterStatus}>
          <option value="">הכל</option>
          <option value="open">פתוח</option>
          <option value="acknowledged">התקבל</option>
          <option value="in_progress">בטיפול</option>
          <option value="resolved">טופל</option>
          <option value="dismissed">נדחה</option>
        </Select>

        <Select name="branchId" label="סניף" defaultValue={filterBranch}>
          <option value="">הכל</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>

        <Select name="restroomId" label="אזור שירותים" defaultValue={filterRestroom}>
          <option value="">הכל</option>
          {restrooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({branchNames.get(r.branchId)})
            </option>
          ))}
        </Select>

        <Select name="issueKey" label="סוג תקלה" defaultValue={filterIssue}>
          <option value="">הכל</option>
          {issueTypes.map((i) => (
            <option key={i.key} value={i.key}>
              {i.labelHe}
            </option>
          ))}
        </Select>

        <Select name="source" label="מקור" defaultValue={filterSource}>
          <option value="">הכל</option>
          <option value="kiosk">טאבלט</option>
          <option value="qr">סריקת QR</option>
        </Select>

        <div className="sm:col-span-2 md:col-span-3 xl:col-span-6 flex justify-end gap-2 mt-2">
          <Link
            href="/admin/incidents"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            נקה מסננים
          </Link>
          <button
            type="submit"
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            בצע סינון
          </button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>דיווחים שנמצאו ({filteredIncidents.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredIncidents.length === 0 ? (
            <EmptyState
              title="לא נמצאו דיווחים"
              description="נסה לשנות את המסננים או לבצע חיפוש אחר."
            />
          ) : (
            filteredIncidents.map((incident) => {
              const logs = logsByIncident.get(incident.id) || [];
              const slaBadge = getSlaBadgeStyles(incident);
              return (
                <div
                  key={incident.id}
                  className="rounded-xl border border-border bg-white p-4 shadow-soft hover:border-brand-water/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-bold text-foreground">
                        {formatIncidentTitle(incident, issueTypeLabels)}
                      </span>
                      <StatusBadge status={incident.status} />
                      <Badge variant="outline" className="font-bold">
                        {incident.priority === "critical" ? "קריטי" : incident.priority === "high" ? "גבוה" : incident.priority === "medium" ? "בינוני" : "נמוך"}
                      </Badge>
                      <Badge className={`${slaBadge.bg} ${slaBadge.text} font-bold border`}>
                        {slaBadge.label}
                      </Badge>
                      <NotificationStatusBadge logs={logs} />
                    </div>

                    <p className="text-sm text-muted">
                      <strong className="text-foreground">{branchNames.get(incident.branchId) ?? "לא ידוע"}</strong> ·
                      <strong className="text-foreground">{restroomNames.get(incident.restroomId) ?? "לא ידוע"}</strong> ·
                      <strong className="text-foreground">{incident.source === "kiosk" ? "טאבלט" : "סריקת QR"}</strong>
                    </p>

                    {incident.customerNote && (
                      <p className="text-sm bg-surface-muted p-2 rounded-lg text-muted max-w-2xl border">
                        {incident.customerNote}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                    <div className="text-left text-xs text-muted font-mono hidden sm:block">
                      <p>{formatDateTime(incident.createdAt)}</p>
                    </div>
                    <Link
                      href={`/admin/incidents/${incident.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      פתיחה וטיפול
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
