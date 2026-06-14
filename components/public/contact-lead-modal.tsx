import { Mail, X } from "lucide-react";
import { createContactLeadAction } from "@/app/actions/contact-leads";

const fields = [
  { id: "firstName", label: "שם פרטי", type: "text" },
  { id: "lastName", label: "משפחה", type: "text" },
  { id: "company", label: "חברה", type: "text" },
  { id: "phone", label: "טלפון", type: "tel" },
  { id: "email", label: "מייל", type: "email" },
  { id: "branches", label: "כמות סניפים", type: "number" },
];

export function ContactLeadModal() {
  return (
    <a
      href="#cleanpulse-contact-form"
      className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-extrabold text-brand-deep shadow-[0_20px_48px_rgba(255,255,255,0.14)] hover:bg-[#f4faff]"
    >
      <Mail className="size-5" aria-hidden="true" />
      דברו איתנו
    </a>
  );
}

export function ContactLeadFormModal() {
  return (
    <div id="cleanpulse-contact-form" className="contact-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
      <div className="contact-modal">
        <a href="#contact" className="contact-modal-close" aria-label="סגירת טופס">
          <X className="size-5" aria-hidden="true" />
        </a>

        <div className="space-y-3">
          <p className="section-label">צור קשר</p>
          <h3 id="contact-modal-title" className="font-heading text-2xl font-extrabold leading-tight text-brand-deep sm:text-4xl">
            נשמח להבין מה המקום שלכם צריך.
          </h3>
          <p className="text-base font-bold leading-7 text-muted">השאירו פרטים ונחזור אליכם עם התאמה קצרה וברורה.</p>
        </div>

        <form className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4" action={createContactLeadAction}>
          {fields.map((field) => (
            <label key={field.id} className="contact-field">
              <span>{field.label}</span>
              <input name={field.id} type={field.type} min={field.type === "number" ? 1 : undefined} required />
            </label>
          ))}

          <label className="contact-field sm:col-span-2">
            <span>הערה קצרה</span>
            <textarea name="message" rows={3} placeholder="מה חשוב לדעת לפני שיחה?" />
          </label>

          <button type="submit" className="contact-submit sm:col-span-2">
            שליחה
          </button>
        </form>
      </div>
    </div>
  );
}
