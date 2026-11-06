import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { DomainError } from '../../contracts/domain-error.js';
import { parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminComplaintService } from '../../services/admin/complaint.service.js';
import {
  queryComplaintsSchema,
  updateComplaintStatusSchema,
} from '../../validations/admin/complaint.schema.js';

export const adminComplaintRouter = Router();

adminComplaintRouter.use(adminAuthMiddleware);

adminComplaintRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryComplaintsSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminComplaintService.getComplaints(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminComplaintRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const correlationId = response.locals.correlationId as string;
    const result = await adminComplaintService.getComplaintById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminComplaintRouter.patch('/:id/status', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const parseResult = updateComplaintStatusSchema.safeParse(request.body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      throw new DomainError('INVALID_STATUS_UPDATE', {
        messageKey: firstIssue?.message || 'Thông tin cập nhật trạng thái khiếu nại không hợp lệ',
        status: 400,
      });
    }

    const adminUser = response.locals.adminUser as { name?: string; email?: string } | undefined;
    const changedBy = adminUser?.name || adminUser?.email || 'Quan tri vien';
    const correlationId = response.locals.correlationId as string;
    const result = await adminComplaintService.updateComplaintStatus(id, parseResult.data, changedBy);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminComplaintRouter.put('/:id/status', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const parseResult = updateComplaintStatusSchema.safeParse(request.body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      throw new DomainError('INVALID_STATUS_UPDATE', {
        messageKey: firstIssue?.message || 'Thông tin cập nhật trạng thái khiếu nại không hợp lệ',
        status: 400,
      });
    }

    const adminUser = response.locals.adminUser as { name?: string; email?: string } | undefined;
    const changedBy = adminUser?.name || adminUser?.email || 'Quan tri vien';
    const correlationId = response.locals.correlationId as string;
    const result = await adminComplaintService.updateComplaintStatus(id, parseResult.data, changedBy);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminComplaintRouter.delete('/:id', async (request, response, next): Promise<void> => {
  try {
    const { id } = request.params;
    const correlationId = response.locals.correlationId as string;
    const result = await adminComplaintService.deleteComplaint(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

