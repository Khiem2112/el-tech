import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminProductTemplateService } from '../../services/admin/product-template.service.js';
import {
  createProductTemplateSchema,
  queryProductTemplateSchema,
  transitionLifecycleSchema,
  updateProductTemplateSchema,
} from '../../validations/admin/product-template.schema.js';

export const adminProductTemplateRouter = Router();

adminProductTemplateRouter.use(adminAuthMiddleware);

adminProductTemplateRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryProductTemplateSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductTemplateService.getTemplates(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminProductTemplateRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductTemplateService.getTemplateById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminProductTemplateRouter.post('/', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(createProductTemplateSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductTemplateService.createTemplate(input);
    response.status(201).json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminProductTemplateRouter.put('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const input = parseBody(updateProductTemplateSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductTemplateService.updateTemplate(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminProductTemplateRouter.patch('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const input = parseBody(updateProductTemplateSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductTemplateService.updateTemplate(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminProductTemplateRouter.patch('/:id/toggle-status', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductTemplateService.toggleTemplateStatus(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminProductTemplateRouter.post('/:id/transition', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const input = parseBody(transitionLifecycleSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductTemplateService.transitionLifecycle(
      id,
      input.targetState,
      input.reason,
    );
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminProductTemplateRouter.delete('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminProductTemplateService.deleteTemplate(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
