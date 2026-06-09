# CleanPulse MVP Architecture

## 1. עקרונות ארכיטקטורה

- אפליקציית Web אחת מבוססת Next.js App Router.
- PWA עבור מסך הטאבלט הציבורי.
- אתר רספונסיבי עבור לוח הניהול.
- Data layer מופשט דרך `DataAdapter`.
- פרודקשן נשען על `GitHubDataAdapter`.
- פיתוח מקומי נשען על `LocalFileDataAdapter`.
- כל קריאה או כתיבה לדאטה נעשית server-side בלבד.
- Repo הדאטה מופרד מ־Repo הקוד כדי לא לערבב deployment עם runtime data.

## 2. שני ה־Repos

### `cleanpulse-mvp`

- מכיל קוד Next.js, UI, auth, adapters, email providers.
- מחובר ל־Vercel.
- כל push ל־`main` יכול לפרוס.

### `cleanpulse-data`

- Repo פרטי.
- משמש כמאגר JSON ראשוני.
- לא מחובר ל־Vercel.
- כל כתיבה אליו נעשית רק דרך GitHub API מהשרת.
- לא שומרים בו קוד אפליקציה.

## 3. רכיבי מערכת

### Frontend

- מסכי Public לדיווח מהיר.
- מסכי Admin לניהול ותפעול.
- RTL מלא.
- Tailwind CSS.
- `shadcn/ui` בשימוש סלקטיבי למסכי admin, tables, dialogs ו־forms.

### Backend בתוך Next.js

- Route Handlers עבור public reporting, auth ו־API admin.
- Server Actions למסכי admin שבהם זה מפשט mutation flows.
- Service layer שמבצע:
  - אימות הרשאות
  - ולידציה
  - כתיבת נתונים
  - יצירת activity logs
  - שליחת התראות

### Data Layer

- `DataAdapter` interface.
- `GitHubDataAdapter` לפרודקשן.
- `LocalFileDataAdapter` לפיתוח בלבד.

### Notifications

- `EmailProvider` interface.
- `ResendEmailProvider` לפרודקשן.
- `MockEmailProvider` לפיתוח.

### Auth

- התחברות credentials רגילה.
- סיסמאות נשמרות כ־bcrypt hash.
- לאחר login נכתב JWT ל־HTTP-only cookie.

## 4. Route Map

### Public routes

- `/k/[publicToken]`
  מסך טאבלט full-screen.

- `/b/[publicToken]`
  מסך גיבוי ציבורי ל־QR.

### Auth routes

- `/login`
- `/logout`

### Admin routes

- `/admin`
- `/admin/dashboard`
- `/admin/incidents`
- `/admin/branches`
- `/admin/screens`
- `/admin/recipients`
- `/admin/reports`
- `/admin/settings`

### API routes

- `/api/public/screens/[publicToken]/report`
- `/api/incidents/[incidentId]/status`
- `/api/incidents/[incidentId]/assign`
- `/api/reports/summary`

הערה:
ב־MVP הנוכחי ה־login מתבצע דרך server action על `/login`, וה־logout דרך route handler על `/logout`.

## 5. מבנה שכבות

1. `app/`
   App Router pages, layouts, route handlers.
2. `components/`
   רכיבי UI ציבוריים וניהוליים.
3. `lib/auth/`
   JWT, bcrypt, guards, session parsing.
4. `lib/data/`
   `DataAdapter`, `GitHubDataAdapter`, `LocalFileDataAdapter`.
5. `lib/email/`
   `EmailProvider`, providers, template builders.
6. `lib/domain/`
   services ל־incidents, reports, notifications, users.
7. `lib/validation/`
   schemas לבקשות public ו־admin.

## 6. Auth ו־Authorization

### Authentication

- המשתמש מזין אימייל + סיסמה.
- המערכת מאתרת user דרך email index.
- הסיסמה נבדקת מול `bcrypt.compare`.
- נוצר JWT עם:
  - `userId`
  - `organizationId`
  - `role`
  - `allowedBranchIds`
  - `allowedRestroomIds` אם צריך

### Authorization

- `owner`: שליטה מלאה על הארגון.
- `admin`: כמעט כמו owner, ללא פעולות בעלות אם יוגדרו בהמשך.
- `manager`: גישה רק לסניפים או אזורים שהוקצו לו.
- `cleaner`: גישה לאירועים הרלוונטיים לצורך טיפול בלבד.

כל קריאה admin תיבדק גם לפי role וגם לפי scope של `organizationId`, `branchId`, `restroomId`.

## 7. Incident Event Lifecycle

1. בקשת public מגיעה עם `publicToken`.
2. המערכת מאמתת את הטוקן מול screen פעיל.
3. נוצר `incident` בסטטוס `open`.
4. נוצר `activity_log` של יצירה.
5. אם מדובר בדירוג כוכבים, נשמר גם `ratingValue`.
6. המערכת פותרת נמענים לפי מדרג היררכי.
7. נוצר `notification_log`.
8. נעשה ניסיון שליחת מייל.
9. אם המייל נשלח, ה־log מתעדכן ל־`sent`.
10. אם השליחה נכשלה, ה־log מתעדכן ל־`failed`, אבל האירוע נשאר קיים.
11. משתמשי admin משנים סטטוס לאורך זמן:
    - `open`
    - `acknowledged`
    - `in_progress`
    - `resolved`
    - `dismissed`
12. כל שינוי סטטוס שומר גם את המשתמש המבצע בשדות האירוע וב־`activity_log`.

## 8. Reporting Lifecycle

- הדוחות היומיים/שבועיים/חודשיים מבוססים על `incidents`.
- ברמת MVP החישוב יתבצע על בסיס סריקת JSON records לפי טווח זמן וארגון.
- אם הביצועים ייחלשו, נוסיף snapshots/cache נגזרים, אך הם לא יהיו מקור האמת.

## 9. Security Assumptions

- `cleanpulse-data` הוא private repo.
- ל־Vercel יש token עם הרשאות מינימליות ל־repo הדאטה בלבד.
- אין גישה client-side ל־GitHub API עם הרשאות כתיבה.
- כל `publicToken` ארוך, אקראי ולא מנחש.
- JWT נשמר ב־HTTP-only secure cookie.
- סיסמאות לעולם אינן נשמרות ב־plaintext.
- גישה לנתונים תמיד מסוננת לפי organization ו־role.
- אין להסתמך על private repo כאבטחה מספיקה; יש לבצע ולידציה והרשאות בכל קריאה.

## 10. החלטות MVP חשובות

- לא משתמשים ב־Supabase.
- לא משתמשים ב־Postgres.
- לא משתמשים ב־WhatsApp.
- לא שומרים runtime data ב־filesystem של Vercel.
- לא שומרים live data בתוך `cleanpulse-mvp`.
- כתיבת data לא יוצרת deployment, כי repo הדאטה נפרד ולא מחובר ל־Vercel.

## 11. מגבלות ארכיטקטוניות ידועות

- GitHub API אינו בסיס נתונים אמיתי.
- אין transactional writes.
- אין query engine אמיתי.
- concurrency מוגבל.
- reporting כבד עלול להפוך יקר בקריאות.
- audit trail קיים, אבל לא ברמת DB-native guarantees.

לכן הארכיטקטורה מכוונת ל־MVP קטן עם adapter boundary ברור, כדי לאפשר מעבר עתידי ל־Postgres בלי לשכתב את שכבת המוצר.
