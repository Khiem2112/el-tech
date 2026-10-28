import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminCustomerService } from '../../services/admin/customer.service.js';
import {
  mergeCustomerSchema,
  queryCustomerSchema,
  updateCustomerSchema,
} from '../../validations/admin/customer.schema.js';

export const adminCustomerRouter = Router();

adminCustomerRouter.use(adminAuthMiddleware);

adminCustomerRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryCustomerSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminCustomerService.getCustomers(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCustomerRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const correlationId = response.locals.correlationId as string;
    const result = await adminCustomerService.getCustomerById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCustomerRouter.get('/:id/merge-candidates', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const search = typeof request.query.search === 'string' ? request.query.search : undefined;
    const correlationId = response.locals.correlationId as string;
    const result = await adminCustomerService.getMergeCandidates(id, search);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCustomerRouter.post('/:id/merge', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const input = parseBody(mergeCustomerSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id;
    const result = await adminCustomerService.mergeCustomerProfiles(id, input, adminId);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCustomerRouter.put('/:id', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const input = parseBody(updateCustomerSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminCustomerService.updateCustomer(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
