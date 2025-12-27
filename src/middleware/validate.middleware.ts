import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Request source for validation
 */
type ValidationSource = 'body' | 'query' | 'params';

/**
 * Format Zod errors into a user-friendly structure
 */
function formatZodErrors(error: ZodError) {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Validation middleware factory
 * 
 * @param schema - Zod schema to validate against
 * @param source - Where to get data from (body, query, params)
 * @returns Express middleware function
 * 
 * @example
 * router.post('/users', validate(createUserSchema), createUser);
 * router.get('/users', validate(querySchema, 'query'), getUsers);
 */
export function validate(schema: ZodSchema, source: ValidationSource = 'body') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse and transform the data
      const parsed = await schema.parseAsync(req[source]);
      
      // Replace request data with parsed/transformed data
      // This ensures downstream handlers receive clean, typed data
      req[source] = parsed;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: formatZodErrors(error),
        });
        return;
      }
      
      // Unexpected error, pass to error handler
      next(error);
    }
  };
}

/**
 * Validate multiple sources at once
 * 
 * @example
 * router.put('/users/:id', validateMultiple({
 *   params: paramsSchema,
 *   body: updateUserSchema,
 * }), updateUser);
 */
export function validateMultiple(schemas: Partial<Record<ValidationSource, ZodSchema>>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors: Array<{ source: string; details: ReturnType<typeof formatZodErrors> }> = [];
      
      for (const [source, schema] of Object.entries(schemas)) {
        if (schema) {
          try {
            const parsed = await schema.parseAsync(req[source as ValidationSource]);
            req[source as ValidationSource] = parsed;
          } catch (error) {
            if (error instanceof ZodError) {
              errors.push({
                source,
                details: formatZodErrors(error),
              });
            } else {
              throw error;
            }
          }
        }
      }
      
      if (errors.length > 0) {
        res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors,
        });
        return;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Validate request body with custom error handler
 */
export function validateBody<T>(
  schema: ZodSchema<T>,
  onError?: (error: ZodError, req: Request, res: Response) => void
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        if (onError) {
          onError(error, req, res);
        } else {
          res.status(400).json({
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: formatZodErrors(error),
          });
        }
        return;
      }
      next(error);
    }
  };
}

/**
 * Validate query parameters
 */
export function validateQuery(schema: ZodSchema) {
  return validate(schema, 'query');
}

/**
 * Validate URL parameters
 */
export function validateParams(schema: ZodSchema) {
  return validate(schema, 'params');
}

