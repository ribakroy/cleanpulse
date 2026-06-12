# User Management

## Routes

- `/admin/users`: ניהול משתמשים עסקיים.
- `/admin/shifts`: ניהול משמרות בסיסי.
- `/work`: אזור עבודה לעובדי שטח.

## מי יכול לנהל משתמשים

- `owner`
- `admin`

משתמש עסקי לא יכול ליצור, לערוך או להשבית `super_admin`.

## יצירת משתמש

שדות:

- שם מלא
- אימייל
- טלפון אופציונלי
- תפקיד פנימי אופציונלי
- role
- סניפים מורשים
- אזורי שירותים מורשים
- משמרת קבועה אופציונלית (`defaultShiftId`)
- סיסמה זמנית

אם לא מוזנת סיסמה זמנית, המערכת יוצרת אחת ומציגה אותה פעם אחת בלבד אחרי היצירה.

## Roles שניתנים לניהול מהאדמין העסקי

- `admin`: מנהל על עסקי.
- `area_manager`: מנהל אזור.
- `operations_worker`: עובד תפעולי.

Roles קיימים נשמרים:

- `owner`
- `manager`
- `cleaner`

## Scopes

- `owner` ו־`admin`: גישה מלאה לארגון.
- `area_manager` ו־`manager`: גישה רק ל־`allowedBranchIds` ו־`allowedRestroomIds`.
- `operations_worker` ו־`cleaner`: גישה רק ל־`allowedBranchIds`, `allowedRestroomIds`, ו־`assignedRestroomIds`.

## Backward Compatibility

- משתמש ישן בלי `isActive` נחשב פעיל.
- משתמש ישן בלי scopes נטען בלי migration.
- `manager` ישן בלי scopes מקבל זמנית גישת ארגון מלאה כדי לא לשבור עבודה קיימת.
- `cleaner` ישן בלי scopes מתחבר ל־`/work` ורואה הודעה שאין אזורי עבודה משויכים.

## Logging

כל פעולה ניהולית נכתבת ל־`activity_logs`:

- `user_created`
- `user_updated`
- `user_disabled`
- `user_password_reset`

לא נשמרת סיסמה גולמית ב־log.

## Shifts MVP

- `owner` ו־`admin` יכולים ליצור, לערוך ולהשבית משמרות דרך `/admin/shifts`.
- שיוך עובד למשמרת נעשה דרך `assignedUserIds` במשמרת, עם `defaultShiftId` רק כ־fallback כאשר הוא באמת מתאים לזמן/סניף/אזור.
- פעולות עובד נשמרות ב־`activity_logs.shiftId` רק אם `resolveShiftForAction` מצא משמרת פעילה שמתאימה לעובד, לשעה ולמיקום. אחרת נשמר `metadata.shiftResolution` כמו `none` או `outside_shift`.
- אין עדיין חישוב אמין של "פתוחות בסוף משמרת"; הדוח מציג fallback ולא מייצר נתון מלאכותי.
