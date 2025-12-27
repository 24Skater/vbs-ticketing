import { describe, it, expect } from 'vitest';
import { ZodError, z } from 'zod';
import { errorHandler, notFoundHandler, AppError, Errors } from '../errorHandler.middleware';
import { 
  createMockRequest, 
  createMockResponse, 
  createMockNext 
} from '../../__tests__/helpers';

describe('Error Handler Middleware', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      // AppError constructor: (statusCode, message, code?, details?)
      const error = new AppError(400, 'Test error', 'TEST_ERROR');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.isOperational).toBe(true);
    });

    it('should be an instance of Error', () => {
      const error = new AppError(400, 'Test');
      expect(error).toBeInstanceOf(Error);
    });

    it('should default code to ERROR', () => {
      const error = new AppError(500, 'Something went wrong');
      expect(error.code).toBe('ERROR');
    });
  });

  describe('Errors factory', () => {
    it('should create badRequest error', () => {
      const error = Errors.badRequest('Invalid input');
      
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('Invalid input');
    });

    it('should create unauthorized error', () => {
      const error = Errors.unauthorized();
      
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should create forbidden error', () => {
      const error = Errors.forbidden();
      
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should create notFound error', () => {
      const error = Errors.notFound('User');
      
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('User');
    });

    it('should create internal error', () => {
      const error = Errors.internal();
      
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('errorHandler', () => {
    it('should handle AppError', () => {
      const error = new AppError(422, 'Custom error', 'CUSTOM');
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Custom error',
          code: 'CUSTOM',
        })
      );
    });

    it('should handle ZodError', () => {
      const schema = z.object({ name: z.string() });
      let zodError: ZodError | undefined;
      
      try {
        schema.parse({ name: 123 });
      } catch (e) {
        zodError = e as ZodError;
      }

      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      if (zodError) {
        errorHandler(zodError, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'VALIDATION_ERROR',
          })
        );
      }
    });

    it('should handle generic Error', () => {
      const error = new Error('Something went wrong');
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 for unknown routes', () => {
      const req = createMockRequest({ 
        method: 'GET',
        originalUrl: '/unknown/path',
      });
      const res = createMockResponse();
      const next = createMockNext();

      notFoundHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'ROUTE_NOT_FOUND',
        })
      );
    });
  });
});
