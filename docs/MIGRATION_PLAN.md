# Migration Plan: GitHub Data Repo to Postgres / Neon / Supabase

## 1. מטרת המסמך

ה־MVP בנוי בכוונה על GitHub Data Repo כדי להגיע מהר לשוק.
אם המוצר מצליח, צריך להיות מסלול מעבר מסודר למסד נתונים אמיתי בלי לפרק את שכבת המוצר.

## 2. עקרון על

האפליקציה לא תכיר GitHub ישירות.
היא תכיר רק `DataAdapter`.

בזכות זה, ההגירה העתידית היא החלפת adapter ושכבת persistence, לא החלפת מוצר שלם.

## 3. מתי לבצע Migration

טריגרים ברורים:

- rate limits מתחילים להשפיע.
- דוחות נעשים איטיים מדי.
- יש conflicts תכופים על indexes.
- onboarding של כמה לקוחות במקביל יוצר מורכבות תפעולית.
- יש צורך ב־search, filtering ו־analytics שאינם סבירים על JSON files.
- נדרש reliability גבוה יותר סביב notifications ו־queues.

## 4. יעד מומלץ

### אפשרות 1: Neon / Postgres

המסלול המומלץ אם רוצים DB נקי, פשוט וגמיש.

יתרונות:

- SQL אמיתי
- query performance טובה יותר
- concurrency אמין יותר
- קל יותר לבנות reporting
- נשארים בשליטה מלאה על auth וה־domain

### אפשרות 2: Supabase

רלוונטי אם בהמשך רוצים גם:

- managed Postgres
- auth features
- storage
- realtime

בשלב הזה אין צורך בכך, ולכן נכון לא להתחיל שם.

## 5. הכנות שכדאי לעשות כבר עכשיו

- לשמור על `DataAdapter` קשיח וברור.
- לא לפזר GitHub path logic בקומפוננטות.
- להחזיק IDs יציבים שלא תלויים ב־filesystem path.
- לשמור timestamps ב־ISO UTC.
- לשמור enums יציבים.
- להחזיק snapshots לשדות תצוגה היסטוריים.

## 6. מיפוי ישויות לטבלאות SQL עתידיות

### Core tables

- `organizations`
- `users`
- `branches`
- `restrooms`
- `screens`
- `issue_types`
- `incidents`
- `notification_recipients`
- `notification_logs`
- `activity_logs`

### Indexes SQL עתידיים מומלצים

- `incidents (organization_id, reported_at desc)`
- `incidents (branch_id, reported_at desc)`
- `incidents (restroom_id, reported_at desc)`
- `incidents (screen_id, reported_at desc)`
- `incidents (status, reported_at desc)`
- `screens (public_token_hash unique)`
- `users (organization_id, email_normalized unique)`

## 7. אסטרטגיית Migration

### Phase A: dual-read preparation

- מגדירים SQL schema מקביל.
- בונים `PostgresDataAdapter`.
- משמרים את `GitHubDataAdapter` ל־fallback.

### Phase B: export and import

- מייצאים records מה־JSON repo.
- מנרמלים relations.
- טוענים לטבלאות SQL.
- מריצים validation על counts ו־sample records.

### Phase C: dual-write optional window

אם צריך זהירות גבוהה:

- כותבים גם ל־GitHub וגם ל־SQL לזמן מוגבל.
- משווים תוצאות.

ל־MVP קטן אפשר גם לבצע cutover ישיר בלי dual-write ארוך.

### Phase D: read switch

- מעבירים reads ל־SQL adapter.
- שומרים fallback זמני ל־GitHub אם צריך.

### Phase E: full cutover

- מכבים writes ל־GitHub.
- משאירים repo כארכיון היסטורי.

## 8. Validation checklist למעבר

- כל organizations יובאו.
- כל users נשמרו עם role ו־scope.
- כל screens נשמרו עם `publicTokenHash`.
- כל incidents נשמרו עם status ו־timestamps.
- כל notification logs נשמרו.
- כל activity logs נשמרו.
- counts בין המקורות תואמים.
- sample queries קריטיות מחזירות אותן תוצאות.

## 9. סיכוני Migration

- JSON records לא עקביים אם MVP יתפתח בלי משמעת schema.
- fields אופציונליים רבים מדי יקלו על השקה אבל יקשהו על המרה.
- indexes נגזרים ב־GitHub עלולים לא לשקף 100% truth אם לא שוחזרו לפני export.

לכן לפני export יש להריץ:

- schema validation
- rebuild indexes
- orphan detection

## 10. Recommendation

אם CleanPulse מקבל traction אמיתי, ההמלצה היא:

1. מעבר ראשון ל־Neon/Postgres.
2. להשאיר auth custom בשלב הראשון גם אחרי המעבר.
3. לשקול Supabase רק אם צריך שירותים מנוהלים נוספים מעבר ל־DB.
