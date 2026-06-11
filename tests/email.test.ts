/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { renderIncidentEmail } from '@/lib/email/render-incident-email';

describe('Email HTML Escaping', () => {
  it('escapes HTML tags in dynamic values', () => {
    const maliciousInput = '<script>alert(1)</script>';
    const result = renderIncidentEmail({
      incident: {
        id: "inc1",
        openedAt: "2026-01-01T10:00:00Z",
        source: "kiosk",
        rating: null,
        customerNote: `<img src=x onerror=alert('xss')>`,
      } as any,
      branchName: maliciousInput,
      restroomName: "Safe Restroom",
      screenName: "Safe Screen",
      issueLabel: maliciousInput,
      adminUrl: "https://example.com/admin/incidents/inc1"
    });

    expect(result.html).not.toContain('<script>');
    expect(result.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(result.html).not.toContain('<img src=x onerror=alert(');
    expect(result.html).toContain('&lt;img src=x onerror=alert(&#039;xss&#039;)&gt;');
  });
});
