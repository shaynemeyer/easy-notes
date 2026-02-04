import { vi } from 'vitest';
import { createMockUser } from '../helpers/test-fixtures';

export const mockGetCurrentUser = vi.fn();
export const mockRequireAuth = vi.fn();

export function setupAuthMock(authenticated = true) {
  const user = authenticated ? createMockUser() : null;
  mockGetCurrentUser.mockResolvedValue(user);
  mockRequireAuth.mockResolvedValue(
    user ||
      (() => {
        throw new Error('Unauthorized');
      })(),
  );
}

export function resetAuthMocks() {
  mockGetCurrentUser.mockReset();
  mockRequireAuth.mockReset();
}
