import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseBody, parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminBranchService } from '../../services/admin/branch.service.js';
import {
  createBranchSchema,
  queryBranchSchema,
  updateBranchSchema,
} from '../../validations/admin/branch.schema.js';

export const adminBranchRouter = Router();

adminBranchRouter.use(adminAuthMiddleware);

adminBranchRouter.get('/', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryBranchSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminBranchService.getBranches(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminBranchRouter.get('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminBranchService.getBranchById(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminBranchRouter.post('/', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(createBranchSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminBranchService.createBranch(input);
    response.status(201).json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminBranchRouter.put('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const input = parseBody(updateBranchSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminBranchService.updateBranch(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminBranchRouter.patch('/:id', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const input = parseBody(updateBranchSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const result = await adminBranchService.updateBranch(id, input);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminBranchRouter.patch('/:id/toggle-status', async (request, response, next): Promise<void> => {
  try {
    const id = Number(request.params.id);
    const correlationId = response.locals.correlationId as string;
    const result = await adminBranchService.toggleBranchStatus(id);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
