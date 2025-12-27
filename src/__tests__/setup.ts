import { vi, beforeAll, afterAll, afterEach } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-32chars';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.ADMIN_KEY = 'test-admin-key';
process.env.HUBTEL_API_ID = 'test-api-id';
process.env.HUBTEL_API_KEY = 'test-api-key';
process.env.HUBTEL_POS_SALES_ID = 'test-pos-id';
process.env.HUBTEL_CALLBACK_URL = 'http://localhost:5001/api/webhooks/hubtel';

// Mock console for cleaner test output
beforeAll(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Clear all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

