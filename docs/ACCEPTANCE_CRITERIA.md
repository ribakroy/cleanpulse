# CleanPulse MVP Acceptance Criteria

## 1. Public reporting

### AC-01

Given מסך ציבורי פעיל עם `publicToken` תקף,
When מבקר לוחץ על אחת התקלות או על דירוג כוכבים,
Then המערכת יוצרת `incident` חדש עם `organizationId`, `branchId`, `restroomId`, `screenId`.

### AC-02

Given `publicToken` לא תקף או מסך לא פעיל,
When נשלחת בקשת דיווח,
Then האירוע לא נוצר ומוחזרת שגיאה ציבורית גנרית מתאימה.

### AC-03

When הדיווח נוצר בהצלחה,
Then המשתמש רואה מסך תודה ברור והמסך חוזר אוטומטית למצב מוכן לדיווח הבא.

## 2. Data persistence

### AC-04

Every incident, notification log ו־activity log נשמרים ב־`cleanpulse-data` בלבד.

### AC-05

No runtime write נשמר ב־filesystem המקומי של Vercel בפרודקשן.

### AC-06

Data writes אינם משנים את `cleanpulse-mvp` ואינם מפעילים deployment.

## 3. Recipient resolution and email alerts

### AC-07

When נוצר incident,
Then המערכת מחפשת נמענים לפי הסדר:
`screen -> restroom -> branch -> organization`.

### AC-08

If נמצאו recipients ברמת `screen`,
Then ההתראה נשלחת רק אליהם.

### AC-09

If לא נמצאו recipients באף רמה,
Then incident עדיין נוצר ונכתב `notification_log` עם כשל `no_recipients`.

### AC-10

If שליחת המייל נכשלת,
Then incident לא מתבטל ו־`notification_log` נשמר עם `failed`.

## 4. Incident management

### AC-11

Admin users יכולים לראות רשימת incidents לפי scope והרשאות.

### AC-12

Authorized users יכולים לשנות סטטוס רק לערכים:
`open`, `acknowledged`, `in_progress`, `resolved`, `dismissed`.

### AC-13

When incident נסגר,
Then נשמר `closedAt` ונמדד `timeToCloseSeconds`.

### AC-14

Every status change יוצר `activity_log`.

### AC-15

When incident משנה סטטוס דרך משתמש מזוהה,
Then נשמר גם מי קיבל / מי טיפל / מי סגר ברשומת האירוע או בטיימליין שלו.

## 5. Roles and permissions

### AC-16

`owner` ו־`admin` רואים את כל נתוני הארגון שלהם.

### AC-17

`manager` רואה רק branches/restrooms שהוקצו לו.

### AC-18

`cleaner` רואה רק incidents בטווח שהוגדר לו ואינו יכול לנהל users, branches, screens או organization settings.

### AC-19

User מארגון אחד לא יכול לצפות או לעדכן נתונים של ארגון אחר.

## 6. Reporting

### AC-20

Dashboard מציג open incidents, counts בסיסיים ומגמות קצרות.

### AC-21

Admin יכול לצפות בדוח יומי, שבועי וחודשי לכל scope מותר.

### AC-22

Reports כוללים לפחות:

- total incidents
- incidents by issue type
- incidents by branch
- incidents by restroom
- average rating
- average close time

## 7. UX and language

### AC-23

כל ה־UI ב־RTL מלא.

### AC-24

השפה במוצר היא עברית מלאה ב־MVP.

### AC-25

כפתורי המסך הציבורי גדולים, נוחים למגע, וברורים גם במסך טאבלט עומד.

### AC-26

צבע המותג הראשי במוצר הוא `#1E88E5`, עם שפה כחולה נקייה של מים וניקיון.

## 8. Security

### AC-27

סיסמאות משתמשים נשמרות רק כ־bcrypt hashes.

### AC-28

Session auth נעשה עם JWT ב־HTTP-only cookie.

### AC-29

כל גישה ל־GitHub API עם הרשאות כתיבה נעשית server-side בלבד.

### AC-30

כל screen מחזיק `publicToken` ארוך, אקראי ולא מנחש.

## 9. GitHub DB limitations acknowledged

### AC-31

המערכת מתועדת ומעוצבת כך ש־GitHub Data Repo הוא פתרון MVP בלבד, עם adapter boundary ברור למעבר עתידי.

## 10. Definition of Done

MVP ייחשב מוכן כאשר:

- public reporting עובד מקצה לקצה
- admin auth עובד
- incidents נשמרים ב־data repo
- email alerts עובדים כשיש recipients
- notification failures מתועדים בלי להפיל incident creation
- status lifecycle מלא עובד
- reports בסיסיים קיימים
- RTL ועברית מלאה מיושמים
