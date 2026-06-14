import { getDataAdapter } from "@/lib/data/get-data-adapter";
import { createPrefixedId, nowIso } from "@/lib/data/repositories/_shared";
import type { ContactLeadRecord, ContactLeadStatus } from "@/lib/data/types";

export const contactLeadStatuses = [
  "new",
  "contacted",
  "qualified",
  "demo_scheduled",
  "won",
  "lost",
] as const satisfies readonly ContactLeadStatus[];

export type CreateContactLeadInput = {
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  branchesCount: number | null;
  message?: string | undefined;
};

export async function listContactLeads() {
  return getDataAdapter().list("contact_leads", {
    includeInactive: true,
    sortBy: "createdAt",
    sortDirection: "desc",
  });
}

export async function createContactLead(input: CreateContactLeadInput): Promise<ContactLeadRecord> {
  const timestamp = nowIso();
  const record: ContactLeadRecord = {
    id: createPrefixedId("contact_lead"),
    firstName: input.firstName,
    lastName: input.lastName,
    company: input.company,
    phone: input.phone,
    email: input.email,
    branchesCount: input.branchesCount,
    message: input.message,
    source: "homepage_contact_form",
    status: "new",
    notes: "",
    lastStatusChangedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return getDataAdapter().create("contact_leads", record);
}

export async function updateContactLead(
  id: string,
  patch: Partial<Pick<ContactLeadRecord, "status" | "notes">>,
): Promise<ContactLeadRecord> {
  const nextPatch: Partial<Pick<ContactLeadRecord, "status" | "notes" | "lastStatusChangedAt">> = { ...patch };

  if (patch.status) {
    nextPatch.lastStatusChangedAt = nowIso();
  }

  return getDataAdapter().update("contact_leads", id, nextPatch);
}
