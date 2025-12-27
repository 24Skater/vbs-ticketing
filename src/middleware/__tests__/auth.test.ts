import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth, optionalAuth, requireRole } from '../auth.middleware';
import { generateAccessToken } from '../../utils/jwt';
import { 
  createMockRequest, 
  createMockResponse, 
  createMockNext 
} from '../../__tests__/helpers';

describe('Auth Middleware', () => {
  const testPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'ADMIN',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should pass with valid token', async () => {
      const token = generateAccessToken(testPayload);
      const req = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      }) as any;
      const res = createMockResponse();
      const next = createMockNext();

      await requireAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.userId).toBe(testPayload.userId);
      expect(req.user.role).toBe(testPayload.role);
    });

    it('should fail without token', async () => {
      const req = createMockRequest() as any;
      const res = createMockResponse();
      const next = createMockNext();

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should fail with invalid token', async () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer invalid-token' },
      }) as any;
      const res = createMockResponse();
      const next = createMockNext();

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should fail with malformed authorization header', async () => {
      const req = createMockRequest({
        headers: { authorization: 'InvalidFormat' },
      }) as any;
      const res = createMockResponse();
      const next = createMockNext();

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('optionalAuth', () => {
    it('should pass and set user with valid token', async () => {
      const token = generateAccessToken(testPayload);
      const req = createMockRequest({
        headers: { authorization: `Bearer ${token}` },
      }) as any;
      const res = createMockResponse();
      const next = createMockNext();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.userId).toBe(testPayload.userId);
    });

    it('should pass without token', async () => {
      const req = createMockRequest() as any;
      const res = createMockResponse();
      const next = createMockNext();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.userId).toBeUndefined();
    });

    it('should pass with invalid token (just ignore)', async () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer invalid' },
      }) as any;
      const res = createMockResponse();
      const next = createMockNext();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should pass with matching role', () => {
      const req = createMockRequest() as any;
      req.user = { userId: testPayload.userId, role: 'ADMIN' };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRole('ADMIN', 'SUPER_ADMIN');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with non-matching role', () => {
      const req = createMockRequest() as any;
      req.user = { userId: testPayload.userId, role: 'CHECKER' };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRole('ADMIN', 'SUPER_ADMIN');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should fail without user', () => {
      const req = createMockRequest() as any;
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRole('ADMIN');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should pass with higher role in hierarchy', () => {
      const req = createMockRequest() as any;
      req.user = { userId: testPayload.userId, role: 'SUPER_ADMIN' };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRole('STAFF');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
