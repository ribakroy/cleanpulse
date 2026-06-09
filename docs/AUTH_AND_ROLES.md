# CleanPulse Auth And Roles

## Authentication

- ה־login מתבצע דרך `/login` עם server action.
- המשתמש נשלף מה־data layer לפי email בלבד, server-side.
- הסיסמה נבדקת מול `passwordHash` עם `bcrypt.compare`.
- אם המשתמש פעיל, נוצר JWT חתום ונכתב ל־cookie בשם `cleanpulse_session`.
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
- `manager`: דיווחים, דוחות, צפייה בהגדרות ובמיקומים.
- `cleaner`: צפייה בדיווחים ועדכון סטטוס בלבד.

## Permission Helpers

- `canManageSettings(user)`
- `canManageRecipients(user)`
- `canViewReports(user)`
- `canResolveIncident(user)`
- `canViewIncidents(user)`
- `assertSameOrganization(user, organizationId)`

## Multi-Tenant Scope

- הלקוח לא שולח `organizationId` כנתון אמין.
- כל עמוד admin משתמש ב־`organizationId` של המשתמש המחובר.
- כל repository query במסכי admin מסונן לפי `organizationId` מה־session.

## Adding Users Manually

בעתיד, ב־`cleanpulse-data`, הוספת משתמש תיעשה ידנית בקובץ JSON ב־collection של `users`:

- חובה `organizationId` תקין.
- חובה `email` ייחודי בתוך הארגון.
- חובה `passwordHash` שנוצר מראש עם bcrypt.
- חובה `role` מתוך הרשימה המוגדרת.
- חובה `isActive=true|false`.

## Why There Is No Open Registration

- המערכת מיועדת ל־B2B ולארגונים סגורים.
- אין self-signup ב־MVP.
- שליטה ידנית במשתמשים מקטינה סיכון ומפשטת onboarding ראשוני.
