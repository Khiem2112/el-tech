import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminSerialService } from '../../services/admin/serial.service.js';
import {
  querySerialsSchema,
  updateSerialStatusSchema,
} from '../../validations/admin/serial.schema.js';

export const adminSerialRouter = Router();

adminSerialRouter.use(adminAuthMiddleware);

adminSerialRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(querySerialsSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminSerialService.getSerials(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminSerialRouter.get('/:identifier', async (request, response, next): Promise<void> => {
  try {
    const identifier = request.params.identifier;
    const correlationId = response.locals.correlationId as string;
    const result = await adminSerialService.getSerialDetail(identifier);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminSerialRouter.patch('/:identifier/status', async (request, response, next): Promise<void> => {
  try {
    const identifier = request.params.identifier;
    const payload = parseBody(updateSerialStatusSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const adminUserId = response.locals.adminUser?.id as string | undefined;
    const result = await adminSerialService.updateSerialStatus(identifier, payload, adminUserId);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
