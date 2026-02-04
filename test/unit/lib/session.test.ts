import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockUser } from '../../helpers/test-fixtures';

// Mock dependencies before importing - use factory functions
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Import after mocking
import {
  getCurrentUser,
  requireAuth,
  protectRoute,
  protectLayout,
  isValidCallbackUrl,
} from '@/lib/session';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

// Get mock functions from the modules
const mockGetSession = auth.api.getSession as ReturnType<typeof vi.fn>;
const mockHeaders = headers as unknown as ReturnType<typeof vi.fn>;
const mockRedirect = redirect as unknown as ReturnType<typeof vi.fn>;

describe('session.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockResolvedValue({});
  });

  describe('getCurrentUser', () => {
    it('should return user when session exists', async () => {
      const mockUser = createMockUser();
      mockGetSession.mockResolvedValue({ user: mockUser });

      const user = await getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(mockGetSession).toHaveBeenCalledWith({ headers: {} });
    });

    it('should return null when no session', async () => {
      mockGetSession.mockResolvedValue(null);

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });

    it('should return null when session exists but no user', async () => {
      mockGetSession.mockResolvedValue({ user: null });

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      const mockUser = createMockUser();
      mockGetSession.mockResolvedValue({ user: mockUser });

      const user = await requireAuth();

      expect(user).toEqual(mockUser);
    });

    it('should throw error when not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow('Unauthorized');
    });
  });

  describe('protectRoute', () => {
    it('should return user when authenticated', async () => {
      const mockUser = createMockUser();
      mockGetSession.mockResolvedValue({ user: mockUser });

      const user = await protectRoute('/dashboard');

      expect(user).toEqual(mockUser);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should redirect to authenticate when not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);
      mockRedirect.mockImplementation((url: string) => {
        throw new Error(`NEXT_REDIRECT: ${url}`);
      });

      await expect(protectRoute('/dashboard')).rejects.toThrow(
        'NEXT_REDIRECT: /authenticate?callbackUrl=%2Fdashboard',
      );
      expect(mockRedirect).toHaveBeenCalledWith('/authenticate?callbackUrl=%2Fdashboard');
    });

    it('should encode callback URL properly', async () => {
      mockGetSession.mockResolvedValue(null);
      mockRedirect.mockImplementation((url: string) => {
        throw new Error(`NEXT_REDIRECT: ${url}`);
      });

      await expect(protectRoute('/notes/123?edit=true')).rejects.toThrow();
      expect(mockRedirect).toHaveBeenCalledWith(
        '/authenticate?callbackUrl=%2Fnotes%2F123%3Fedit%3Dtrue',
      );
    });
  });

  describe('protectLayout', () => {
    it('should return user when authenticated', async () => {
      const mockUser = createMockUser();
      mockGetSession.mockResolvedValue({ user: mockUser });

      const user = await protectLayout();

      expect(user).toEqual(mockUser);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should redirect to authenticate when not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);
      mockRedirect.mockImplementation((url: string) => {
        throw new Error(`NEXT_REDIRECT: ${url}`);
      });

      await expect(protectLayout()).rejects.toThrow('NEXT_REDIRECT: /authenticate');
      expect(mockRedirect).toHaveBeenCalledWith('/authenticate');
    });
  });

  describe('isValidCallbackUrl', () => {
    it('should allow valid relative URLs', () => {
      expect(isValidCallbackUrl('/dashboard')).toBe(true);
      expect(isValidCallbackUrl('/notes/123')).toBe(true);
      expect(isValidCallbackUrl('/notes/123?edit=true')).toBe(true);
      expect(isValidCallbackUrl('/notes/123#section')).toBe(true);
    });

    it('should reject protocol-relative URLs (security check)', () => {
      expect(isValidCallbackUrl('//evil.com')).toBe(false);
      expect(isValidCallbackUrl('//evil.com/phishing')).toBe(false);
    });

    it('should reject absolute URLs (security check)', () => {
      expect(isValidCallbackUrl('https://evil.com')).toBe(false);
      expect(isValidCallbackUrl('http://evil.com')).toBe(false);
      expect(isValidCallbackUrl('ftp://evil.com')).toBe(false);
    });

    it('should reject non-slash URLs (security check)', () => {
      expect(isValidCallbackUrl('javascript:alert(1)')).toBe(false);
      expect(isValidCallbackUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isValidCallbackUrl('evil.com')).toBe(false);
      expect(isValidCallbackUrl('mailto:test@example.com')).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(isValidCallbackUrl('')).toBe(false);
    });
  });
});
