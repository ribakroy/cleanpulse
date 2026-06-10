import bcrypt from "bcrypt";
import { getDataAdapter } from "../lib/data/get-data-adapter";
import type { OrganizationRecord, UserRecord } from "../lib/data/types";
import { createPrefixedId, nowIso, normalizeEmail } from "../lib/data/repositories/_shared";

async function main() {
  const isProduction = process.env.NODE_ENV === "production" || process.env.DATA_ADAPTER === "github";

  const emailInput = process.argv[2];
  const passwordInput = process.argv[3];
  const fullNameInput = process.argv[4];

  if (isProduction && (!emailInput || !passwordInput || !fullNameInput)) {
    console.error("❌ שגיאה: בסביבת ייצור (Production / GitHub Adapter) חובה להזין אימייל, סיסמה ושם מלא כפרמטרים!");
    console.error("הרצה לדוגמה:");
    console.error('  DATA_ADAPTER=github GITHUB_DATA_TOKEN=... npm run create-super-user "super@cleanpulse.app" "MySuperSecretPassword123!" "מנהל מערכת על"');
    process.exit(1);
  }

  const email = normalizeEmail(emailInput || "superadmin@cleanpulse.app");
  const password = passwordInput || "SuperAdmin123456!";
  const fullName = fullNameInput || "מנהל על מערכת";

  // Validate password strength
  if (password.length < 8) {
    console.error("❌ שגיאה: הסיסמה חייבת להיות באורך של 8 תווים לפחות.");
    process.exit(1);
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (isProduction && (!hasUppercase || !hasLowercase || !hasNumber)) {
    console.error("❌ שגיאה: בסביבת ייצור, הסיסמה חייבת להכיל לפחות אות אחת גדולה באנגלית, אות אחת קטנה ומספר.");
    process.exit(1);
  }

  console.log("⚙️  מתחיל תהליך יצירת משתמש סופר-אדמין...");
  console.log(`📧 אימייל: ${email}`);
  console.log(`👤 שם מלא: ${fullName}`);
  if (isProduction) {
    console.log(`🔑 סיסמה: [חסוי בסביבת ייצור]`);
  } else {
    console.log(`🔑 סיסמה: ${password}`);
  }

  const adapter = getDataAdapter();
  console.log(`🌐 אדפטר נתונים: ${adapter.describe().mode}`);

  // 1. Ensure system organization exists
  const systemOrgId = "org_system";
  const systemOrg = await adapter.get("organizations", systemOrgId) as OrganizationRecord | null;

  if (!systemOrg) {
    console.log("🏢 ארגון המערכת לא קיים, יוצר אותו כעת...");
    const now = nowIso();
    const newOrg: OrganizationRecord = {
      id: systemOrgId,
      name: "מערכת CleanPulse",
      slug: "system",
      plan: "enterprise",
      isActive: true,
      status: "active",
      billingStatus: "active",
      createdAt: now,
      updatedAt: now,
    };
    await adapter.create("organizations", newOrg);
    console.log("✅ ארגון המערכת נוצר בהצלחה.");
  } else {
    console.log("🏢 ארגון המערכת כבר קיים.");
  }

  // 2. Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // 3. Check if user already exists
  const users = await adapter.list("users", { includeInactive: true });
  const existingUser = users.find((u) => normalizeEmail(u.email) === email);

  if (existingUser) {
    console.log("⚠️  משתמש עם אימייל זה כבר קיים. מעדכן את הסיסמה וההרשאה שלו...");
    await adapter.update("users", existingUser.id, {
      passwordHash,
      role: "super_admin",
      isActive: true,
      fullName,
      updatedAt: nowIso(),
    });
    console.log("✅ המשתמש עודכן בהצלחה ל-Super Admin.");
  } else {
    console.log("👤 יוצר משתמש סופר-אדמין חדש...");
    const now = nowIso();
    const newUser: UserRecord = {
      id: createPrefixedId("user"),
      organizationId: systemOrgId,
      email,
      fullName,
      passwordHash,
      role: "super_admin",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await adapter.create("users", newUser);
    console.log("✅ משתמש סופר-אדמין נוצר בהצלחה.");
  }
}

main().catch((error) => {
  console.error("❌ יצירת משתמש סופר-אדמין נכשלה:");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
