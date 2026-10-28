import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminReviewService } from '../../services/admin/review.service.js';
import {
  queryReviewsSchema,
  updateReviewVisibilitySchema,
} from '../../validations/admin/review.schema.js';

export const adminReviewRouter = Router();

adminReviewRouter.use(adminAuthMiddleware);

adminReviewRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryReviewsSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminReviewService.getReviews(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminReviewRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const correlationId = response.locals.correlationId as string;
    const result = await adminReviewService.getReviewById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminReviewRouter.patch('/:id/visibility', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const input = parseBody(updateReviewVisibilitySchema, request.body);
    const adminUser = response.locals.adminUser as { name?: string; email?: string } | undefined;
    const changedBy = adminUser?.name || adminUser?.email || 'Administrator';
    const correlationId = response.locals.correlationId as string;
    const result = await adminReviewService.updateReviewVisibility(id, input, changedBy);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminReviewRouter.put('/:id/visibility', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const input = parseBody(updateReviewVisibilitySchema, request.body);
    const adminUser = response.locals.adminUser as { name?: string; email?: string } | undefined;
    const changedBy = adminUser?.name || adminUser?.email || 'Administrator';
    const correlationId = response.locals.correlationId as string;
    const result = await adminReviewService.updateReviewVisibility(id, input, changedBy);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
