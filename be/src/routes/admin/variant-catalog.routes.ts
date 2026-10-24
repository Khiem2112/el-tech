import { Router } from 'express';
import { z } from 'zod';
import { success } from '../../contracts/api.js';
import { parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminVariantCatalogService } from '../../services/admin/variant-catalog.service.js';

const variantCatalogQuerySchema = z.object({
  search: z.string().trim().optional(),
  barcode: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  productTemplateId: z.coerce.number().int().optional(),
  categoryId: z.coerce.number().int().optional(),
  brandId: z.coerce.number().int().optional(),
  lifecycleState: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'DISCONTINUED']).optional(),
  serialRequired: z
    .union([
      z.boolean(),
      z.enum(['true', 'false', 'all']).transform((val) => {
        if (val === 'all') return undefined;
        return val === 'true';
      }),
    ])
    .optional(),
  stockStatus: z
    .enum(['in-stock', 'low-stock', 'out-of-stock', 'reserved', 'all'])
    .optional(),
  isActive: z
    .union([
      z.boolean(),
      z.enum(['true', 'false', 'all']).transform((val) => {
        if (val === 'all') return undefined;
        return val === 'true';
      }),
    ])
    .optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().nonnegative().optional().default(50),
  sortBy: z
    .enum(['sku', 'sellingPrice', 'totalAvailable', 'totalOnHand', 'updatedAt', 'createdAt'])
    .optional()
    .default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const variantCatalogRouter = Router();

variantCatalogRouter.use(adminAuthMiddleware);

variantCatalogRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(variantCatalogQuerySchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminVariantCatalogService.getVariantCatalog(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
