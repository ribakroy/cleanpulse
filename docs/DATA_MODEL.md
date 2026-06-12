# CleanPulse MVP Data Model

## 1. עקרונות

- כל `incident` חייב להיות משויך ל:
  - `organizationId`
  - `branchId`
  - `restroomId`
  - `screenId`
- כל היישויות הן multi-tenant לפי `organizationId`.
- היסטוריה נשמרת גם אם שמות ישויות משתנים בעתיד.
- records תפעוליים שומרים snapshots של שמות מפתח כשצריך, כדי שדוחות היסטוריים לא יישברו.

## 2. Enums

### Incident status

- `open`
- `acknowledged`
- `in_progress`
- `resolved`
- `dismissed`

### Roles

- `super_admin` (ניהול על פנימי)
- `owner`
- `admin`
- `area_manager`
- `operations_worker`
- `manager`
- `cleaner`

### Incident kind

- `issue`
- `rating`

### Notification log status

- `pending`
- `sent`
- `failed`

## 3. Entities

### `organizations`

מטרת הישות:
Tenant עליון (כולל הגדרות מנוי וגבייה ידנית עבור SaaS).

שדות עיקריים:

- `id`
- `name`
- `slug`
- `isActive`
- `defaultLocale` = `he-IL`
- `timezone`
- `plan` = `demo` | `basic` | `pro` | `enterprise` | `free` | `starter`
- `status` = `active` | `trial` | `suspended` | `cancelled` (אופציונלי)
- `billingStatus` = `active` | `trialing` | `past_due" | "cancelled" | "manual` (אופציונלי)
- `billingEmail` (אופציונלי)
- `companyName` (אופציונלי)
- `contactName` (אופציונלי)
- `contactPhone` (אופציונלי)
- `trialEndsAt` (אופציונלי, ISO format)
- `notes` (אופציונלי, הערות מנהל על)
- `allowedScreensLimit` (אופציונלי, ברירת מחדל 5)
- `monthlyPrice` (אופציונלי)
- `currency` (אופציונלי, ברירת מחדל ILS)
- `createdAt`
- `updatedAt`

### `users`

מטרת הישות:
משתמש ניהולי מזוהה.

שדות עיקריים:

- `id`
- `organizationId`
- `email`
- `emailNormalized`
- `passwordHash`
- `fullName`
- `role`
- `isActive` אופציונלי. חסר = פעיל לצורך תאימות לאחור.
- `allowedBranchIds` אופציונלי
- `allowedRestroomIds` אופציונלי
- `assignedRestroomIds` אופציונלי
- `phone` אופציונלי
- `jobTitle` אופציונלי
- `employeeCode` אופציונלי
- `defaultShiftId` אופציונלי
- `lastSeenAt` אופציונלי
- `lastLoginAt` אופציונלי
- `createdAt`
- `updatedAt`

תאימות:

- `manager` נשאר alias למנהל אזור.
- `cleaner` נשאר alias לעובד תפעולי.
- משתמשים קיימים בלי scopes נטענים ללא migration חובה.

### `shifts`

מטרת הישות:
הגדרת משמרות בסיסית לדוחות תפוקת צוות.

שדות עיקריים:

- `id`
- `organizationId`
- `branchId` אופציונלי
- `restroomIds` אופציונלי
- `assignedUserIds` אופציונלי
- `name`
- `startsAt` בפורמט `HH:mm`
- `endsAt` בפורמט `HH:mm`
- `daysOfWeek` אופציונלי
- `isActive`
- `createdAt`
- `updatedAt`

### `branches`

מטרת הישות:
סניף פיזי.

שדות עיקריים:

- `id`
- `organizationId`
- `name`
- `code`
- `address`
- `isActive`
- `createdAt`
- `updatedAt`

### `restrooms`

מטרת הישות:
אזור או תא שירותים מנוהל.

שדות עיקריים:

- `id`
- `organizationId`
- `branchId`
- `name`
- `floor`
- `zoneLabel`
- `genderType`
- `isActive`
- `createdAt`
- `updatedAt`

### `screens`

מטרת הישות:
מסך ציבורי אחד שמחובר לשירותים מסוימים.

שדות עיקריים:

- `id`
- `organizationId`
- `branchId`
- `restroomId`
- `name`
- `placement`
- `deviceMode` = `kiosk`
- `publicToken`
- `publicTokenHash`
- `publicUrl`
- `backupUrl`
- `isActive`
- `lastSeenAt` אופציונלי
- `createdAt`
- `updatedAt`

### `issue_types`

מטרת הישות:
רשימת סוגי דיווחים שהמסך מציג.

שדות עיקריים:

- `id`
- `organizationId`
- `key`
- `labelHe`
- `kind`
- `sortOrder`
- `isActive`
- `triggersEmail`
- `createdAt`
- `updatedAt`

ערכי seed מומלצים:

- `missing_paper`
- `missing_soap`
- `missing_hand_soap`
- `not_clean`
- `bad_smell`
- `trash_full`
- `toilet_fault`
- `sink_fault`
- `general_feedback_rating`

### `incidents`

מטרת הישות:
דיווח תפעולי או דירוג.

שדות עיקריים:

- `id`
- `organizationId`
- `branchId`
- `restroomId`
- `screenId`
- `issueTypeId`
- `issueTypeKey`
- `incidentKind`
- `status`
- `reportedAt`
- `acknowledgedAt`
- `acknowledgedByUserId`
- `inProgressAt`
- `inProgressByUserId`
- `resolvedAt`
- `resolvedByUserId`
- `dismissedAt`
- `dismissedByUserId`
- `closedAt`
- `assignedToUserId`
- `ratingValue` nullable
- `reportSource` = `kiosk` | `backup_qr`
- `publicTokenHashSnapshot`
- `branchNameSnapshot`
- `restroomNameSnapshot`
- `screenNameSnapshot`
- `issueLabelSnapshot`
- `notes` nullable
- `timeToAcknowledgeSeconds` nullable
- `timeToCloseSeconds` nullable
- `createdAt`
- `updatedAt`
- `version`

### `notification_recipients`

מטרת הישות:
הגדרת מי אמור לקבל התראות.

שדות עיקריים:

- `id`
- `organizationId`
- `branchId` nullable
- `restroomId` nullable
- `screenId` nullable
- `email`
- `fullName`
- `isActive`
- `priority`
- `createdAt`
- `updatedAt`

כל record מייצג recipient אחד ברמת scope אחת.

### `notification_logs`

מטרת הישות:
תיעוד ניסיון שליחת התראה.

שדות עיקריים:

- `id`
- `organizationId`
- `incidentId`
- `channel` = `email`
- `status`
- `scopeUsed` = `screen` | `restroom` | `branch` | `organization` | `none`
- `recipientIds`
- `recipientEmails`
- `provider` = `resend` | `mock`
- `providerMessageId` nullable
- `failureReason` nullable
- `attemptedAt`
- `sentAt` nullable
- `createdAt`
- `updatedAt`

### `activity_logs`

מטרת הישות:
Audit trail מוצרי.

שדות עיקריים:

- `id`
- `organizationId`
- `incidentId` nullable
- `actorUserId` nullable
- `actorFullName` אופציונלי
- `actorRole` אופציונלי
- `action`
- `actionType` אופציונלי
- `targetType` אופציונלי
- `targetId` אופציונלי
- `restroomId` אופציונלי
- `branchId` אופציונלי
- `shiftId` אופציונלי
- `metadata`
- `createdAt`

Fallback:

- log ישן בלי `actorFullName` מוצג כ־`משתמש מערכת`, `מדווח ציבורי`, או `לא זמין` לפי ההקשר.

## 4. יחסים

- organization אחד מכיל הרבה users.
- organization אחד מכיל הרבה branches.
- organization אחד מכיל הרבה shifts.
- branch אחד מכיל הרבה restrooms.
- branch אחד יכול להכיל הרבה shifts.
- restroom אחד מכיל הרבה screens.
- screen אחד יכול ליצור הרבה incidents.
- incident אחד יכול ליצור הרבה activity logs.
- incident אחד יכול ליצור אפס או יותר notification logs.
- user אחד יכול להיות משויך ל־`defaultShiftId` אחד.

## 5. Recipient resolution hierarchy

בעת יצירת incident:

1. אם יש recipients למסך, משתמשים בהם.
2. אחרת, אם יש recipients לשירותים, משתמשים בהם.
3. אחרת, אם יש recipients לסניף, משתמשים בהם.
4. אחרת, משתמשים ב־organization defaults.
5. אם אין אף אחד, יוצרים `notification_log` עם `failed/no_recipients`.

## 6. Permissions model

### `owner`

- CRUD מלא לכל הישויות בארגון.
- גישה לכל הדוחות.
- ניהול users ו־notification recipients.

### `admin`

- CRUD כמעט מלא לכל הישויות התפעוליות.
- גישה מלאה לאירועים ודוחות.

### `manager`

- צפייה וטיפול רק בסקופ מוקצה.
- יכול לשנות סטטוס, לשייך טיפול, להוסיף הערות.
- לא יכול לנהל organization-wide users בלי הרשאה נוספת.

### `area_manager`

- זהה ל־`manager`, עם שם role חדש וברור יותר.

### `operations_worker`

- זהה ל־`cleaner`, עם שם role חדש וברור יותר.

### `cleaner`

- רואה רק incidents בטווח שהוקצה לו.
- יכול לעדכן `acknowledged`, `in_progress`, `resolved`.
- לא מנהל users, branches, screens או recipients.

## 7. דוגמת Incident JSON

```json
{
  "id": "inc_01JZ8C7R6M8T3D9M6Q2Z1H4Y8A",
  "organizationId": "org_01JZ8B3C3F0F5K2X4N9V1R8D7Q",
  "branchId": "br_01JZ8B91V0D2W2T4P7Q3A6N5M1",
  "restroomId": "rr_01JZ8BA7E9S1N3L6P4V8K2R5T0",
  "screenId": "sc_01JZ8BBQH5D6R2F4M7N9P1T3K8",
  "issueTypeId": "it_01JZ8BCW9Q6X1M2R5D7P3N4T8",
  "issueTypeKey": "missing_paper",
  "incidentKind": "issue",
  "status": "open",
  "reportedAt": "2026-06-09T15:20:11.000Z",
  "assignedToUserId": null,
  "ratingValue": null,
  "reportSource": "kiosk",
  "publicTokenHashSnapshot": "4f8c1d...",
  "branchNameSnapshot": "קניון איילון",
  "restroomNameSnapshot": "שירותי נשים קומה 1",
  "screenNameSnapshot": "מסך יציאה ראשי",
  "issueLabelSnapshot": "חסר נייר",
  "notes": null,
  "timeToAcknowledgeSeconds": null,
  "timeToCloseSeconds": null,
  "createdAt": "2026-06-09T15:20:11.000Z",
  "updatedAt": "2026-06-09T15:20:11.000Z",
  "version": 1
}
```

## 8. דוגמת Notification Recipient JSON

```json
{
  "id": "nr_01JZ8CMMQ7V2X6N3T9R4P1D5K8",
  "organizationId": "org_01JZ8B3C3F0F5K2X4N9V1R8D7Q",
  "branchId": "br_01JZ8B91V0D2W2T4P7Q3A6N5M1",
  "restroomId": null,
  "screenId": null,
  "email": "manager@example.com",
  "fullName": "מנהל סניף",
  "isActive": true,
  "priority": 100,
  "createdAt": "2026-06-09T15:10:00.000Z",
  "updatedAt": "2026-06-09T15:10:00.000Z"
}
```

## 9. הערות מודל חשובות

- `issueLabelSnapshot` מגן על היסטוריה אם label משתנה.
- `branchNameSnapshot`, `restroomNameSnapshot`, `screenNameSnapshot` מייצבים דוחות.
- `version` נועד ל־optimistic updates ברמת האפליקציה.
- `publicTokenHashSnapshot` מספק עקיבות גם אם הטוקן הוחלף בהמשך.

## 10. Magic Login and Email Settings

### `magic_login_tokens`

- `organizationId`
- `userId`
- `tokenHash` בלבד. raw token לא נשמר.
- `targetPath`
- `purpose`
- `expiresAt`
- `usedAt`
- `revokedAt`
- `createdAt`
- `updatedAt`
- `createdByUserId`
- `metadata`

הטוקן קצר חיים, חד־פעמי, קשור למשתמש ולארגון, ולא עוקף role/scope.

### `system_settings`

רשומה ראשית: `email_domain_settings`.

- `appUrl`
- `emailProvider`
- `emailMode`
- `fromName`
- `fromEmail`
- `replyToEmail`
- `allowedTestRecipients`
- `domainStatus`
- `resendDomain`
- `updatedAt`
- `updatedByUserId`

המסך `/super/email-settings` מנהל את ההגדרות בלי secrets ובלי הפעלת מיילים חיים.
