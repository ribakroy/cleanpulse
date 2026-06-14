"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/session";
import { contactLeadStatuses, updateContactLead } from "@/lib/data/repositories/contact-leads";
import type { ContactLeadStatus } from "@/lib/data/types";

export async function updateContactLeadStatusAction(formData: FormData) {
  await requireSuperAdmin();

  const id = formData.get("id")?.toString() ?? "";
  const status = formData.get("status")?.toString() as ContactLeadStatus;
  const notes = formData.get("notes")?.toString().trim().slice(0, 1200) ?? "";

  if (!id || !contactLeadStatuses.includes(status)) {
    throw new Error("פרטי ליד לא תקינים");
  }

  await updateContactLead(id, { status, notes });
  revalidatePath("/super/leads");
  revalidatePath("/super/dashboard");
}
