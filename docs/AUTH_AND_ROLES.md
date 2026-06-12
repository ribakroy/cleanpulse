# CleanPulse Auth And Roles

## Authentication

- ה־login מתבצע דרך `/login` עם server action.
- המשתמש נשלף מה־data layer לפי email בלבד, server-side.
- הסיסמה נבדקת מול `passwordHash` עם `bcrypt.compare`.
- אם המשתמש פעיל, נוצר JWT חתום ונכתב ל־cookie בשם `cleanpulse_session`.
- אחרי יצירת session מתבצע redirect לפי role:
  - `super_admin` -> `/super/dashboard`
  - `owner` / `admin` -> `/admin/dashboard`
  - `area_manager` / `manager` -> `/admin/dashboard`
  - `operations_worker` / `cleaner` -> `/work`
- אם ההתחברות נכשלת, הלקוח מקבל תמיד אותה שגיאה: `פרטי ההתחברות אינם תקינים.`

## JWT Cookie

- cookie מוגדר כ־`httpOnly`.
- `sameSite=lax`.
- `path=/`.
- `secure=true` רק בפרודקשן.
- תוקף ברירת מחדל: 7 ימים.
- אם `AUTH_SECRET` חסר בפרודקשן, המערכת זורקת שגיאה ברורה ולא מנסה לחתום session.

## Session Payload

ה־JWT כולל רק:

- `userId`
- `organizationId`
- `role`
- `email`
- `fullName`
- `iat`
- `exp`

אין שמירה של `passwordHash`, tokens חיצוניים או payload גדול.

## Guards

- `getCurrentSession()` קורא את ה־cookie ומוודא חתימה ותוקף.
- `getCurrentUser()` טוען מחדש את המשתמש מה־repository לפי ה־session.
- `requireUser()` מפנה ל־`/login` אם אין session תקין.
- `requireAdminUser()` מיועד ל־`owner` ו־`admin` בלבד.
- `clearSession()` מוחק את ה־cookie.

## Roles

- `owner`: כל ההרשאות.
- `admin`: כל ההרשאות.
- `area_manager`: דיווחים ודוחות לפי scope.
- `operations_worker`: אזור עבודה מצומצם ב־`/work`.
- `manager`: alias קיים ל־`area_manager`.
- `cleaner`: alias קיים ל־`operations_worker`.

## Permission Helpers

- `canManageSettings(user)`
- `canManageOrganizationSettings(user)`
- `canManageRecipients(user)`
- `canManageUsers(user)`
- `canViewReports(user)`
- `canResolveIncident(user)`
- `canViewIncidents(user)`
- `canViewIncident(user, incident)`
- `canUpdateIncident(user, incident)`
- `canResetRestroom(user, restroomId)`
- `filterIncidentsForUser(user, incidents)`
- `filterBranchesForUser(user, branches, restrooms)`
- `filterRestroomsForUser(user, restrooms)`
- `filterScreensForUser(user, screens)`
- `assertSameOrganization(user, organizationId)`
- `resolveShiftForAction(...)` משייך פעולה למשמרת רק אם העובד, הסניף, האזור והשעה מתאימים.

## Multi-Tenant Scope

- הלקוח לא שולח `organizationId` כנתון אמין.
- כל עמוד admin משתמש ב־`organizationId` של המשתמש המחובר.
- כל repository query במסכי admin מסונן לפי `organizationId` מה־session.
- `owner` ו־`admin` מקבלים full organization access.
- `area_manager` ו־`manager` מסוננים לפי `allowedBranchIds` ו־`allowedRestroomIds`.
- `operations_worker` ו־`cleaner` מסוננים לפי `allowedBranchIds`, `allowedRestroomIds`, ו־`assignedRestroomIds`.
- `manager` ישן בלי scopes נשאר עם full organization access זמני לשמירת תאימות.
- `cleaner` ישן בלי scopes לא נשבר ב־login, אבל `/work` מציג שאין אזורי עבודה משויכים.

## Adding Users Manually

הוספת משתמש עסקי מתבצעת דרך `/admin/users` על ידי `owner` או `admin`.

ניהול משמרות בסיסי מתבצע דרך `/admin/shifts` על ידי `owner` או `admin`.

אפשר גם להוסיף ידנית ב־`cleanpulse-data` בעת הצורך:

- חובה `organizationId` תקין.
- חובה `email` ייחודי בתוך הארגון.
- חובה `passwordHash` שנוצר מראש עם bcrypt.
- חובה `role` מתוך הרשימה המוגדרת.
- חובה `isActive=true|false`.
- אופציונלי `defaultShiftId` כ־fallback למשמרת קבועה. שיוך עובדים אמיתי למשמרת נשמר גם דרך `assignedUserIds` על `shifts`.

## Why There Is No Open Registration

- המערכת מיועדת ל־B2B ולארגונים סגורים.
- אין self-signup ב־MVP.
- שליטה ידנית במשתמשים מקטינה סיכון ומפשטת onboarding ראשוני.
