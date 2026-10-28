import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminDashboardService } from '../../services/admin/dashboard.service.js';
import {
  queryDashboardSchema,
  queryLowStockAlertsSchema,
} from '../../validations/admin/dashboard.schema.js';

export const adminDashboardRouter = Router();

adminDashboardRouter.use(adminAuthMiddleware);

adminDashboardRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryDashboardSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminDashboardService.getSummary(query.branchId);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminDashboardRouter.get('/summary', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryDashboardSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminDashboardService.getSummary(query.branchId);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminDashboardRouter.get('/urgent-queues', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryDashboardSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminDashboardService.getUrgentQueues(query.branchId);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminDashboardRouter.get('/order-distribution', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryDashboardSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminDashboardService.getOrderStatusDistribution(query.branchId);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminDashboardRouter.get('/low-stock-alerts', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryLowStockAlertsSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminDashboardService.getLowStockAlerts(query.branchId, query.limit);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
