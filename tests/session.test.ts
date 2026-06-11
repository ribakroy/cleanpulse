/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

process.env.AUTH_SECRET = 'test-secret';

import { getCurrentUser } from '@/lib/auth/session';
import * as usersRepo from '@/lib/data/repositories/users';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    cache: vi.fn((fn) => fn),
  };
});

const mockCookieStore = new Map();
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name) => ({ value: mockCookieStore.get(name) })),
    set: vi.fn((name, val) => mockCookieStore.set(name, val))
  }))
}));

vi.mock('@/lib/data/repositories/users', () => ({
  getUserById: vi.fn()
}));

import { createSessionCookie } from '@/lib/auth/session';

describe('Session Rehydration', () => {
  beforeEach(async () => {
    mockCookieStore.clear();
    await createSessionCookie({
      id: 'u1',
      organizationId: 'o1',
      email: 'test@test.com',
      fullName: 'Test User',
      role: 'owner'
    });
  });
  it('returns null if user is not found in db', async () => {
    vi.mocked(usersRepo.getUserById).mockResolvedValue(null);
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it('returns null if user is inactive in db', async () => {
    vi.mocked(usersRepo.getUserById).mockResolvedValue({ isActive: false } as any);
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it('returns updated user from db with correct role', async () => {
    vi.mocked(usersRepo.getUserById).mockResolvedValue({ 
      id: 'u1', 
      isActive: true, 
      role: 'cleaner' // Downgraded in DB
    } as any);
    const user = await getCurrentUser();
    expect(user?.role).toBe('cleaner');
  });
});
