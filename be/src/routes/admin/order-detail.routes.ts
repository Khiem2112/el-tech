import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminOrderDetailService } from '../../services/admin/order-detail.service.js';
import { updateOrderNotesSchema } from '../../validations/admin/order.schema.js';

export const adminOrderDetailRouter = Router();

adminOrderDetailRouter.use(adminAuthMiddleware);

adminOrderDetailRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const correlationId = response.locals.correlationId as string;
    const result = await adminOrderDetailService.getOrderDetail(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminOrderDetailRouter.patch('/:id/notes', async (request, response, next): Promise<void> => {
  try {
    const id = request.params.id;
    const input = parseBody(updateOrderNotesSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminOrderDetailService.updateOrderNotes(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
