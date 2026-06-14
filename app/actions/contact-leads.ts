"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createContactLead } from "@/lib/data/repositories/contact-leads";

function readField(formData: FormData, key: string, maxLength: number) {
  return formData.get(key)?.toString().trim().slice(0, maxLength) ?? "";
}

export async function createContactLeadAction(formData: FormData) {
  const firstName = readField(formData, "firstName", 80);
  const lastName = readField(formData, "lastName", 80);
  const company = readField(formData, "company", 120);
  const phone = readField(formData, "phone", 60);
  const email = readField(formData, "email", 140).toLowerCase();
  const branchesRaw = readField(formData, "branches", 10);
  const branchesNumber = Number(branchesRaw);
  const message = readField(formData, "message", 600);

  if (!firstName || !lastName || !company || !phone || !email) {
    redirect("/?contact=missing#cleanpulse-contact-form");
  }

  await createContactLead({
    firstName,
    lastName,
    company,
    phone,
    email,
    branchesCount: Number.isFinite(branchesNumber) && branchesNumber > 0 ? Math.floor(branchesNumber) : null,
    message: message || undefined,
  });

  revalidatePath("/super/leads");
  redirect("/?contact=sent#contact");
}
