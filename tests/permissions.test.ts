import { describe, it, expect } from 'vitest';
import { canViewReports } from '@/lib/auth/permissions';
import type { UserRole } from '@/types/domain';

describe('Permissions', () => {
  it('canViewReports allows owner, admin, manager', () => {
    expect(canViewReports({ role: 'owner' as UserRole })).toBe(true);
    expect(canViewReports({ role: 'admin' as UserRole })).toBe(true);
    expect(canViewReports({ role: 'manager' as UserRole })).toBe(true);
  });

  it('canViewReports forbids cleaner', () => {
    expect(canViewReports({ role: 'cleaner' as UserRole })).toBe(false);
  });
});
