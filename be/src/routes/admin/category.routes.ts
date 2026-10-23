import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminCategoryService } from '../../services/admin/category.service.js';
import {
  createCategorySchema,
  queryCategorySchema,
  updateCategorySchema,
  updateSpecSchemaPayloadSchema,
} from '../../validations/admin/category.schema.js';

export const adminCategoryRouter = Router();

adminCategoryRouter.use(adminAuthMiddleware);

adminCategoryRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryCategorySchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminCategoryService.getCategories(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCategoryRouter.get('/tree', async (_request, response, next): Promise<void> => {
  try {
    const correlationId = response.locals.correlationId as string;
    const result = await adminCategoryService.getCategoryTree();
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCategoryRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminCategoryService.getCategoryById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCategoryRouter.post('/', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(createCategorySchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminCategoryService.createCategory(input);
    response.status(201).json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCategoryRouter.put('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const input = parseBody(updateCategorySchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminCategoryService.updateCategory(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCategoryRouter.patch('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const input = parseBody(updateCategorySchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminCategoryService.updateCategory(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCategoryRouter.put('/:id/spec-schema', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const payload = parseBody(updateSpecSchemaPayloadSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminCategoryService.updateSpecificationSchema(id, payload);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminCategoryRouter.patch('/:id/toggle-status', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminCategoryService.toggleCategoryStatus(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
