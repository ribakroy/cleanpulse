/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
// Exporting the function for testing purposes
// We'll test it implicitly via the main generate function, or we can export escapeCsvValue 
// Since escapeCsvValue is not exported, we can test generateIncidentsCsv with malicious input.
import { generateIncidentsCsv } from '@/lib/reports/csv';

describe('CSV Escaping', () => {
  it('escapes formulas to prevent injection', () => {
    const maliciousIncident = {
      id: "inc-1",
      organizationId: "org-1",
      branchId: "b1",
      restroomId: "r1",
      screenId: "s1",
      issueTypeIds: ["i1"],
      status: "open",
      openedAt: "2026-01-01T10:00:00Z",
      source: "kiosk",
      customerNote: "=HYPERLINK(\"http://evil.com\")", // malicious
      resolutionNote: "+1+1",
      rating: null,
      customIssueLabel: "-alert(1)",
    } as any;

    const result = generateIncidentsCsv(
      [maliciousIncident],
      [], [], [], [], []
    );

    // The output should contain single quotes prepended to the formulas
    expect(result).toContain("'=HYPERLINK(\"\"http://evil.com\"\")");
    expect(result).toContain("'+1+1");
  });
});
