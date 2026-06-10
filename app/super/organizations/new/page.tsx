import { CreateOrgForm } from "@/components/super/create-org-form";

export const metadata = {
  title: "הקמת עסק חדש | CleanPulse Owner Console",
  description: "הקמת ארגון חדש ויצירת מנהל ראשי במערכת",
};

export default function SuperNewOrganizationPage() {
  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">הקמת עסק חדש</h1>
        <p className="text-sm text-muted mt-1">
          הגדרת ארגון חדש במערכת, קביעת תוכנית מנוי ויצירת המשתמש הראשי שינהל אותו.
        </p>
      </div>

      {/* Form Container */}
      <CreateOrgForm />
    </div>
  );
}
