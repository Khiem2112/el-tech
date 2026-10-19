import { Router } from 'express';
import { z } from 'zod';
import { success } from '../contracts/api.js';
import { requireIdempotencyKey, parseBody } from '../lib/request.js';
import { orderService } from '../services/order.service.js';

const submitSchema = z.object({
  cartToken: z.string().uuid(),
  emailVerificationId: z.string().uuid(),
  phoneVerificationId: z.string().uuid(),
  receiverName: z.string().trim().min(2).max(120),
  receiverEmail: z.string().trim().email(),
  receiverPhone: z.string().trim().min(8).max(24),
  fulfillmentMethod: z.enum(['PICKUP', 'DELIVERY']),
  branchId: z.number().int().positive().optional(),
  deliveryAreaCode: z.string().trim().min(1).max(40).optional(),
  paymentMethod: z.enum(['QR', 'COD']),
  deliveryAddress: z.string().trim().min(10).max(500).optional(),
});

const cancelSchema = z.object({
  identifier: z.string().trim().min(3).max(160),
  sessionToken: z.string().uuid().optional(),
  reason: z.string().trim().min(2).max(500).optional(),
});

export const orderRouter = Router();

orderRouter.post('/checkout/submit', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(submitSchema, request.body);
    response.json(success(await orderService.submit({ ...input, idempotencyKey: requireIdempotencyKey(request) }), response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});

orderRouter.post('/orders/:orderCode/cancel', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(cancelSchema, request.body);
    response.json(success(await orderService.cancel({ orderCode: request.params.orderCode, ...input }), response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});

orderRouter.get('/orders/kanban', async (_request, response, next): Promise<void> => {
  try {
    const orders = await orderService.getKanbanOrders();
    response.json(success(orders, response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});

orderRouter.get('/orders/customer', async (request, response, next): Promise<void> => {
  try {
    const customerId = typeof request.query.customerId === 'string' ? request.query.customerId : undefined;
    const orders = await orderService.getCustomerOrders(customerId);
    response.json(success(orders, response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});

orderRouter.post('/orders/expire-overdue', async (_request, response, next): Promise<void> => {
  try {
    response.json(success({ expiredCount: await orderService.expireOverdueOrders() }, response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});
