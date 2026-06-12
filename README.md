# CleanPulse

CleanPulse הוא בסיס ה־MVP של מערכת דיווחי שירותים ותפעול בזמן אמת עבור צוותים ומנהלים.

המערכת בנויה בארכיטקטורה המפרידה בין קוד המקור (App Repository) לבין הנתונים התפעוליים (Data Repository).

---

## מבנה המאגרים (Two-Repository Model)

1. **`cleanpulse` (מאגר האפליקציה הנוכחי)**:
   - קוד המקור של אפליקציית ה-Next.js.
   - ממשקי ה-Kiosk הציבוריים ולוח הבקרה למנהלים.
   - מתפרס לשרת ה-Vercel.
2. **`cleanpulse-data` (מאגר הנתונים הפרטי)**:
   - מכיל את קובצי ה-JSON המהווים את בסיס הנתונים של ה-MVP.
   - המאגר הוא **פרטי לחלוטין** ומאובטח.
   - **אין** לחבר אותו ל-Vercel למניעת Deploy מיותר בכל כתיבת נתון.

*הערה: חלק מהתכונות כמו אינדקסים מלאים (indexes), שמירת גרסאות נתונים (snapshots) וסקוֹפּים מפורטים (role scopes) מסומנים כ־Planned לגרסאות עתידיות.*

---

## התקנה והרצה מקומית (Local Setup)

### 1. התקנת תלויות
```bash
npm install
```

### 2. הגדרת משתני סביבה
העתק את קובץ `.env.example` לקובץ `.env.local`:
```bash
cp .env.example .env.local
```
*הערה: בשלב זה ה־`EMAIL_PROVIDER` מוגדר כ־mock כברירת מחדל ולא שולח מיילים אמיתיים.*

### 3. הרצת ה-seed המקומי (פיתוח)
הזנת נתוני דמו מקומיים לתיקיית `data-local/`:
```bash
npm run seed:local
```

להרצה חוזרת המנקה את בסיס הנתונים המקומי ובונה אותו מחדש:
```bash
npm run seed:local -- --force
```

### 4. הרצת שרת הפיתוח
```bash
npm run dev
```

---

## פקודות איכות ותקינות קוד

לפני כל הגשה, בדיקה או פריסה של קוד, יש להריץ את פקודות הבדיקה הבאות כדי לוודא שאין שגיאות:

```bash
# הרצת ה-Linter (ESLint)
npm run lint

# הרצת בדיקת טיפוסים (TypeScript)
npm run typecheck

# הרצת ה-Production Build לווידוא תקינות ה-Next.js compilation
npm run build

# בדיקת איכות מאוחדת (מריץ lint, typecheck ו-build ברצף)
npm run check
```

---

## Route Map עיקרי

- `/login`: התחברות.
- `/admin/dashboard`: סקירה עסקית.
- `/admin/incidents`: דיווחים וטיפול.
- `/admin/reports`: דוחות תפעוליים.
- `/admin/reports/team`: תמונת פעילות צוות.
- `/admin/users`: ניהול משתמשים והרשאות.
- `/admin/shifts`: ניהול משמרות.
- `/work`: אזור עבודה לעובד תפעולי.
- `/super/dashboard`: ניהול על פנימי.
- `/q/[token]` ו־`/k/[token]`: דיווח ציבורי QR/Kiosk.

מסמכים רלוונטיים:

- [docs/USER_MANAGEMENT.md](./docs/USER_MANAGEMENT.md)
- [docs/ROLE_PERMISSIONS.md](./docs/ROLE_PERMISSIONS.md)
- [docs/WORKER_PORTAL.md](./docs/WORKER_PORTAL.md)

---

## עבודה עם GitHub כבסיס נתונים (Production / Dev Cloud)

למעבר לעבודה מול מאגר הנתונים בענן:
1. פעל לפי ההנחיות המופיעות במדריך [docs/GITHUB_DATA_SETUP.md](./docs/GITHUB_DATA_SETUP.md) ליצירת מאגר הנתונים וטוקן הגישה.
2. הגדר ב-`.env.local` את ערך ה-`DATA_ADAPTER=github` ומלא את משתני הסביבה המתאימים.
3. להזנת נתונים ראשוניים למאגר ה-GitHub:
   ```bash
   npm run seed:github
   ```
4. לפרטים על ניהול שוטף, גיבויים, שחזורים והתמודדות עם התנגשויות נתונים, עיין במדריך [docs/DATA_REPO_OPERATIONS.md](./docs/DATA_REPO_OPERATIONS.md).

---

## פריסה ל-Production (Vercel Deployment)

לפני פריסת המערכת ל-Vercel, יש לפעול לפי המדריכים הבאים:
* [מדריך הגדרת Vercel ומשתני סביבה](./docs/VERCEL_DEPLOYMENT.md) – הנחיות מלאות לחיבור הריפו והגדרות הפרויקט.
* [צ'קליסט מוכנות לייצור (Production Checklist)](./docs/PRODUCTION_CHECKLIST.md) – שלבי בדיקה ידניים ו-QA לווידוא תקינות המערכת.

*אזהרה: יתכנו אזהרות Next/PostCSS (moderate) בזמן ריצת audit שישאירו תלויות כמות שהן עד לתיקון רשמי של חבילות המקור, אין לאלץ (force) תיקון הפוגע ביציבות.*
