import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { poReceiptService } from '../../services/admin/po-receipt.service.js';
import { adminPurchaseOrderService } from '../../services/admin/purchase-order.service.js';
import {
  cancelPurchaseOrderSchema,
  createPurchaseOrderSchema,
  queryPurchaseOrderSchema,
  shortShipmentSchema,
  updatePurchaseOrderSchema,
  validatePoReceiptSchema,
} from '../../validations/admin/purchase-order.schema.js';

export const adminPurchaseOrderRouter = Router();

adminPurchaseOrderRouter.use(adminAuthMiddleware);

adminPurchaseOrderRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryPurchaseOrderSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminPurchaseOrderService.getPurchaseOrders(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPurchaseOrderRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const correlationId = response.locals.correlationId as string;
    const result = await adminPurchaseOrderService.getPurchaseOrderById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPurchaseOrderRouter.post('/', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(createPurchaseOrderSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminPurchaseOrderService.createPurchaseOrder(input);
    response.status(201).json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPurchaseOrderRouter.put('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(updatePurchaseOrderSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminPurchaseOrderService.updatePurchaseOrder(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPurchaseOrderRouter.patch('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(updatePurchaseOrderSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminPurchaseOrderService.updatePurchaseOrder(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPurchaseOrderRouter.post('/:id/confirm', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const correlationId = response.locals.correlationId as string;
    const result = await adminPurchaseOrderService.confirmPurchaseOrder(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPurchaseOrderRouter.post('/:id/receipt', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(validatePoReceiptSchema, request.body);
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const correlationId = response.locals.correlationId as string;
    const result = await poReceiptService.validatePoReceipt(id, input, adminUser?.id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPurchaseOrderRouter.post('/:id/short-shipment', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(shortShipmentSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminPurchaseOrderService.handleShortShipment(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPurchaseOrderRouter.post('/:id/close', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const correlationId = response.locals.correlationId as string;
    const result = await adminPurchaseOrderService.closePurchaseOrder(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminPurchaseOrderRouter.post('/:id/cancel', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(cancelPurchaseOrderSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminPurchaseOrderService.cancelPurchaseOrder(id, input.reason);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
