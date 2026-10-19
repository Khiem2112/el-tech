import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { success } from '../contracts/api.js';
import { parseBody } from '../lib/request.js';
import { paymentService } from '../services/payment.service.js';

const callbackSchema = z.object({ providerReference: z.string().trim().min(3).max(160), providerTransactionId: z.string().trim().min(3).max(160), receivedAmount: z.string().regex(/^\d+(\.\d{1,2})?$/), occurredAt: z.coerce.date(), rawPayload: z.record(z.string(), z.unknown()).default({}) });
export const paymentRouter = Router();
paymentRouter.post('/payments/callback', async (request, response, next): Promise<void> => { try { const input = parseBody(callbackSchema, request.body); response.json(success(await paymentService.processCallback({ ...input, rawPayload: (input.rawPayload ?? {}) as Prisma.InputJsonValue }), response.locals.correlationId as string)); } catch (error: unknown) { next(error); } });
