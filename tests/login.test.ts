/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginAction } from '@/app/(public)/login/actions';
import * as bcrypt from 'bcrypt';
import * as usersRepo from '@/lib/data/repositories/users';
import * as sessionRepo from '@/lib/auth/session';

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
});
