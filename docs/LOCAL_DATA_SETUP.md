# Local Data Setup

## מטרה

בפיתוח מקומי אפשר לעבוד עם:

```env
DATA_ADAPTER=local
```

במצב הזה CleanPulse קורא וכותב JSON files ל־`data-local/`.

## איפה הדאטה נשמר

המיקום המקומי:

```text
data-local/
  data/
    organizations/
    users/
    branches/
    restrooms/
    screens/
    issue_types/
    incidents/
    notification_recipients/
    notification_logs/
    activity_logs/
```

`incidents`, `notification_logs`, `activity_logs` נשמרים בתיקיות משנה לפי שנה/חודש.

## איך מריצים seed

```bash
npm run seed:local
```

אם כבר יש דאטה קיים, הסקריפט ייעצר.

להרצה מחדש עם איפוס:

```bash
npm run seed:local -- --force
```

## מה ה־seed יוצר

- organization: `קפה דמו`
- owner user: `owner@demo.local`
- branch: `רוטשילד`
- restroom: `שירותי לקוחות - קומה 1`
- screen אחד
- 7 issue types
- recipient אחד
- 10 incidents לדוגמה

## איך מאפסים דאטה מקומי

אפשר דרך:

```bash
npm run seed:local -- --force
```

או ידנית:

```bash
rm -rf data-local
```

## הגנה מפרודקשן

אם `DATA_ADAPTER=local` ורצים בפרודקשן, ה־adapter מחזיר שגיאה ברורה ולא אמור לשמש ב־deployment.

## איך לא מעלים את הדאטה המקומי ל־GitHub

`data-local/` נמצא ב־`.gitignore`.

בנוסף, גם:

- `.env`
- `.env.local`

נשארים מחוץ ל־git.
