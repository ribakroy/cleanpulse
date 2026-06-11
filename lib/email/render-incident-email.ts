import type { IncidentRecord } from "@/lib/data/types";
import { formatDateTime } from "@/lib/utils/format";

type RenderOptions = {
  incident: IncidentRecord;
  branchName: string;
  restroomName: string;
  screenName: string;
  issueLabel: string;
  adminUrl: string;
};

function escapeHtml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderIncidentEmail({
  incident,
  branchName,
  restroomName,
  screenName,
  issueLabel,
  adminUrl,
}: RenderOptions) {
  const safeBranchName = escapeHtml(branchName);
  const safeRestroomName = escapeHtml(restroomName);
  const safeScreenName = escapeHtml(screenName);
  const safeIssueLabel = escapeHtml(issueLabel);
  const safeCustomerNote = escapeHtml(incident.customerNote || "");
  const isRating = incident.rating !== null;
  const openedAtFormatted = formatDateTime(incident.openedAt);
  const sourceLabel = incident.source === "kiosk" ? "מסך טאבלט (Kiosk)" : "סריקת QR בנייד";

  // 1. Build Subject
  const subject = isRating
    ? `דירוג שירותים חדש — ${incident.rating}/5 | ${branchName}`
    : `דיווח שירותים חדש — ${issueLabel} | ${branchName}`;

  const typeLabel = isRating ? "חוות דעת / דירוג" : "דיווח תקלה";
  const detailLabel = isRating ? "דירוג שהתקבל:" : "סוג התקלה:";
  const detailValue = isRating ? `${incident.rating} מתוך 5 כוכבים` : safeIssueLabel;

  // 2. Build HTML Body (RTL, Premium Water Blue theme)
  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(subject)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #F4FAFF;
      color: #0F2742;
      direction: rtl;
      text-align: right;
      margin: 0;
      padding: 20px;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      background-color: #F4FAFF;
      width: 100%;
      padding: 20px 0;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #D8ECFA;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 10px 30px rgba(15, 39, 66, 0.05);
    }
    .header {
      border-bottom: 2px solid #EAF5FD;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .logo {
      font-size: 20px;
      font-weight: bold;
      color: #1E88E5;
      letter-spacing: 0.5px;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      color: #0F2742;
      margin: 12px 0 0 0;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    .detail-row {
      border-bottom: 1px solid #F0F7FD;
    }
    .detail-label {
      padding: 10px 0;
      font-weight: 700;
      color: #64748B;
      font-size: 14px;
      width: 130px;
      vertical-align: top;
    }
    .detail-value {
      padding: 10px 0;
      color: #0F2742;
      font-size: 15px;
      vertical-align: top;
    }
    .highlight {
      font-weight: 800;
      color: #1E88E5;
    }
    .button-container {
      text-align: center;
      margin: 32px 0 20px 0;
    }
    .button {
      background-color: #1E88E5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 16px;
      display: inline-block;
      box-shadow: 0 4px 12px rgba(30, 136, 229, 0.2);
    }
    .fallback-text {
      font-size: 11px;
      color: #64748B;
      text-align: center;
      margin-top: 12px;
      word-break: break-all;
    }
    .fallback-link {
      color: #1E88E5;
      text-decoration: underline;
    }
    .footer {
      font-size: 12px;
      color: #64748B;
      border-top: 1px solid #EAF5FD;
      padding-top: 20px;
      margin-top: 32px;
      text-align: center;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">CleanPulse</div>
        <h1 class="title">התראת דיווח שירותים חדש</h1>
      </div>
      <table class="details-table">
        <tr class="detail-row">
          <td class="detail-label">סוג דיווח:</td>
          <td class="detail-value">${typeLabel}</td>
        </tr>
        <tr class="detail-row">
          <td class="detail-label">סניף:</td>
          <td class="detail-value">${safeBranchName}</td>
        </tr>
        <tr class="detail-row">
          <td class="detail-label">אזור שירותים:</td>
          <td class="detail-value">${safeRestroomName}</td>
        </tr>
        <tr class="detail-row">
          <td class="detail-label">מסך:</td>
          <td class="detail-value">${safeScreenName}</td>
        </tr>
        <tr class="detail-row">
          <td class="detail-label">${detailLabel}</td>
          <td class="detail-value highlight">${detailValue}</td>
        </tr>
        <tr class="detail-row">
          <td class="detail-label">זמן פתיחה:</td>
          <td class="detail-value">${openedAtFormatted}</td>
        </tr>
        <tr class="detail-row">
          <td class="detail-label">מקור דיווח:</td>
          <td class="detail-value">${sourceLabel}</td>
        </tr>
        ${safeCustomerNote ? `
        <tr class="detail-row">
          <td class="detail-label">הערת לקוח:</td>
          <td class="detail-value">${safeCustomerNote}</td>
        </tr>` : ''}
      </table>
      
      <div class="button-container">
        <a href="${adminUrl}" class="button" target="_blank">פתיחה וטיפול בדיווח</a>
      </div>
      
      <div class="fallback-text">
        אם הכפתור לא עובד, העתק/י את הקישור הבא לדפדפן:<br>
        <a href="${adminUrl}" class="fallback-link" target="_blank">${adminUrl}</a>
      </div>
      
      <div class="footer">
        הודעה זו נשלחה באופן אוטומטית ממערכת CleanPulse.<br>
        אנא אל תשיב/י למייל זה.
      </div>
    </div>
  </div>
</body>
</html>
`;

  // 3. Plain text version
  const text = `CleanPulse - דיווח שירותים חדש
----------------------------------------
סוג דיווח:  ${typeLabel}
סניף:        ${branchName}
אזור שירותים: ${restroomName}
מסך:        ${screenName}
${detailLabel}  ${detailValue}
זמן פתיחה:   ${openedAtFormatted}
מקור דיווח:  ${sourceLabel}

מעבר וטיפול בדיווח בממשק הניהול:
${adminUrl}

--
הודעה זו נשלחה אוטומטית ממערכת CleanPulse
`;

  return { subject, html, text };
}
