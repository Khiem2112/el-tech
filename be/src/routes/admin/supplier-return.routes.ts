import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminSupplierReturnService } from '../../services/admin/supplier-return.service.js';
import {
  createSupplierReturnSchema,
  querySupplierReturnSchema,
} from '../../validations/admin/supplier-return.schema.js';

export const adminSupplierReturnRouter = Router();

adminSupplierReturnRouter.use(adminAuthMiddleware);

adminSupplierReturnRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(querySupplierReturnSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminSupplierReturnService.getSupplierReturns(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminSupplierReturnRouter.get(
  '/eligible-receipts',
  async (request, response, next): Promise<void> => {
    try {
      const search = typeof request.query.search === 'string' ? request.query.search : undefined;
      const supplierId =
        typeof request.query.supplierId === 'string'
          ? parseInt(request.query.supplierId, 10)
          : undefined;
      const branchId =
        typeof request.query.branchId === 'string'
          ? parseInt(request.query.branchId, 10)
          : undefined;

      const correlationId = response.locals.correlationId as string;
      const result = await adminSupplierReturnService.getEligibleReceiptMoves(
        search,
        Number.isNaN(supplierId) ? undefined : supplierId,
        Number.isNaN(branchId) ? undefined : branchId,
      );
      response.json(success(result, correlationId));
    } catch (error: unknown) {
      next(error);
    }
  },
);

adminSupplierReturnRouter.get(
  '/receipt-info/:receiptMoveId',
  async (request, response, next): Promise<void> => {
    try {
      const receiptMoveId = request.params.receiptMoveId;
      const correlationId = response.locals.correlationId as string;
      const result = await adminSupplierReturnService.getReceiptMoveReturnInfo(receiptMoveId);
      response.json(success(result, correlationId));
    } catch (error: unknown) {
      next(error);
    }
  },
);

adminSupplierReturnRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const correlationId = response.locals.correlationId as string;
    const result = await adminSupplierReturnService.getSupplierReturnById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminSupplierReturnRouter.post('/', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(createSupplierReturnSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const adminUserId = (response.locals.user as { id?: string } | undefined)?.id;
    const result = await adminSupplierReturnService.createSupplierReturn(input, adminUserId);
    response.status(201).json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
