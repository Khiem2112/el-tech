import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminNotificationService } from '../../services/admin/notification.service.js';
import { queryNotificationsSchema } from '../../validations/admin/notification.schema.js';

export const adminNotificationRouter = Router();

adminNotificationRouter.use(adminAuthMiddleware);

adminNotificationRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryNotificationsSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminNotificationService.getNotifications(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminNotificationRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const correlationId = response.locals.correlationId as string;
    const result = await adminNotificationService.getNotificationById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminNotificationRouter.post('/:id/retry', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const correlationId = response.locals.correlationId as string;
    const result = await adminNotificationService.retryNotification(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
