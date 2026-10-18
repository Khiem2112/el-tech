import { Router } from 'express';
import { success } from '../contracts/api.js';
import { catalogService } from '../services/catalog.service.js';

export const catalogRouter = Router();

catalogRouter.get('/categories', async (request, response, next): Promise<void> => {
  try { response.json(success(await catalogService.getCategories(), response.locals.correlationId as string)); } catch (error: unknown) { next(error); }
});

catalogRouter.get('/branches', async (request, response, next): Promise<void> => {
  try { response.json(success(await catalogService.getBranches(), response.locals.correlationId as string)); } catch (error: unknown) { next(error); }
});
