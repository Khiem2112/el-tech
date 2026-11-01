import { Request } from 'express';
import { z } from 'zod';
import { DomainError } from '../contracts/domain-error.js';

export const parseBody = <TOutput>(
  schema: z.ZodType<TOutput, z.ZodTypeDef, unknown>,
  input: unknown,
): TOutput => {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  throw new DomainError('INVALID_REQUEST', {
    messageKey: 'error.invalidRequest',
    details: { issues: result.error.issues.map((issue) => ({ path: issue.path.join('.'), code: issue.code })) },
  });
};

export const parseQuery = <TOutput>(
  schema: z.ZodType<TOutput, z.ZodTypeDef, unknown>,
  input: unknown,
): TOutput => {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  throw new DomainError('INVALID_QUERY', {
    messageKey: 'error.invalidQuery',
    details: { issues: result.error.issues.map((issue) => ({ path: issue.path.join('.'), code: issue.code })) },
  });
};

export const requireIdempotencyKey = (request: Request): string => {
  const value = request.header('Idempotency-Key')?.trim();
  if (!value) throw new DomainError('IDEMPOTENCY_KEY_REQUIRED', { messageKey: 'error.idempotencyKeyRequired', status: 400 });
  if (value.length > 200) throw new DomainError('INVALID_IDEMPOTENCY_KEY', { messageKey: 'error.invalidRequest', status: 400 });
  return value;
};

export const extractCustomerToken = (request: Request): string | null => {
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      return token;
    }
  }

  const customHeader = request.headers['x-auth-token'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }

  const cookieHeader = request.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith('customer_token=')) {
        return decodeURIComponent(cookie.substring('customer_token='.length).trim());
      }
    }
  }

  return null;
};
