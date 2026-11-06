import { Router } from 'express';
import { success } from '../contracts/api.js';
import { DomainError } from '../contracts/domain-error.js';
import { adminComplaintService } from '../services/admin/complaint.service.js';
import { createComplaintSchema } from '../validations/admin/complaint.schema.js';

export const complaintRouter = Router();

complaintRouter.post('/', async (request, response, next): Promise<void> => {
  try {
    const parseResult = createComplaintSchema.safeParse(request.body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      const errorMessage = firstIssue?.message || 'Thông tin gửi khiếu nại không hợp lệ';
      const issues = parseResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      throw new DomainError('INVALID_COMPLAINT_DATA', {
        messageKey: errorMessage,
        status: 400,
        details: { issues },
      });
    }

    const correlationId = response.locals.correlationId as string;
    const result = await adminComplaintService.createComplaint(parseResult.data);
    response.status(201).json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

complaintRouter.get('/lookup', async (request, response, next): Promise<void> => {
  try {
    const q = typeof request.query.query === 'string' ? request.query.query.trim() : '';
    if (!q) {
      throw new DomainError('QUERY_REQUIRED', {
        messageKey: 'Vui lòng nhập số điện thoại hoặc mã phiếu khiếu nại để tra cứu',
        status: 400,
      });
    }

    const correlationId = response.locals.correlationId as string;
    const result = await adminComplaintService.lookupComplaints(q);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

