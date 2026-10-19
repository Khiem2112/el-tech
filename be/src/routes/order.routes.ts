import { Router } from 'express';
import { z } from 'zod';
import { success } from '../contracts/api.js';
import { requireIdempotencyKey, parseBody } from '../lib/request.js';
import { orderService } from '../services/order.service.js';

const submitSchema = z.object({ cartToken: z.string().uuid(), emailVerificationId: z.string().uuid(), phoneVerificationId: z.string().uuid(), receiverName: z.string().trim().min(2).max(120), receiverEmail: z.string().trim().email(), receiverPhone: z.string().trim().min(8).max(24), fulfillmentMethod: z.enum(['PICKUP', 'DELIVERY']), branchId: z.number().int().positive(), paymentMethod: z.enum(['QR', 'COD']), deliveryAddress: z.string().trim().min(10).max(500).optional() });
export const orderRouter = Router();
orderRouter.post('/checkout/submit', async (request, response, next): Promise<void> => { try { const input = parseBody(submitSchema, request.body); response.json(success(await orderService.submit({ ...input, idempotencyKey: requireIdempotencyKey(request) }), response.locals.correlationId as string)); } catch (error: unknown) { next(error); } });
