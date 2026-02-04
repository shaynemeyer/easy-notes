import { describe, it, expect, vi } from 'vitest';

// Mock the db module with factory functions
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(),
  query: vi.fn(),
  get: vi.fn(),
  run: vi.fn(),
}));

// Import after mocking
import { query, get, run } from '@/lib/db';

// Get mock functions
const mockQuery = query as ReturnType<typeof vi.fn>;
const mockGet = get as ReturnType<typeof vi.fn>;
const mockRun = run as ReturnType<typeof vi.fn>;

describe('db.ts - Wrapper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('query', () => {
    it('should execute query and return all rows', () => {
      const mockResults = [
        { id: 1, name: 'test1' },
        { id: 2, name: 'test2' },
      ];
      mockQuery.mockReturnValue(mockResults);

      const results = query('SELECT * FROM test_table', []);

      expect(results).toEqual(mockResults);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM test_table', []);
    });

    it('should handle parameters', () => {
      mockQuery.mockReturnValue([{ id: 1 }]);

      query('SELECT * FROM test_table WHERE id = ?', [1]);

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM test_table WHERE id = ?', [1]);
    });
  });

  describe('get', () => {
    it('should return single row', () => {
      const mockRow = { id: 1, name: 'test1' };
      mockGet.mockReturnValue(mockRow);

      const result = get('SELECT * FROM test_table WHERE id = ?', [1]);

      expect(result).toEqual(mockRow);
      expect(mockGet).toHaveBeenCalledWith('SELECT * FROM test_table WHERE id = ?', [1]);
    });

    it('should return undefined when no row found', () => {
      mockGet.mockReturnValue(undefined);

      const result = get('SELECT * FROM test_table WHERE id = ?', [999]);

      expect(result).toBeUndefined();
    });
  });

  describe('run', () => {
    it('should execute INSERT/UPDATE/DELETE statements', () => {
      const mockResult = { changes: 1, lastInsertRowid: 5 };
      mockRun.mockReturnValue(mockResult);

      const result = run('INSERT INTO test_table (name) VALUES (?)', ['test']);

      expect(result).toEqual(mockResult);
      expect(mockRun).toHaveBeenCalledWith('INSERT INTO test_table (name) VALUES (?)', ['test']);
    });

    it('should handle DELETE operations', () => {
      mockRun.mockReturnValue({ changes: 1 });

      run('DELETE FROM test_table WHERE id = ?', [1]);

      expect(mockRun).toHaveBeenCalledWith('DELETE FROM test_table WHERE id = ?', [1]);
    });
  });
});
