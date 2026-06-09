# Email Alerts Design

## 1. מטרה

כאשר נוצר `incident`, העסק צריך לקבל התראה מהירה וברורה במייל, בלי לחסום את עצם יצירת הדיווח אם אין נמענים או אם השליחה נכשלת.

## 2. Provider strategy

### Production

- `ResendEmailProvider`
- שליחה אמיתית דרך Resend API

### Development

- `MockEmailProvider`
- אין שליחה אמיתית
- שמירת output ללוגים או למסך dev

## 3. היררכיית נמענים

סדר חיפוש הנמענים קבוע:

1. `screen specific recipients`
2. `restroom recipients`
3. `branch recipients`
4. `organization default recipients`

כלל resolution:

- אם נמצאו נמענים ברמה כלשהי, עוצרים שם.
- לא מאחדים אוטומטית בין רמות ב־MVP.
- אם אין אף נמען, לא נכשיל את יצירת האירוע.

## 4. Email notification lifecycle

1. נוצר incident.
2. המערכת קוראת recipients לפי ההיררכיה.
3. אם אין recipients:
   - נוצר `notification_log`
   - `status = failed`
   - `failureReason = no_recipients`
   - אין rollback ל־incident
4. אם יש recipients:
   - נוצר `notification_log` ב־`pending`
   - המערכת בונה subject + HTML body
   - שולחת דרך provider
   - אם הצליח: `sent`
   - אם נכשל: `failed`

## 5. תוכן המייל ב־MVP

### Subject מומלץ

`CleanPulse: דיווח חדש - {issueLabel} | {branchName} | {restroomName}`

### Body צריך לכלול

- סוג הבעיה או הדירוג
- שם הסניף
- שם אזור השירותים
- שם המסך
- שעת הדיווח
- קישור ישיר למסך האירוע במערכת

### Tone

- קצר
- ברור
- תפעולי
- בעברית מלאה

## 6. תבנית המייל

ב־MVP די במייל HTML פשוט, RTL, עם CTA אחד:

- `צפה באירוע`

העיצוב צריך להיות עקבי עם השפה הפרימיום של המוצר, אבל לא להכביד.

## 7. Notification log model

לכל ניסיון שליחה נשמור:

- `incidentId`
- `scopeUsed`
- `recipientIds`
- `recipientEmails`
- `status`
- `provider`
- `providerMessageId`
- `failureReason`
- `attemptedAt`
- `sentAt`

כך אפשר:

- לראות אם התראה יצאה
- לדעת למה לא יצאה
- להצליב בין אירועים לבין מסלול ההתראה

## 8. Failure handling

### אין נמענים

- האירוע נוצר.
- נוצר `notification_log` עם `no_recipients`.
- במסך admin אפשר להציג badge של "אין נמענים".

### כשל ב־Resend

- האירוע נוצר.
- notification log מסומן `failed`.
- אפשר לנסות resend ידני בעתיד.

### אימיילים לא תקינים

ב־MVP הוולידציה נעשית בעת הזנת recipient.
ניהול bounce מתקדם הוא post-MVP.

## 9. Security and privacy

- לא שולחים מידע רגיש שאינו נחוץ.
- לא שולחים raw public token במייל.
- הקישור במייל מוביל לעמוד admin מוגן התחברות.
- אין חשיפת נתוני GitHub או מזהים פנימיים שאינם נדרשים למשתמש.

## 10. MVP vs Post-MVP

### MVP

- מייל מיידי לכל incident חדש
- ללא תור הודעות חיצוני
- ללא retry job אוטומטי רוחבי
- ללא webhooks של delivery/bounce

### Post-MVP

- retries אוטומטיים
- digests
- escalation rules
- delivery tracking
- webhook feedback loops
- multi-channel alerts
