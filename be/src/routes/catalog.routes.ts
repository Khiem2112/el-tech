import { Router } from 'express';
import { success } from '../contracts/api.js';
import { catalogService } from '../services/catalog.service.js';
import { pcBuildService } from '../services/pc-build.service.js';

export const catalogRouter = Router();

catalogRouter.get('/categories', async (request, response, next): Promise<void> => {
  try { response.json(success(await catalogService.getCategories(), response.locals.correlationId as string)); } catch (error: unknown) { next(error); }
});

catalogRouter.get('/branches', async (request, response, next): Promise<void> => {
  try { response.json(success(await catalogService.getBranches(), response.locals.correlationId as string)); } catch (error: unknown) { next(error); }
});

catalogRouter.get('/products', async (request, response, next): Promise<void> => {
  try {
    const query = typeof request.query.q === 'string' ? request.query.q : undefined;
    const category = typeof request.query.category === 'string' ? request.query.category : undefined;
    response.json(success(await catalogService.findProducts({ query, category }), response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});

catalogRouter.get('/products/:categorySlug/:productSlug', async (request, response, next): Promise<void> => {
  try {
    const product = await catalogService.getProduct(request.params.categorySlug, request.params.productSlug);
    if (!product) { response.status(404).json({ success: false, error: { code: 'PRODUCT_NOT_FOUND', messageKey: 'error.productNotFound', retryable: false, correlationId: response.locals.correlationId as string } }); return; }
    response.json(success(product, response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});

catalogRouter.get('/pc-bundles', async (_request, response, next): Promise<void> => {
  try { response.json(success(await pcBuildService.listBundles(), response.locals.correlationId as string)); } catch (error: unknown) { next(error); }
});

catalogRouter.post('/pc-builds/preview', async (request, response, next): Promise<void> => {
  try {
    const lines = Array.isArray(request.body?.lines) ? request.body.lines as { skuId: number; quantity: number }[] : [];
    response.json(success(await pcBuildService.preview(lines), response.locals.correlationId as string));
  } catch (error: unknown) { next(error); }
});
