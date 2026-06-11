import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, Clock, MapPin, Shield, User } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { canResolveIncident } from "@/lib/auth/permissions";
import { getIncidentById } from "@/lib/data/repositories/incidents";
import { getBranchById } from "@/lib/data/repositories/branches";
import { getRestroomById } from "@/lib/data/repositories/restrooms";
import { getScreenById } from "@/lib/data/repositories/screens";
import { listActivityLogsForIncident } from "@/lib/data/repositories/activity-logs";
import { listNotificationLogsByIncident } from "@/lib/data/repositories/notification-logs";
import { listNotificationRecipientsByOrganization } from "@/lib/data/repositories/notification-recipients";
import { listUsersByOrganization } from "@/lib/data/repositories/users";
import { formatDateTime } from "@/lib/utils/format";
import {
  getElapsedTimeLabel,
  getTimeToAcknowledgement,
  getTimeToInProgress,
  getTimeToResolution,
  getSlaBadgeStyles
} from "@/lib/utils/sla";
import { IncidentActionPanel } from "@/components/admin/incident-action-panel";
import { createIssueTypeLabelMap, formatIncidentRatingSubtitle, formatIncidentTitle } from "@/lib/admin/presenters";
import { listIssueTypes } from "@/lib/data/repositories/issue-types";

export const metadata = {
  title: "פרטי דיווח | CleanPulse",
};

interface IncidentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function IncidentDetailPage({ params }: IncidentDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;

  // 1. Fetch incident by ID (checks organization ownership internally and throws if cross-org)
  let incident;
  try {
    incident = await getIncidentById(user.organizationId, id);
  } catch {
    return notFound();
  }

  if (!incident) {
    return notFound();
  }

  // 2. Fetch all related details in parallel
  const [
    branch,
    restroom,
    screen,
    issueTypes,
    activityLogs,
    notificationLogs,
    recipients,
    users
  ] = await Promise.all([
    getBranchById(user.organizationId, incident.branchId),
    getRestroomById(user.organizationId, incident.restroomId),
    getScreenById(user.organizationId, incident.screenId),
    listIssueTypes(),
    listActivityLogsForIncident(user.organizationId, incident.id),
    listNotificationLogsByIncident(user.organizationId, incident.id),
    listNotificationRecipientsByOrganization(user.organizationId),
    listUsersByOrganization(user.organizationId),
  ]);

  const issueTypeLabels = createIssueTypeLabelMap(issueTypes);
  const title = formatIncidentTitle(incident, issueTypeLabels);
  
  // Helpers for mapping names
  const userMap = new Map(users.map(u => [u.id, u.fullName] as const));
  const recipientMap = new Map(recipients.map(r => [r.id, `${r.name} (${r.email})`] as const));

  // Treatment time calculations
  const slaBadge = getSlaBadgeStyles(incident);
  const timeToAck = getTimeToAcknowledgement(incident);
  const timeToProgress = getTimeToInProgress(incident);
  const timeToResolve = getTimeToResolution(incident);

  // Timeline Action translator
  const translateAction = (action: string) => {
    switch (action) {
      case "incident_created":
        return "הדיווח נוצר במערכת";
      case "status_acknowledged":
        return "אישור קבלת דיווח";
      case "status_in_progress":
        return "התחלת טיפול בדיווח";
      case "status_resolved":
        return "פתרון וסגירת דיווח";
      case "status_dismissed":
        return "דחיית דיווח";
      case "restroom_reset":
        return "איפוס מצב השירותים";
      default:
        return action;
    }
  };

  const isResolver = canResolveIncident(user);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/incidents"
          className="inline-flex items-center gap-2 text-sm text-brand hover:underline font-bold mb-4"
        >
          <ArrowRight className="size-4" />
          חזרה לכל הדיווחים
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted">מה דווח על ידי הלקוחות</p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
              <StatusBadge status={incident.status} />
              <Badge variant="outline" className="font-bold">
                {incident.priority === "critical" ? "קריטי" : incident.priority === "high" ? "גבוה" : incident.priority === "medium" ? "בינוני" : "נמוך"}
              </Badge>
              <Badge className={`${slaBadge.bg} ${slaBadge.text} font-bold border`}>
                {slaBadge.label}
              </Badge>
            </div>
            <p className="text-base font-semibold text-brand-deep">
              {formatIncidentRatingSubtitle(incident)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Detail Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Location & Details Card */}
          <Card>
            <CardHeader className="border-b border-border bg-white/40">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="size-5 text-brand" />
                פרטי דיווח ומיקום
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 text-sm">
              <div className="grid grid-cols-3 py-3">
                <span className="font-bold text-muted">מה דווח</span>
                <span className="col-span-2 text-foreground font-semibold">{title}</span>
              </div>
              <div className="grid grid-cols-3 py-3">
                <span className="font-bold text-muted">ציון כללי</span>
                <span className="col-span-2 text-foreground font-semibold">{formatIncidentRatingSubtitle(incident)}</span>
              </div>
              <div className="grid grid-cols-3 py-3">
                <span className="font-bold text-muted">סניף</span>
                <span className="col-span-2 text-foreground font-semibold">{branch?.name ?? "לא ידוע"}</span>
              </div>
              <div className="grid grid-cols-3 py-3">
                <span className="font-bold text-muted">אזור שירותים</span>
                <span className="col-span-2 text-foreground font-semibold">{restroom?.name ?? "לא ידוע"} (קומה {restroom?.floor ?? "לא ידוע"})</span>
              </div>
              <div className="grid grid-cols-3 py-3">
                <span className="font-bold text-muted">מסך דיווח</span>
                <span className="col-span-2 text-foreground font-semibold">{screen?.name ?? "לא ידוע"}</span>
              </div>
              <div className="grid grid-cols-3 py-3">
                <span className="font-bold text-muted">מקור הדיווח</span>
                <span className="col-span-2 text-foreground font-semibold">
                  {incident.source === "kiosk" ? "טאבלט ציבורי" : "סריקת QR בנייד"}
                </span>
              </div>
              {incident.customerNote && (
                <div className="grid grid-cols-3 py-3 bg-brand-soft/20 px-2 rounded-lg my-1">
                  <span className="font-bold text-muted">הערת לקוח</span>
                  <span className="col-span-2 text-foreground bg-white p-2 rounded border border-border text-xs leading-6">
                    {incident.customerNote}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timestamps card */}
          <Card>
            <CardHeader className="border-b border-border bg-white/40">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="size-5 text-brand" />
                זמני טיפול
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 text-sm">
              <div className="grid grid-cols-3 py-3">
                  <span className="font-bold text-muted">נפתח</span>
                <span className="col-span-2 font-semibold">
                  {formatDateTime(incident.openedAt)}
                  <span className="text-xs text-muted mr-2">(זמן שעבר: {getElapsedTimeLabel(incident.openedAt)})</span>
                </span>
              </div>
              
              <div className="grid grid-cols-3 py-3">
                  <span className="font-bold text-muted">קבלה</span>
                <span className="col-span-2">
                  {incident.acknowledgedAt ? (
                    <span className="font-semibold text-foreground">
                      {formatDateTime(incident.acknowledgedAt)}
                      <span className="text-xs text-brand-deep bg-brand-soft border border-border px-2 py-0.5 rounded-full mr-2">
                        זמן לתגובה: {timeToAck}
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted">טרם אושר</span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-3 py-3">
                  <span className="font-bold text-muted">תחילת טיפול</span>
                <span className="col-span-2">
                  {incident.inProgressAt ? (
                    <span className="font-semibold text-foreground">
                      {formatDateTime(incident.inProgressAt)}
                      <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full mr-2">
                        זמן להתחלה: {timeToProgress}
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted">טרם התחיל בטיפול</span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-3 py-3">
                  <span className="font-bold text-muted">סגירה</span>
                <span className="col-span-2">
                  {incident.resolvedAt || incident.dismissedAt ? (
                    <span className="font-semibold text-foreground">
                      {formatDateTime(incident.resolvedAt || incident.dismissedAt!)}
                      <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mr-2">
                        זמן לסגירה: {timeToResolve}
                      </span>
                      {incident.resolvedByUserId && (
                        <span className="text-xs text-muted block mt-1">
                          טופל על ידי: {userMap.get(incident.resolvedByUserId) ?? incident.resolvedByUserId}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted">אירוע פתוח</span>
                  )}
                </span>
              </div>

              {incident.resolutionNote && (
                <div className="grid grid-cols-3 py-3 bg-emerald-50/20 px-2 rounded-lg my-1">
                  <span className="font-bold text-emerald-800">הערת סגירה</span>
                  <span className="col-span-2 text-foreground font-semibold">
                    {incident.resolutionNote}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Logs Timeline */}
          <Card>
            <CardHeader className="border-b border-border bg-white/40">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="size-5 text-brand" />
                ציר זמן
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {activityLogs.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">לא נמצאו פעולות מתועדות עבור דיווח זה.</p>
              ) : (
                <div className="relative border-r-2 border-border/80 mr-4 pr-6 space-y-6">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -right-[31px] top-1.5 flex size-4 items-center justify-center rounded-full border border-brand bg-white" />
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-bold text-foreground">{translateAction(log.action)}</span>
                          <span className="text-xs text-muted font-mono">{formatDateTime(log.createdAt)}</span>
                        </div>
                        <p className="text-xs text-muted flex items-center gap-1">
                          <User className="size-3" />
                          מבצע: {log.actorUserId ? (userMap.get(log.actorUserId) ?? log.actorUserId) : "מדווח ציבורי"}
                        </p>
                        {log.metadata?.resolutionNote ? (
                          <div className="text-xs bg-surface-muted p-2 rounded border text-muted">
                            <p>הערה: <strong className="text-foreground">{String(log.metadata.resolutionNote)}</strong></p>
                          </div>
                        ) : null}
                        {log.action === "restroom_reset" && typeof log.metadata?.closedCount === "number" ? (
                          <div className="text-xs bg-emerald-50 p-2 rounded border border-emerald-100 text-emerald-800">
                            נסגרו {Number(log.metadata.closedCount)} פניות פתוחות באזור השירותים.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Logs */}
          <Card>
            <CardHeader className="border-b border-border bg-white/40">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="size-5 text-brand" />
                התראות
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {notificationLogs.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">לא נוצרו התראות עבור דיווח זה.</p>
              ) : (
                <div className="space-y-3">
                  {notificationLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border border-border p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-foreground">
                          {log.recipientId ? (recipientMap.get(log.recipientId) ?? "נמען מוגדר") : "התראה כללית"}
                        </p>
                        <p className="text-xs text-muted">
                          {log.channel === "email" ? "מייל" : "התראה"} · {formatDateTime(log.createdAt)}
                        </p>
                        {log.errorMessage && (
                          <p className="text-xs text-red-600 bg-red-50 p-2 border border-red-100 rounded mt-1">
                            שגיאה: {log.errorMessage}
                          </p>
                        )}
                      </div>
                      
                      <Badge className={
                        log.status === "mock_sent" ? "bg-sky-50 text-sky-700 border border-sky-200" :
                        log.status === "sent" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        log.status === "failed" ? "bg-red-50 text-red-700 border border-red-200" :
                        log.status === "no_recipients" ? "bg-slate-100 text-slate-700 border" :
                        "bg-amber-50 text-amber-700 border"
                      }>
                        {log.status === "mock_sent" ? "נשלחה" :
                         log.status === "sent" ? "נשלחה" :
                         log.status === "failed" ? "נכשלה" :
                         log.status === "no_recipients" ? "ללא נמענים" :
                         log.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Panel Column */}
        <div className="space-y-6">
          <Card className="bg-brand-soft/30 border-brand-water/30">
            <CardHeader>
              <CardTitle className="text-lg">פעולות טיפול</CardTitle>
              <CardDescription>עדכון מצב הדיווח בשטח.</CardDescription>
            </CardHeader>
            <CardContent>
              {isResolver ? (
                <IncidentActionPanel incidentId={incident.id} currentStatus={incident.status} />
              ) : (
                <div className="flex gap-2 text-xs text-muted bg-yellow-50 border border-yellow-200 p-3 rounded-lg leading-6">
                  <Shield className="size-4 text-amber-600 shrink-0 mt-1" />
                  <span>אין הרשאה לשינוי סטטוס בדיווח הזה.</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
            <CardTitle className="text-lg">שלבי טיפול</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted leading-6 space-y-2">
              <p><strong className="text-foreground">פתוח</strong> — דיווח חדש מהלקוח שממתין להתייחסות.</p>
              <p><strong className="text-foreground">התקבל</strong> — חבר צוות אישר שראה את התקלה ומתכוון לטפל.</p>
              <p><strong className="text-foreground">בטיפול</strong> — העבודה בעיצומה.</p>
              <p><strong className="text-foreground">טופל</strong> — התקלה תוקנה והדיווח נסגר בהצלחה.</p>
              <p><strong className="text-foreground">נדחה</strong> — דיווח כפול, שגוי, או שאינו דורש התערבות.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
