# GitHub Data Architecture

## 1. למה GitHub כ־DB ב־MVP

הבחירה ב־GitHub Data Repo מתאימה ל־MVP כי היא נותנת:

- התחלה מהירה בלי להרים DB service.
- version history לכל שינוי.
- private repo פשוט לתפעול.
- הפרדה מלאה בין אפליקציה לדאטה.
- עלות ותפעול נמוכים בשלב ולידציית המוצר.

היא לא נועדה להיות פתרון scale ארוך טווח.

## 2. למה `cleanpulse-data` נפרד מ־`cleanpulse-mvp`

- מונע commit של live data לתוך Repo הקוד.
- מונע deployment על כל שינוי דאטה.
- שומר boundary נקי בין code ל־runtime state.
- מאפשר הרשאות GitHub נפרדות.
- מפשט מעבר עתידי למסד נתונים אמיתי, כי שכבת המוצר נשענת על adapter ולא על קבצים מקומיים.

## 3. עקרונות שמירת דאטה

- מקור האמת הוא קובץ JSON אחד לכל record.
- לא שומרים arrays ענקיים של records בתוך קובץ אחד.
- records שנוצרים הרבה, כמו `incidents` ו־`logs`, נשמרים בקבצים נפרדים.
- indexes נגזרים מותרים, אבל אינם מקור האמת.
- כל כתיבה לפרודקשן נעשית דרך GitHub API בלבד.

## 4. מבנה Repo מומלץ

```text
cleanpulse-data/
  organizations/
    org_01J.../
      organization.json
      users/
        usr_01J....json
      branches/
        br_01J....json
      restrooms/
        rr_01J....json
      screens/
        sc_01J....json
      issue_types/
        it_01J....json
      notification_recipients/
        nr_01J....json
      incidents/
        2026/
          06/
            09/
              inc_01J....json
      notification_logs/
        2026/
          06/
            09/
              nlog_01J....json
      activity_logs/
        2026/
          06/
            09/
              alog_01J....json
      indexes/
        open_incidents.json
  public_token_index/
    4f8c....json
  user_email_index/
    e3aa....json
```

## 5. Record conventions

### IDs

- `org_`
- `usr_`
- `br_`
- `rr_`
- `sc_`
- `it_`
- `inc_`
- `nr_`
- `nlog_`
- `alog_`

מומלץ להשתמש ב־ULID או UUIDv7 כדי לקבל גם uniqueness וגם sortable IDs.

### Metadata שצריך להיות כמעט בכל record

- `id`
- `organizationId`
- `createdAt`
- `updatedAt`
- `version`
- `archivedAt` או `isActive` אם רלוונטי

## 6. איך קריאות עובדות

### Reads בסיסיים

- קריאה לרשומות בודדות לפי path ידוע.
- קריאת directories של ישויות לפי organization.
- סריקת incident files לפי שנה/חודש/יום לדוחות.

### Index reads

- `public_token_index` לפתרון מהיר של `publicToken`.
- `user_email_index` לאיתור user בזמן login.
- `open_incidents.json` לתצוגת דשבורד מהירה.

### Cache policy

- מסכי admin קריטיים: `no-store`.
- public screen resolution: cache קצר בלבד אם בכלל.
- דוחות: אפשר cache קצר ברמת response, אך מקור האמת נשאר ה־JSON records.

## 7. איך כתיבות עובדות

### יצירת record חדש

1. השרת מייצר ID.
2. בונה JSON מלא.
3. כותב לקובץ חדש דרך GitHub Contents API.
4. אם זו ישות שדורשת index, מעדכן גם index נגזר.

### עדכון record קיים

1. קוראים את הקובץ הנוכחי ואת ה־SHA שלו.
2. מבצעים merge לוגי בצד השרת.
3. שולחים PUT חדש עם אותו `sha`.
4. אם מתקבל conflict, עושים read מחדש ומנסים retry.

### כתיבה של Incident

ביצירת `incident` יש לפחות 3 כתיבות:

1. קובץ incident.
2. קובץ activity log של יצירה.
3. קובץ notification log או עדכון index פתוחים.

המערכת צריכה להתייחס ל־incident record ככתיבה הקריטית.
אם כתיבת ה־log או שליחת המייל נכשלות, האירוע לא מבוטל.

## 8. איך מונעים קונפליקטים בסיסיים בכתיבה

### עקרונות

- קובץ אחד לכל record מפחית collision.
- כתיבות immutable מועדפות על פני עריכת arrays משותפים.
- updates משתמשים ב־optimistic concurrency לפי `sha`.
- retries מוגבלים עם backoff קצר.

### צעדים מעשיים

- `incidents`, `activity_logs`, `notification_logs` נכתבים כקבצים חדשים.
- `open_incidents.json` הוא index נגזר בלבד.
- אם index נכשל להתעדכן, אפשר לבנות אותו מחדש מסריקת records.
- public submissions לא תלויים בהצלחת index נגזר כדי להיחשב כהצלחה.

### אסטרטגיית retry מומלצת

- עד 2 ניסיונות retry עבור update של index או record mutable.
- אם עדיין יש conflict:
  - incident creation נשארת success אם record הראשי נכתב.
  - נרשמת שגיאת מערכת ב־activity log או monitoring.

## 9. Public token resolution

לכל screen יש `publicToken` ארוך ולא מנחש.
כדי לא לסרוק את כל המסכים בכל בקשה:

1. יוצרים `publicTokenHash = sha256(publicToken)`.
2. שומרים mapping ב־`public_token_index/{hash}.json`.
3. הבקשה הציבורית מחשבת hash ומחפשת index file אחד.

ל־MVP אפשר לשמור גם את הטוקן הגולמי בתוך screen record הפרטי לנוחות תפעולית.
בשלב קשיח יותר אפשר לעבור ל־hash-only או encrypted token storage.

## 10. User email resolution

לצורך login מהיר:

1. מנרמלים אימייל ל־lowercase trimmed.
2. מחשבים hash.
3. שומרים mapping ב־`user_email_index`.

כך אין צורך לסרוק את כל `users/` בזמן התחברות.

## 11. מגבלות GitHub כ־DB

- latency גבוהה יותר מ־DB רגיל.
- rate limits.
- כתיבות אינן transactional.
- sorting/filtering נעשים באפליקציה.
- concurrency נוח רק לנפחי MVP נמוכים.
- דוחות כבדים עלולים להיות איטיים.
- audit/version history של Git טוב, אבל recovery operational פחות נוח ממסד נתונים אמיתי.

## 12. מתי GitHub DB מפסיק להספיק

- כאשר יש הרבה סניפים פעילים במקביל.
- כאשר תדירות האירועים עולה משמעותית.
- כאשר צריך querying גמיש מאוד.
- כאשר נדרשים SLA, תורים, retries מורכבים או webhooks.
- כאשר open incident index מתחיל לסבול מ־conflicts תכופים.

## 13. Adapter contract

המערכת לא תיגש ישירות ל־GitHub API ממסכי המוצר.
במקום זה היא תשתמש ב־`DataAdapter` עם פעולות כגון:

- `getScreenByPublicToken(token)`
- `createIncident(input)`
- `updateIncidentStatus(input)`
- `listIncidents(filters)`
- `listReports(range, scope)`
- `resolveRecipients(scope)`
- `createNotificationLog(input)`
- `appendActivityLog(input)`

הגבול הזה הוא המפתח למעבר עתידי למסד נתונים אמיתי בלי לשכתב את שכבת ה־UI וה־domain.
