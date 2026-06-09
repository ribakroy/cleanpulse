# הגדרת מאגר הנתונים ב-GitHub (GitHub Data Setup Guide)

מדריך זה מסביר כיצד להקים, לחבר ולתפעל את מאגר הנתונים המבוזר של CleanPulse באמצעות GitHub REST API כבסיס נתונים (DATA_ADAPTER=github).

---

## 1. הקמת מאגר הנתונים (Data Repository)

יש להקים מאגר נתונים נפרד לחלוטין ממאגר האפליקציה הראשי כדי להפריד בין קוד המקור למידע התפעולי של הלקוחות:

1. היכנס לחשבון ה-GitHub שלך וצור מאגר (Repository) חדש.
2. הגדר את שם המאגר כ: **`cleanpulse-data`**.
3. **חשוב מאוד**: הגדר את ה-Visibility כ-**`Private`** (פרטי). אסור שמידע הלקוחות יהיה חשוף לציבור.
4. בחר באפשרות להוסיף קובץ `README.md` כדי שהמאגר לא יהיה ריק לחלוטין (נדרש קובץ קיים כדי ליצור ענף `main`).
5. **למה לא מחברים את `cleanpulse-data` ל-Vercel?**
   מאגר הנתונים משתנה בכל פעם שנוצר דיווח או מעודכן סטטוס (כל פעולה מבצעת Commit חדש). אם נחבר את המאגר ל-Vercel, המערכת תבצע Deploy חדש לשרת עשרות פעמים ביום ללא צורך ותחסום את מכסת הדקות שלך. רק מאגר האפליקציה `cleanpulse` מחובר ל-Vercel.

---

## 2. יצירת טוקן גישה (Fine-grained GitHub Personal Access Token)

כדי לאפשר לאפליקציה לכתוב ולקרוא מהמאגר הפרטי בצורה מאובטחת, יש לייצר טוקן גישה מוגבל ומאובטח:

1. היכנס ב-GitHub אל: **Settings > Developer Settings > Personal Access Tokens > Fine-grained tokens**.
2. לחץ על **Generate new token**.
3. הגדר שם מתאים (למשל: `CleanPulse Production Data Connection`).
4. תחת **Repository access**, בחר ב-**Only select repositories** ובחר במאגר **`cleanpulse-data`** בלבד.
5. תחת **Permissions > Repository permissions**, הגדר:
   - **Contents**: בחר ב-**Read and write**.
6. לחץ על **Generate token** והעתק את הטוקן שנוצר (הוא לא יוצג שוב!).

---

## 3. הגדרת משתני סביבה (Environment Variables)

הוסף את משתני הסביבה הבאים לקובץ **`.env.local`** המקומי שלך (בקובץ זה הם נשמרים מקומית ולעולם לא מועלים ל-Git):

```env
# הגדרת אדפטר הדאטה לגיטהאב
DATA_ADAPTER=github

# הגדרות חיבור המאגר
GITHUB_DATA_OWNER=ribakroy
GITHUB_DATA_REPO=cleanpulse-data
GITHUB_DATA_BRANCH=main

# הטוקן שייצרת בשלב הקודם
GITHUB_DATA_TOKEN=github_pat_...
```

---

## 4. הרצת Seed והזנת נתוני דמו ראשוניים

לאחר שהגדרת את משתני הסביבה בקובץ `.env.local`, תוכל להזין את נתוני הדמו הראשוניים למאגר ה-GitHub שלך:

> [!WARNING]
> הרצת ה-seed תמחק ותדרוס נתונים קיימים במאגר רק אם תשתמש בפרמטר `--force`.
> ודא שהגדרת את ה-Token הנכון לפני ההרצה.

```bash
# הרצת ה-seed ל-GitHub (בדיקה שקטה ללא דריסת קבצים קיימים)
npm run seed:github

# הרצה כפויה (Overwrite) המוחקת ומקימה מחדש את מבנה הנתונים
npm run seed:github -- --force
```

---

## 5. אימות שהאפליקציה קוראת ומציגה מגיטהאב

כדי לוודא שהאפליקציה עברה בהצלחה לשימוש ב-GitHub Data Adapter:

1. הפעל את האפליקציה מקומית (`npm run dev`).
2. היכנס ל-Dashboard של ה-Admin.
3. ודא כי בכרטיסיית **"מצב החיבור"** (Connection Status) מופיע:
   - **Data adapter**: `github`
4. בצע פעולה (למשל, שינוי סטטוס של דיווח מ-open ל-acknowledged).
5. היכנס למאגר `cleanpulse-data` ב-GitHub וודא כי נוצר Commit חדש המייצג את העדכון שלך, וכי הקובץ המתאים ב-`data/incidents/` עודכן.
6. **אבטחה**: פתח את כלי הפיתוח בדפדפן (F12) וודא כי לא נשלחת אף בקשת רשת מהלקוח המכילה את ה-Token או פונה ישירות ל-GitHub. כל התקשורת מתבצעת Server-side בלבד מול שרתי ה-Next.js.

---

## 6. מגבלות אדפטר ה-GitHub כבסיס נתונים

* **Latency (זמני תגובה)**: כל קריאה או כתיבה מתורגמת לקריאת HTTP API מול GitHub, מה שמביא לזמני תגובה של 200ms - 800ms לפעולה.
* **Concurrency (עריכה מקבילית)**: אין נעילות מסדי נתונים אמיתיות. המערכת משתמשת ב-Optimistic concurrency control מבוסס ה-SHA של הקובץ ומבצעת עד 3 ניסיונות כתיבה חוזרים (Retry) במקרה של התנגשות.
* **Rate Limits**: ל-GitHub API יש מגבלת קצב של 5,000 בקשות בשעה לכל טוקן. המערכת מתאימה ל-MVP ולפיילוטים קטנים בלבד.
* **חיפושים ופילוחים**: מכיוון שאין מנוע אינדקסים, סינון הדיווחים מבוצע בזיכרון של השרת לאחר טעינת הקבצים (בפולינג של ה-Admin).

---

## 7. נוהל שחזור מהיר (Rollback)

במקרה של כשל נתונים או שגיאה תפעולית:
1. פתח את המאגר `cleanpulse-data` בגיטהאב.
2. לחץ על **Commits** כדי לראות את היסטוריית השינויים האחרונים.
3. זהה את הקומיט התקין האחרון (לפני השיבוש).
4. בצע Checkout לענף או לקבצים הרלוונטיים במחשב המקומי שלך ודחוף אותם מחדש ל-main (ראה פירוט מלא ב-[DATA_REPO_OPERATIONS.md](file:///Users/royribak/Documents/CleanPulse/docs/DATA_REPO_OPERATIONS.md)).
