# Worker Portal

## Route

`/work`

מיועד ל:

- `operations_worker`
- `cleaner`

משתמשים אחרים מופנים לאזור ברירת המחדל שלהם.

## מה עובד רואה

- ברכת שלום עם שם העובד.
- תאריך היום.
- מספר פניות פתוחות.
- מספר פעולות שבוצעו היום.
- אזורי העבודה המשויכים אליו.
- פניות פתוחות רק ב־scope שלו.
- פעילות אחרונה שלו.

## פעולות עובד

על כל פנייה פתוחה העובד יכול:

- לסמן `התחלתי טיפול`.
- לסמן `טופל`.
- לבצע `ניקוי מקיף`.
- להוסיף הערת טיפול קצרה.

העובד לא מקבל:

- דוחות רחבים.
- הגדרות.
- ניהול משתמשים.
- פעולת dismiss.

## Logging

כל פעולה דרך `/work` יוצרת `activity_log` עם:

- `actorUserId`
- `actorFullName`
- `actorRole`
- `branchId`
- `restroomId`
- `incidentId`
- `shiftId` רק אם נמצאה משמרת תואמת

`shiftId` נקבע בזמן ביצוע הפעולה דרך `resolveShiftForAction`: קודם משמרת פעילה שמשויכת לעובד ומתאימה לסניף/אזור/שעה, אחר כך `defaultShiftId` אם הוא מתאים. אם אין התאמה, לא נכתב `shiftId` ונכתב `metadata.shiftResolution`.

## עובד בלי Scope

אם `cleaner` או `operations_worker` מתחבר בלי `allowedRestroomIds`, `assignedRestroomIds`, או `allowedBranchIds`, המערכת לא נשברת.

במקום crash, `/work` מציג:

`לא הוקצו לך אזורי עבודה עדיין`

## דוח תפוקת עובדים

`/admin/reports/team` מחשב פעילות צוות מתוך:

- `activity_logs`
- זמני `incidents`
- `shiftId` אם קיים
- פעולות ללא משמרת מוצגות בנפרד כ־`ללא שיוך משמרת`

אם אין נתוני משמרות, מוצג fallback ברור ולא נוצרים נתונים מלאכותיים.

פניות פתוחות בסוף משמרת אינן מחושבות כרגע ללא snapshot סוף משמרת אמין.
