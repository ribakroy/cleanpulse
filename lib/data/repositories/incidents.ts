import { DataLayerError } from "@/lib/data/errors";
import { getDataAdapter } from "@/lib/data/get-data-adapter";
import {
  assertDefined,
  createPrefixedId,
  ensureOrganizationOwnership,
  nowIso,
} from "@/lib/data/repositories/_shared";
import { getBranchById } from "@/lib/data/repositories/branches";
import { getIssueTypeByKey } from "@/lib/data/repositories/issue-types";
import { assertRestroomBelongsToBranch } from "@/lib/data/repositories/restrooms";
import { assertScreenMatchesRestroom } from "@/lib/data/repositories/screens";
import { assertUserInOrganization } from "@/lib/data/repositories/users";
import type { IncidentRecord, QueryFilter } from "@/lib/data/types";
import type { IncidentPriority, IncidentSource, IncidentStatus, IssueTypeKey } from "@/types/domain";

const RESET_RESOLUTION_NOTE = "נסגר בעקבות איפוס מצב השירותים.";
const activeIncidentStatuses = new Set<IncidentStatus>(["open", "acknowledged", "in_progress"]);

export type CreateIncidentInput = {
  organizationId: string;
  branchId: string;
  restroomId: string;
  screenId: string;
  issueKey?: IssueTypeKey | null | undefined;
  rating?: 1 | 2 | 3 | 4 | 5 | null | undefined;
  priority?: IncidentPriority | undefined;
  customerNote?: string | null | undefined;
  source: IncidentSource;
};

export type UpdateIncidentStatusInput = {
  organizationId: string;
  incidentId: string;
  status: IncidentStatus;
  actorUserId?: string | null | undefined;
  assignedToUserId?: string | null | undefined;
  resolvedByUserId?: string | null | undefined;
  resolutionNote?: string | null | undefined;
};

export type ResetOpenIncidentsInput = {
  organizationId: string;
  actorUserId: string;
  resetAt?: string | undefined;
  resolutionNote?: string | undefined;
};

export type ResetRestroomIncidentsInput = ResetOpenIncidentsInput & {
  restroomId: string;
};

export type ResetOpenIncidentsResult = {
  resetAt: string;
  closedCount: number;
  closedIncidentIds: string[];
};

function derivePriority(issueSeverity?: IncidentPriority, rating?: number | null) {
  if (issueSeverity) {
    return issueSeverity;
  }

  if (rating && rating <= 2) {
    return "medium";
  }

  return "low";
}

function validateIncidentInput(input: CreateIncidentInput) {
  if (!input.issueKey && !input.rating) {
    throw new DataLayerError("INCIDENT_INPUT_INVALID", "Incident requires either issueKey or rating.");
  }

  if (input.issueKey && input.rating) {
    throw new DataLayerError("INCIDENT_INPUT_INVALID", "Incident cannot contain both issueKey and rating together.");
  }

  if (input.rating && (input.rating < 1 || input.rating > 5)) {
    throw new DataLayerError("INCIDENT_RATING_INVALID", "Rating incidents must be between 1 and 5.");
  }
}

export async function createIncident(input: CreateIncidentInput) {
  validateIncidentInput(input);

  const branch = assertDefined(
    await getBranchById(input.organizationId, input.branchId),
    `Branch "${input.branchId}" was not found.`,
  );

  const restroom = await assertRestroomBelongsToBranch(input.organizationId, input.restroomId, input.branchId);
  const screen = await assertScreenMatchesRestroom(input.organizationId, input.screenId, input.restroomId);

  if (screen.branchId !== branch.id) {
    throw new DataLayerError("SCREEN_BRANCH_MISMATCH", `Screen "${screen.id}" does not belong to branch "${branch.id}".`);
  }

  const issueType = input.issueKey ? await getIssueTypeByKey(input.issueKey) : null;

  if (input.issueKey && !issueType) {
    throw new DataLayerError("ISSUE_TYPE_NOT_FOUND", `Issue type "${input.issueKey}" was not found.`);
  }

  const createdAt = nowIso();
  const incidentRecord: IncidentRecord = {
    id: createPrefixedId("incident"),
    organizationId: input.organizationId,
    branchId: branch.id,
    restroomId: restroom.id,
    screenId: screen.id,
    issueTypeId: issueType?.id ?? null,
    issueKey: input.issueKey ?? null,
    rating: input.rating ?? null,
    status: "open",
    priority: input.priority ?? derivePriority(issueType?.severity, input.rating),
    customerNote: input.customerNote ?? null,
    openedAt: createdAt,
    acknowledgedAt: null,
    inProgressAt: null,
    resolvedAt: null,
    dismissedAt: null,
    assignedToUserId: null,
    resolvedByUserId: null,
    resolutionNote: null,
    source: input.source,
    createdAt,
    updatedAt: createdAt,
  };

  return getDataAdapter().create("incidents", incidentRecord);
}

export async function getIncidentById(organizationId: string, incidentId: string) {
  return ensureOrganizationOwnership("incidents", organizationId, await getDataAdapter().get("incidents", incidentId));
}

export async function listIncidentsByOrganization(
  organizationId: string,
  filters?: Omit<QueryFilter<"incidents">, "organizationId">,
) {
  return getDataAdapter().query("incidents", {
    ...filters,
    organizationId,
    sortBy: filters?.sortBy ?? "createdAt",
    sortDirection: filters?.sortDirection ?? "desc",
  });
}

export async function updateIncidentStatus(input: UpdateIncidentStatusInput) {
  const incident = assertDefined(
    await getIncidentById(input.organizationId, input.incidentId),
    `Incident "${input.incidentId}" was not found.`,
  );

  if (input.actorUserId) {
    await assertUserInOrganization(input.organizationId, input.actorUserId);
  }

  if (input.assignedToUserId) {
    await assertUserInOrganization(input.organizationId, input.assignedToUserId);
  }

  if (input.resolvedByUserId) {
    await assertUserInOrganization(input.organizationId, input.resolvedByUserId);
  }

  const timestamp = nowIso();
  const patch: Partial<IncidentRecord> = {
    status: input.status,
  };

  if (typeof input.assignedToUserId !== "undefined") {
    patch.assignedToUserId = input.assignedToUserId;
  }

  if (typeof input.resolutionNote !== "undefined") {
    patch.resolutionNote = input.resolutionNote;
  }

  if (input.status === "acknowledged" && !incident.acknowledgedAt) {
    patch.acknowledgedAt = timestamp;
  }

  if (input.status === "in_progress" && !incident.inProgressAt) {
    patch.inProgressAt = timestamp;
  }

  if (input.status === "resolved") {
    patch.resolvedAt = timestamp;
    patch.resolvedByUserId = input.resolvedByUserId ?? input.actorUserId ?? incident.resolvedByUserId;
  }

  if (input.status === "dismissed") {
    patch.dismissedAt = timestamp;
  }

  return getDataAdapter().update("incidents", incident.id, patch);
}

function isOpenBeforeReset(incident: IncidentRecord, resetAt: string) {
  if (!activeIncidentStatuses.has(incident.status)) {
    return false;
  }

  const openedAt = new Date(incident.openedAt).getTime();
  const resetTime = new Date(resetAt).getTime();

  if (Number.isNaN(openedAt) || Number.isNaN(resetTime)) {
    return false;
  }

  return openedAt <= resetTime;
}

async function resolveOpenIncidents(input: ResetOpenIncidentsInput & { restroomId?: string | undefined }) {
  await assertUserInOrganization(input.organizationId, input.actorUserId);

  const resetAt = input.resetAt ?? nowIso();
  const incidents = await listIncidentsByOrganization(input.organizationId, {
    includeInactive: true,
    restroomId: input.restroomId,
    sortBy: "openedAt",
    sortDirection: "asc",
  });

  const incidentsToClose = incidents.filter((incident) => isOpenBeforeReset(incident, resetAt));
  const resolutionNote = input.resolutionNote ?? RESET_RESOLUTION_NOTE;

  const closedIncidents = await Promise.all(
    incidentsToClose.map((incident) =>
      getDataAdapter().update("incidents", incident.id, {
        status: "resolved",
        resolvedAt: resetAt,
        resolvedByUserId: input.actorUserId,
        resolutionNote,
      }),
    ),
  );

  return {
    resetAt,
    closedCount: closedIncidents.length,
    closedIncidentIds: closedIncidents.map((incident) => incident.id),
  } satisfies ResetOpenIncidentsResult;
}

export async function resolveOpenIncidentsForRestroom(input: ResetRestroomIncidentsInput) {
  return resolveOpenIncidents(input);
}

export async function resolveOpenIncidentsForOrganization(input: ResetOpenIncidentsInput) {
  return resolveOpenIncidents(input);
}
