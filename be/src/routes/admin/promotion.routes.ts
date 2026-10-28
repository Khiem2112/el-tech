import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminPromotionService } from '../../services/admin/promotion.service.js';
import {
  createPromotionSchema,
  queryPromotionSchema,
  updatePromotionSchema,
} from '../../validations/admin/promotion.schema.js';

export const adminPromotionRouter = Router();

adminPromotionRouter.use(adminAuthMiddleware);

adminPromotionRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryPromotionSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminPromotionService.getPromotions(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPromotionRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const correlationId = response.locals.correlationId as string;
    const result = await adminPromotionService.getPromotionById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPromotionRouter.post('/', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(createPromotionSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminPromotionService.createPromotion(input);
    response.status(201).json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPromotionRouter.put('/:id', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const input = parseBody(updatePromotionSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminPromotionService.updatePromotion(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPromotionRouter.patch('/:id/toggle-status', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const correlationId = response.locals.correlationId as string;
    const result = await adminPromotionService.togglePromotionStatus(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPromotionRouter.delete('/:id', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const correlationId = response.locals.correlationId as string;
    const result = await adminPromotionService.deletePromotion(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
