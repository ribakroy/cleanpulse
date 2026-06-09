# CleanPulse Roadmap

## Phase 0: Planning and foundation

מטרת השלב:
לסגור תכנון מוצרי וטכני לפני כתיבת קוד.

Deliverables:

- PRD
- Architecture
- GitHub Data Architecture
- Data Model
- Email Alerts Design
- Acceptance Criteria
- Migration Plan

Exit criteria:

- יש הסכמה על scope ה־MVP.
- יש הסכמה על מבנה ה־repos.
- יש הסכמה על מודל הדאטה וה־routes.

## Phase 1: Core MVP build

מטרת השלב:
להקים מוצר עובד מקצה לקצה.

Deliverables:

- שלד Next.js App Router
- RTL design system בסיסי
- public kiosk screen
- public backup QR screen
- credentials auth
- GitHubDataAdapter
- LocalFileDataAdapter
- ResendEmailProvider
- MockEmailProvider
- incident flow מלא
- admin dashboard בסיסי
- incident list + incident details
- status updates

Exit criteria:

- ניתן לדווח אירוע ציבורי.
- האירוע נשמר ב־cleanpulse-data.
- נשלח מייל כשיש recipients.
- ניתן לטפל ולסגור אירוע.

## Phase 2: Admin operations and reporting

מטרת השלב:
להפוך את המוצר שמיש תפעולית ללקוח ראשון.

Deliverables:

- ניהול branches
- ניהול restrooms
- ניהול screens
- ניהול users
- ניהול notification recipients
- dashboard משופר
- דוחות יומי / שבועי / חודשי
- open incidents view

Exit criteria:

- אפשר להקים ארגון שלם דרך ה־admin.
- יש דוחות שמישים למנהל.
- role permissions עובדות.

## Phase 3: Hardening

מטרת השלב:
להקטין סיכוני MVP לפני לקוחות מרובים.

Deliverables:

- optimistic concurrency handling טוב יותר
- rebuilding indexes
- better monitoring/logging
- manual resend alert action
- public rate limiting
- better duplicate submission handling

Exit criteria:

- תקלות נפוצות מטופלות בלי לפגוע בזרימת הדיווח.
- יש תצפית טובה על failures.

## Phase 4: Post-MVP expansion

Deliverables:

- SLA/escalation
- notification retries
- push/SMS/WhatsApp
- mobile technician workflows
- richer analytics
- multi-language support

## Phase 5: Database migration

מטרת השלב:
לעבור ל־Postgres/Neon/Supabase כשהמוצר מוכיח traction.

Trigger examples:

- כמות אירועים גבוהה מדי ל־GitHub API
- דוחות איטיים
- conflicts בתדירות משמעותית
- צורך ב־querying מתקדם

Exit criteria:

- DataAdapter מוחלף ל־SQL adapter
- אין שינוי מהותי ב־UI flows
- היסטוריית אירועים נשמרת
