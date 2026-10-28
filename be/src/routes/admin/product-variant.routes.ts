import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminProductVariantService } from '../../services/admin/product-variant.service.js';
import {
  createProductVariantSchema,
  queryProductVariantSchema,
  transitionVariantLifecycleSchema,
  updateProductVariantSchema,
} from '../../validations/admin/product-template.schema.js';

export const adminProductVariantRouter = Router();

adminProductVariantRouter.use(adminAuthMiddleware);

adminProductVariantRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryProductVariantSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductVariantService.getVariants(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminProductVariantRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductVariantService.getVariantById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminProductVariantRouter.post('/', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(createProductVariantSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductVariantService.createVariant(input);
    response.status(201).json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminProductVariantRouter.put('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const input = parseBody(updateProductVariantSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductVariantService.updateVariant(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminProductVariantRouter.patch('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const input = parseBody(updateProductVariantSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductVariantService.updateVariant(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminProductVariantRouter.patch('/:id/toggle-status', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductVariantService.toggleVariantStatus(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminProductVariantRouter.post('/:id/transition', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const input = parseBody(transitionVariantLifecycleSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductVariantService.transitionLifecycle(
      id,
      input.targetState,
      input.reason,
    );
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminProductVariantRouter.delete('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductVariantService.deleteVariant(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
