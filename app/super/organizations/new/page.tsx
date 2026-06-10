import { CreateOrgForm } from "@/components/super/create-org-form";

export const metadata = {
  title: "הקמת עסק חדש | CleanPulse",
  description: "הקמת עסק חדש ויצירת מנהל ראשי",
};

export default function SuperNewOrganizationPage() {
  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">הקמת עסק חדש</h1>
        <p className="text-sm text-muted mt-1">
          פרטי עסק, איש קשר, תוכנית ומשתמש ראשון.
        </p>
      </div>

      {/* Form Container */}
      <CreateOrgForm />
    </div>
  );
}
