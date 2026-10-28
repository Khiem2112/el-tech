import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminCouponService } from '../../services/admin/coupon.service.js';
import {
  createCouponSchema,
  queryCouponSchema,
  queryRedemptionSchema,
  updateCouponSchema,
} from '../../validations/admin/coupon.schema.js';

export const adminCouponRouter = Router();

adminCouponRouter.use(adminAuthMiddleware);

adminCouponRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryCouponSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminCouponService.getCoupons(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCouponRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const correlationId = response.locals.correlationId as string;
    const result = await adminCouponService.getCouponById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCouponRouter.post('/', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(createCouponSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminCouponService.createCoupon(input);
    response.status(201).json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCouponRouter.put('/:id', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const input = parseBody(updateCouponSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminCouponService.updateCoupon(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCouponRouter.patch('/:id/toggle-status', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const correlationId = response.locals.correlationId as string;
    const result = await adminCouponService.toggleCouponStatus(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCouponRouter.delete('/:id', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const correlationId = response.locals.correlationId as string;
    const result = await adminCouponService.deleteCoupon(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCouponRouter.get('/:id/redemptions', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const query = parseQuery(queryRedemptionSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminCouponService.getCouponRedemptions(id, query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
