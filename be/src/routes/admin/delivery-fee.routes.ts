import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminDeliveryFeeService } from '../../services/admin/delivery-fee.service.js';
import {
  createDeliveryFeeSchema,
  queryDeliveryFeeSchema,
} from '../../validations/admin/delivery-fee.schema.js';

export const adminDeliveryFeeRouter = Router();

adminDeliveryFeeRouter.use(adminAuthMiddleware);

adminDeliveryFeeRouter.get('/current', async (_request, response, next): Promise<void> => {
  try {
    const correlationId = response.locals.correlationId as string;
    const result = await adminDeliveryFeeService.getActiveConfig();
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminDeliveryFeeRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryDeliveryFeeSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminDeliveryFeeService.getDeliveryFeeConfigs(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminDeliveryFeeRouter.post('/', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(createDeliveryFeeSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const adminUser = response.locals.adminUser as { email?: string; name?: string } | undefined;
    const creatorEmail = adminUser?.email ?? 'Admin Hệ Thống';
    const result = await adminDeliveryFeeService.createDeliveryFeeConfig(input, creatorEmail);
    response.status(201).json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
