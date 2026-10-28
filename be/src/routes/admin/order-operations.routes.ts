import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { orderClosingService } from '../../services/admin/order-closing.service.js';
import { orderExceptionService } from '../../services/admin/order-exception.service.js';
import { orderFulfillmentInboundService } from '../../services/admin/order-fulfillment-inbound.service.js';
import { orderFulfillmentShippingService } from '../../services/admin/order-fulfillment-shipping.service.js';
import {
  assembleOrderSchema,
  cancelOrderSchema,
  completeOrderSchema,
  confirmCodOrderSchema,
  deliveryFailedSchema,
  holdOrderSchema,
  initiateReturnSchema,
  manualRefundSchema,
  pickupToDeliverySchema,
  prepareOrderSchema,
  readyForPickupSchema,
  receiveReturnSchema,
  resolveHoldSchema,
  resolveQrDiscrepancySchema,
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

adminOrderOperationsRouter.get('/:id/cancel-preview', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const correlationId = response.locals.correlationId as string;
    const result = await orderClosingService.getCancellationPreview(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.get('/:id/qr-discrepancy', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const correlationId = response.locals.correlationId as string;
    const result = await orderExceptionService.getQrDiscrepancyDetail(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/:id/complete', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(completeOrderSchema, request.body || {});
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderClosingService.completeOrder(id, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/:id/cancel', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(cancelOrderSchema, request.body);
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderClosingService.cancelOrder(id, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/:id/hold', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(holdOrderSchema, request.body);
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderExceptionService.holdOrder(id, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/:id/resolve-hold', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(resolveHoldSchema, request.body);
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderExceptionService.resolveHold(id, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/:id/pickup-to-delivery', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(pickupToDeliverySchema, request.body);
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderExceptionService.createPickupToDeliveryAmendment(id, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/:id/resolve-qr-discrepancy', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(resolveQrDiscrepancySchema, request.body);
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderExceptionService.resolveQrDiscrepancy(id, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderOperationsRouter.post('/refunds/:refundId/process-manual', async (request, response, next): Promise<void> => {
  try {
    const refundId = request.params.refundId;
    const input = parseBody(manualRefundSchema, request.body);
    const adminUser = response.locals.adminUser as { id: string } | undefined;
    const adminId = adminUser?.id || 'admin-system';
    const correlationId = response.locals.correlationId as string;
    const result = await orderExceptionService.processManualRefund(refundId, adminId, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
