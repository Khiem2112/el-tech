import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminOrderService } from '../../services/admin/order.service.js';
import { queryOrderSchema } from '../../validations/admin/order.schema.js';
import { adminOrderDetailRouter } from './order-detail.routes.js';
import { adminOrderOperationsRouter } from './order-operations.routes.js';

export const adminOrderRouter = Router();

adminOrderRouter.use(adminAuthMiddleware);

adminOrderRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryOrderSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminOrderService.getOrders(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderRouter.get('/counts', async (_request, response, next): Promise<void> => {
  try {
    const correlationId = response.locals.correlationId as string;
    const result = await adminOrderService.getOrderCounts();
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderRouter.use('/', adminOrderOperationsRouter);
adminOrderRouter.use('/', adminOrderDetailRouter);
