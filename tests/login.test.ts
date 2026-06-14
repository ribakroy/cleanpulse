/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginAction } from '@/app/(public)/login/actions';
import * as bcrypt from 'bcrypt';
import * as usersRepo from '@/lib/data/repositories/users';
import * as sessionRepo from '@/lib/auth/session';
import { DataLayerError } from '@/lib/data/errors';
import { redirect } from 'next/navigation';

const mockCompare = vi.fn();
vi.mock('bcrypt', () => ({
  compare: (...args: any[]) => mockCompare(...args),
  default: {
    compare: (...args: any[]) => mockCompare(...args),
  }
}));

vi.mock('@/lib/data/repositories/users', () => ({
  getUserByEmailForAuth: vi.fn(),
  normalizeEmail: vi.fn((e) => e),
}));

vi.mock('@/lib/data/repositories/_shared', () => ({
  normalizeEmail: vi.fn((e) => e),
}));

vi.mock('@/lib/auth/session', () => ({
  createSessionCookie: vi.fn(),
}));

vi.mock('@/lib/shifts/detect-shift', () => ({
  detectOrUpdateShiftFromActivity: vi.fn(async () => ({
    id: 'detected_shift_1',
    status: 'needs_completion',
  })),
}));

vi.mock('@/lib/data/repositories/activity-logs', () => ({
  createActivityLog: vi.fn(async () => ({ id: 'activity_log_1' })),
}));

vi.mock('@/lib/data/repositories/detected-shifts', () => ({
  attachActivityLogToDetectedShift: vi.fn(async () => ({})),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Login Rate Limit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  const getFormData = (email: string, password: string) => {
    const fd = new FormData();
    fd.append('email', email);
    fd.append('password', password);
    return fd;
  };

  it('locks out after 5 failed attempts and resets on success', async () => {
    const email = 'test@demo.local';
    const genericError = "פרטי ההתחברות אינם תקינים.";
    
    vi.mocked(usersRepo.getUserByEmailForAuth).mockResolvedValue({
      id: 'u1',
      email,
      isActive: true,
      passwordHash: 'hash',
      role: 'owner',
    } as any);

    mockCompare.mockResolvedValue(false);

    const initialState = { email: '', error: null };

    // 5 failed attempts
    for (let i = 0; i < 5; i++) {
      const res = await loginAction(initialState, getFormData(email, 'wrong'));
      expect(res.error).toBe(genericError);
    }

    // 6th attempt should hit rate limit
    const res6 = await loginAction(initialState, getFormData(email, 'wrong'));
    expect(res6.error).toContain('יותר מדי ניסיונות');

    // Wait 10 minutes
    vi.advanceTimersByTime(10 * 60 * 1000 + 1000);

    // 7th attempt should give generic error again
    const res7 = await loginAction(initialState, getFormData(email, 'wrong'));
    expect(res7.error).toBe(genericError);

    // Now let's succeed
    mockCompare.mockResolvedValue(true);
    await loginAction(initialState, getFormData(email, 'correct'));

    mockCompare.mockResolvedValue(false);
    const resAfterSuccess = await loginAction(initialState, getFormData(email, 'wrong'));
    expect(resAfterSuccess.error).toBe(genericError);
  });

  it.each([
    ['super_admin', '/super/dashboard'],
    ['owner', '/admin/dashboard'],
    ['admin', '/admin/dashboard'],
    ['area_manager', '/admin/dashboard'],
    ['manager', '/admin/dashboard'],
    ['operations_worker', '/work'],
    ['cleaner', '/work'],
  ])('redirects %s to %s after login', async (role, expectedPath) => {
    const email = `${role}@demo.local`;
    vi.mocked(usersRepo.getUserByEmailForAuth).mockResolvedValue({
      id: `user_${role}`,
      organizationId: 'org_1',
      email,
      isActive: true,
      passwordHash: 'hash',
      role,
    } as any);
    mockCompare.mockResolvedValue(true);

    await loginAction({ email: '', error: null }, getFormData(email, 'correct'));

    expect(redirect).toHaveBeenCalledWith(expectedPath);
  });

  it('returns a clean error when the data repository is unavailable', async () => {
    vi.mocked(usersRepo.getUserByEmailForAuth).mockRejectedValue(
      new DataLayerError('GITHUB_BRANCH_READ_FAILED', 'GitHub rate limit exceeded'),
    );

    const res = await loginAction({ email: '', error: null }, getFormData('owner@demo.local', 'correct'));

    expect(res).toEqual({
      email: 'owner@demo.local',
      error: 'שירות הנתונים זמנית לא זמין. נסה שוב בעוד כמה דקות.',
    });
    expect(sessionRepo.createSessionCookie).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});
