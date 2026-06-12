# Role Permissions

## Roles

- `super_admin`: ניהול על פנימי דרך `/super/*`.
- `owner`: ניהול מלא של ארגון עסקי.
- `admin`: ניהול מלא של ארגון עסקי.
- `area_manager`: מנהל אזור scoped.
- `operations_worker`: עובד תפעולי scoped.
- `manager`: alias קיים ל־`area_manager`.
- `cleaner`: alias קיים ל־`operations_worker`.

## Redirect אחרי Login

- `super_admin` -> `/super/dashboard`
- `owner` / `admin` -> `/admin/dashboard`
- `area_manager` / `manager` -> `/admin/dashboard`
- `operations_worker` / `cleaner` -> `/work`

## הרשאות מרכזיות

- `canManageUsers`: רק `owner` / `admin`.
- `canManageOrganizationSettings`: רק `owner` / `admin`.
- `canViewReports`: `owner` / `admin` / `area_manager` / `manager`.
- `canViewIncident`: לפי role ו־scope.
- `canUpdateIncident`: לפי role ו־scope.
- `canResetRestroom`: לפי role ו־scope.
- `filterIncidentsForUser`: מסנן פניות לפי scope.
- `filterBranchesForUser`: מסנן סניפים לפי scope.
- `filterRestroomsForUser`: מסנן אזורי שירותים לפי scope.
- `filterScreensForUser`: מסנן מסכים לפי scope.
- `defaultShiftId`: משמרת ברירת מחדל אופציונלית למשתמש. היא נרשמת בלוגים רק אם היא מתאימה בפועל לזמן, לסניף ולאזור הפעולה.
- `assignedUserIds` על משמרת: שיוך עובדים מפורש למשמרת.
- `restroomIds` על משמרת: צמצום המשמרת לאזורי שירותים ספציפיים.

## Scope Behavior

`owner` ו־`admin` רואים את כל הארגון.

`area_manager` / `manager`:

- עם scope: רואים רק סניפים/אזורים/פניות משויכים.
- בלי scope: fallback מלא לארגון כדי לא לשבור משתמשים קיימים.

`operations_worker` / `cleaner`:

- רואים רק אזורי עבודה משויכים.
- בלי scope: login תקין, אבל `/work` מציג שאין אזורים משויכים.

## אכיפה

האכיפה אינה רק UI:

- `app/actions/incidents.ts` בודק scope לפני עדכון פנייה או איפוס שירותים.
- `/admin/incidents`, `/admin/dashboard`, `/admin/reports`, `/admin/reports/team`, ו־CSV export מסוננים לפי scope.
- `/admin/users` חסום לכל מי שאינו `owner` או `admin`.
- `/admin/shifts` חסום לכל מי שאינו `owner` או `admin`.

## דוח צוות

`/admin/reports/team` תומך במסננים לפי תאריך, סניף, אזור שירותים, עובד, role, מנהל אזור/משמרת, משמרת ופעולה.

הדוח מציג:

- תחילת טיפולים.
- טיפולים שנסגרו.
- ניקויים מקיפים.
- זמן תגובה, זמן טיפול וזמן סגירה ממוצעים כשיש מספיק נתונים.
- פעילות לפי משמרת מתוך `activity_logs.shiftId`.
- פעולות ללא שיוך משמרת תחת "ללא שיוך משמרת".
- CSV export לדוח צוות שמכבד filters ו־scope.
