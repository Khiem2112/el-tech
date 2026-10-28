import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminPcBundleService } from '../../services/admin/pc-bundle.service.js';
import {
  createPcBundleSchema,
  queryPcBundleSchema,
  updatePcBundleSchema,
} from '../../validations/admin/pc-bundle.schema.js';

export const adminPcBundleRouter = Router();

adminPcBundleRouter.use(adminAuthMiddleware);

adminPcBundleRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryPcBundleSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminPcBundleService.getBundles(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPcBundleRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number.parseInt(request.params.id, 10);
    const correlationId = response.locals.correlationId as string;
    const result = await adminPcBundleService.getBundleById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPcBundleRouter.get('/:id/availability', async (request, response, next): Promise<void> => {
  try {
    const id = Number.parseInt(request.params.id, 10);
    const branchId = request.query.branchId ? Number.parseInt(request.query.branchId as string, 10) : undefined;
    const correlationId = response.locals.correlationId as string;
    const result = await adminPcBundleService.getBundleStockAvailability(id, branchId);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPcBundleRouter.post('/', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(createPcBundleSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminPcBundleService.createBundle(input);
    response.status(201).json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPcBundleRouter.put('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number.parseInt(request.params.id, 10);
    const input = parseBody(updatePcBundleSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminPcBundleService.updateBundle(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPcBundleRouter.delete('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number.parseInt(request.params.id, 10);
    const correlationId = response.locals.correlationId as string;
    const result = await adminPcBundleService.deleteBundle(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
