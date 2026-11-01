import { prisma } from '../lib/prisma.js';
import { Router } from 'express';
import { z } from 'zod';
import { success } from '../contracts/api.js';
import { DomainError } from '../contracts/domain-error.js';
import { requireIdempotencyKey, parseBody, extractCustomerToken } from '../lib/request.js';
import { authService } from '../services/auth.service.js';
import { sanitizeIdentifier } from '../lib/uuid.js';
import { orderService } from '../services/order.service.js';
import { orderLookupService } from '../services/order-lookup.service.js';

const submitSchema = z.object({
  cartToken: z.string().uuid(),
  emailVerificationId: z.string().uuid().optional(),
  phoneVerificationId: z.string().uuid().optional(),
  receiverName: z.string().trim().min(2).max(120),
  receiverEmail: z.string().trim().email(),
  receiverPhone: z.string().trim().min(8).max(24),
  fulfillmentMethod: z.enum(['PICKUP', 'DELIVERY']),
  branchId: z.number().int().positive().optional(),
  deliveryAreaCode: z.string().trim().min(1).max(40).optional(),
  paymentMethod: z.enum(['QR', 'COD']),
  deliveryAddress: z.string().trim().min(10).max(500).optional(),
  couponCode: z.string().trim().optional(),
});

const cancelSchema = z.object({
  identifier: z.string().trim().min(3).max(160),
  sessionToken: z.string().uuid().optional(),
  reason: z.string().trim().min(2).max(500).optional(),
});


const guestLookupOtpRequestSchema = z.object({
  identifier: z.string().trim().min(3).max(160),
  contactType: z.enum(['EMAIL', 'PHONE']),
});

const guestLookupOtpVerifySchema = z.object({
  verificationId: z.string().uuid(),
  otp: z.string().regex(/^\d{6}$/),
});

export const orderRouter = Router();

orderRouter.post('/checkout/submit', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(submitSchema, request.body);
    const token = extractCustomerToken(request);
    let userId: string | undefined;
    if (token) {
      const authUser = await authService.getMe(token);
      if (authUser) {
        userId = authUser.id;
      }
    }
    response.json(success(await orderService.submit({ ...input, userId, idempotencyKey: requireIdempotencyKey(request) }), response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});

orderRouter.post('/orders/:orderCode/cancel', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(cancelSchema, request.body);
    response.json(success(await orderService.cancel({ orderCode: request.params.orderCode, ...input }), response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});

orderRouter.get('/orders/kanban', async (request, response, next): Promise<void> => {
  try {
    const adminKey = request.headers['x-admin-token'] ?? request.headers['x-staff-role'];
    if (!adminKey || (adminKey !== 'admin' && adminKey !== process.env.ADMIN_TOKEN)) {
      throw new DomainError('ACCESS_DENIED', { messageKey: 'error.accessDenied', status: 403 });
    }
    const orders = await orderService.getKanbanOrders();
    response.json(success(orders, response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});

orderRouter.get('/orders/customer', async (request, response, next): Promise<void> => {
  try {
    const token = extractCustomerToken(request);
    let customerId = typeof request.query.customerId === 'string' ? sanitizeIdentifier(request.query.customerId) : undefined;
    let email = typeof request.query.email === 'string' ? sanitizeIdentifier(request.query.email) : undefined;
    if (token) {
      const authUser = await authService.getMe(token);
      if (authUser) {
        customerId = authUser.customerId;
        email = authUser.email;
      }
    }
    const identifier = customerId || email;
    if (!identifier) {
      response.json(success([], response.locals.correlationId as string));
      return;
    }
    const orders = await orderService.getCustomerOrders(identifier);
    response.json(success(orders, response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});


orderRouter.post('/orders/lookup/request-otp', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(guestLookupOtpRequestSchema, request.body);
    const result = await orderLookupService.requestGuestLookupOtp(input.identifier, input.contactType);
    response.json(success(result, response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});

orderRouter.post('/orders/lookup/verify-otp', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(guestLookupOtpVerifySchema, request.body);
    const result = await orderLookupService.verifyGuestLookupOtp(input.verificationId, input.otp);
    response.json(success(result, response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});

orderRouter.post('/orders/:orderCode/reschedule-delivery', async (request, response, next): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({ where: { code: request.params.orderCode } });
    if (!order) throw new DomainError('ORDER_NOT_FOUND', { messageKey: 'error.orderNotFound', status: 404 });
    const result = await orderService.rescheduleDelivery(order.id);
    response.json(success(result, response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});

orderRouter.get('/orders/:orderCode/detail', async (request, response, next): Promise<void> => {
  try {
    const token = extractCustomerToken(request);
    let requesterUserId: string | undefined;
    let authCustomerId: string | undefined;
    if (token) {
      const authUser = await authService.getMe(token);
      if (authUser) {
        requesterUserId = authUser.id;
        authCustomerId = authUser.customerId;
      }
    }

    const rawIdentifier = (typeof request.query.identifier === 'string' && request.query.identifier)
      || (typeof request.query.customerId === 'string' && request.query.customerId)
      || (typeof request.query.email === 'string' && request.query.email)
      || authCustomerId
      || (typeof request.headers['x-user-identifier'] === 'string' && request.headers['x-user-identifier'])
      || undefined;
    const identifier = sanitizeIdentifier(rawIdentifier);

    if (identifier) {
      const order = await orderLookupService.getOrderDetailForCustomer(request.params.orderCode, identifier, requesterUserId);
      response.json(success(order, response.locals.correlationId as string));
    } else {
      const order = await orderLookupService.lookupByOrderCode(request.params.orderCode, requesterUserId);
      response.json(success(order, response.locals.correlationId as string));
    }
  } catch (error: unknown) { next(error); }
});

orderRouter.post('/orders/expire-overdue', async (_request, response, next): Promise<void> => {
  try {
    response.json(success({ expiredCount: await orderService.expireOverdueOrders() }, response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});
