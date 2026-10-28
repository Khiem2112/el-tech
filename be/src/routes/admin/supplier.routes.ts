import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminSupplierService } from '../../services/admin/supplier.service.js';
import {
  createSupplierSchema,
  querySupplierSchema,
  updateSupplierSchema,
} from '../../validations/admin/supplier.schema.js';

export const adminSupplierRouter = Router();

adminSupplierRouter.use(adminAuthMiddleware);

adminSupplierRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(querySupplierSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminSupplierService.getSuppliers(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminSupplierRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminSupplierService.getSupplierById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminSupplierRouter.post('/', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(createSupplierSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminSupplierService.createSupplier(input);
    response.status(201).json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminSupplierRouter.put('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const input = parseBody(updateSupplierSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminSupplierService.updateSupplier(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminSupplierRouter.patch('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const input = parseBody(updateSupplierSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminSupplierService.updateSupplier(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminSupplierRouter.patch('/:id/toggle-status', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminSupplierService.toggleSupplierStatus(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminSupplierRouter.delete('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminSupplierService.deleteSupplier(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
