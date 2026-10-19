import { Router } from 'express';
import { z } from 'zod';
import { success } from '../contracts/api.js';
import { parseBody } from '../lib/request.js';
import { pcBuildService } from '../services/pc-build.service.js';

const previewSchema = z.object({
  lines: z.array(
    z.object({
      skuId: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })
  ),
});

export const pcBuildRouter = Router();

pcBuildRouter.get('/pc-build/bundles', async (_request, response, next): Promise<void> => {
  try {
    const bundles = await pcBuildService.listBundles();
    response.json(success(bundles, response.locals.correlationId as string));
  } catch (error: unknown) {
    next(error);
  }
});

pcBuildRouter.get('/pc-build/components', async (request, response, next): Promise<void> => {
  try {
    const category = typeof request.query.category === 'string' ? request.query.category : undefined;
    const components = await pcBuildService.getComponents(category);
    response.json(success(components, response.locals.correlationId as string));
  } catch (error: unknown) {
    next(error);
  }
});

pcBuildRouter.post('/pc-build/preview', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(previewSchema, request.body);
    const result = await pcBuildService.preview(input.lines);
    response.json(success(result, response.locals.correlationId as string));
  } catch (error: unknown) {
    next(error);
  }
});
