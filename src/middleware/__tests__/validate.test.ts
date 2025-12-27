import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validate } from '../validate.middleware';
import { 
  createMockRequest, 
  createMockResponse, 
  createMockNext 
} from '../../__tests__/helpers';

describe('Validate Middleware', () => {
  const testSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    age: z.number().int().positive().optional(),
  });

  describe('body validation', () => {
    it('should pass valid data and call next', async () => {
      const req = createMockRequest({
        body: { name: 'John', email: 'john@example.com' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = validate(testSchema);
      await middleware(req, res, next);

      // When valid, next should be called without error
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should respond with 400 for invalid data', async () => {
      const req = createMockRequest({
        body: { name: 'J', email: 'invalid-email' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = validate(testSchema);
      await middleware(req, res, next);

      // Middleware responds directly, doesn't call next
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'VALIDATION_ERROR',
        })
      );
    });

    it('should respond with 400 for missing required fields', async () => {
      const req = createMockRequest({
        body: { name: 'John' }, // missing email
      });
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = validate(testSchema);
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'VALIDATION_ERROR',
        })
      );
    });
  });

  describe('query validation', () => {
    const querySchema = z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
    });

    it('should validate and transform query params', async () => {
      const req = createMockRequest({
        query: { page: '2', limit: '20' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = validate(querySchema, 'query');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      // Check that query was transformed
      expect(req.query.page).toBe(2);
      expect(req.query.limit).toBe(20);
    });
  });

  describe('params validation', () => {
    const paramsSchema = z.object({
      id: z.string().min(1),
    });

    it('should validate route params', async () => {
      const req = createMockRequest({
        params: { id: 'ticket-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = validate(paramsSchema, 'params');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
