import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { orderFulfillmentInboundService } from '../../services/admin/order-fulfillment-inbound.service.js';
import { orderFulfillmentShippingService } from '../../services/admin/order-fulfillment-shipping.service.js';
import {
  assembleOrderSchema,
  confirmCodOrderSchema,
  deliveryFailedSchema,
  initiateReturnSchema,
  prepareOrderSchema,
  readyForPickupSchema,
  receiveReturnSchema,
  scheduleRedeliverySchema,
  shipOrderSchema,
} from '../../validations/admin/order-operations.schema.js';

export const adminOrderOperationsRouter = Router();

adminOrderOperationsRouter.use(adminAuthMiddleware);

adminOrderOperationsRouter.get('/:id/stock-readiness', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const correlationId = response.locals.correlationId as string;
    const result = await orderFulfillmentInboundService.getStockReadiness(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.get('/:id/assembly-requirements', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const correlationId = response.locals.correlationId as string;
    const result = await orderFulfillmentInboundService.getAssemblyRequirements(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.get('/:id/shipping-requirements', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const correlationId = response.locals.correlationId as string;
    const result = await orderFulfillmentShippingService.getShippingRequirements(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.get('/:id/return-requirements', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const correlationId = response.locals.correlationId as string;
    const result = await orderFulfillmentShippingService.getReturnRequirements(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/:id/confirm-cod', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(confirmCodOrderSchema, request.body || {});
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderFulfillmentInboundService.confirmCodOrder(id, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/:id/prepare', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(prepareOrderSchema, request.body || {});
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderFulfillmentInboundService.prepareComponents(id, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/:id/assemble', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(assembleOrderSchema, request.body);
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderFulfillmentInboundService.assembleOrder(id, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/:id/ready-for-pickup', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(readyForPickupSchema, request.body || {});
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderFulfillmentInboundService.readyForPickup(id, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/:id/ship', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(shipOrderSchema, request.body);
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderFulfillmentShippingService.shipOrder(id, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/:id/delivery-failed', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(deliveryFailedSchema, request.body);
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderFulfillmentShippingService.deliveryFailed(id, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/:id/schedule-redelivery', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(scheduleRedeliverySchema, request.body);
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderFulfillmentShippingService.scheduleRedelivery(id, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/:id/initiate-return', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(initiateReturnSchema, request.body || {});
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderFulfillmentShippingService.initiateReturn(id, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/:id/receive-return', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(receiveReturnSchema, request.body || {});
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderFulfillmentShippingService.receiveReturn(id, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
