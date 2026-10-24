import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminTransferService } from '../../services/admin/transfer.service.js';
import {
  cancelTransferSchema,
  createTransferSchema,
  dispatchTransferSchema,
  queryTransferSchema,
  receiveTransferSchema,
} from '../../validations/admin/transfer.schema.js';

export const adminTransferRouter = Router();

adminTransferRouter.use(adminAuthMiddleware);

adminTransferRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryTransferSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminTransferService.listTransfers(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminTransferRouter.get('/eligible-skus', async (request, response, next): Promise<void> => {
  try {
    const branchId = parseInt(request.query.branchId as string, 10);
    const correlationId = response.locals.correlationId as string;
    if (Number.isNaN(branchId) || branchId <= 0) {
      response.json(success([], correlationId));
      return;
    }
    const result = await adminTransferService.getEligibleSourceSkus(branchId);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminTransferRouter.get('/:id/available-serials', async (request, response, next): Promise<void> => {
  try {
    const transferId = request.params.id;
    const skuId = parseInt(request.query.skuId as string, 10);
    const correlationId = response.locals.correlationId as string;
    if (Number.isNaN(skuId) || skuId <= 0) {
      response.json(success([], correlationId));
      return;
    }
    const result = await adminTransferService.getTransferAvailableSerials(transferId, skuId);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminTransferRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const correlationId = response.locals.correlationId as string;
    const result = await adminTransferService.getTransferById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminTransferRouter.post('/', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(createTransferSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const adminUserId = (response.locals.user as { id?: string } | undefined)?.id;
    const result = await adminTransferService.createTransfer(input, adminUserId);
    response.status(201).json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminTransferRouter.post('/:id/dispatch', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(dispatchTransferSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const adminUserId = (response.locals.user as { id?: string } | undefined)?.id;
    const result = await adminTransferService.dispatchTransfer(id, input, adminUserId);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminTransferRouter.post('/:id/receive', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = request.body && Object.keys(request.body).length > 0
      ? parseBody(receiveTransferSchema, request.body)
      : undefined;
    const correlationId = response.locals.correlationId as string;
    const adminUserId = (response.locals.user as { id?: string } | undefined)?.id;
    const result = await adminTransferService.receiveTransfer(id, input, adminUserId);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminTransferRouter.post('/:id/cancel', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(cancelTransferSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const adminUserId = (response.locals.user as { id?: string } | undefined)?.id;
    const result = await adminTransferService.cancelTransfer(id, input, adminUserId);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
