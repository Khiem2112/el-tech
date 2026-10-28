import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminBrandService } from '../../services/admin/brand.service.js';
import {
  createBrandSchema,
  queryBrandSchema,
  updateBrandSchema,
} from '../../validations/admin/brand.schema.js';

export const adminBrandRouter = Router();

adminBrandRouter.use(adminAuthMiddleware);

adminBrandRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryBrandSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminBrandService.getBrands(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminBrandRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminBrandService.getBrandById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminBrandRouter.post('/', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(createBrandSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminBrandService.createBrand(input);
    response.status(201).json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminBrandRouter.put('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const input = parseBody(updateBrandSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminBrandService.updateBrand(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminBrandRouter.patch('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const input = parseBody(updateBrandSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminBrandService.updateBrand(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminBrandRouter.patch('/:id/toggle-status', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminBrandService.toggleBrandStatus(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminBrandRouter.delete('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminBrandService.deleteBrand(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
