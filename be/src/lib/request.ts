import { Request } from 'express';
import { z } from 'zod';
import { DomainError } from '../contracts/domain-error.js';

export const parseBody = <T>(schema: z.ZodType<T>, input: unknown): T => {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  throw new DomainError('INVALID_REQUEST', {
    messageKey: 'error.invalidRequest',
    details: { issues: result.error.issues.map((issue) => ({ path: issue.path.join('.'), code: issue.code })) },
  });
};

export const requireIdempotencyKey = (request: Request): string => {
  const value = request.header('Idempotency-Key')?.trim();
  if (!value) throw new DomainError('IDEMPOTENCY_KEY_REQUIRED', { messageKey: 'error.idempotencyKeyRequired', status: 400 });
  if (value.length > 200) throw new DomainError('INVALID_IDEMPOTENCY_KEY', { messageKey: 'error.invalidRequest', status: 400 });
  return value;
};
