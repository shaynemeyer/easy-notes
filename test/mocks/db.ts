import { vi } from 'vitest';

export const mockDb = {
  query: vi.fn(),
  get: vi.fn(),
  run: vi.fn(),
};

export function resetDbMocks() {
  mockDb.query.mockReset();
  mockDb.get.mockReset();
  mockDb.run.mockReset();
}
