import { vi } from 'vitest';

export const mockRedirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT: ${url}`);
});

export const mockHeaders = vi.fn(() => ({
  get: vi.fn(),
}));

export function resetNextMocks() {
  mockRedirect.mockReset();
  mockHeaders.mockReset();
}
