import { Router } from 'express';
import { success } from '../../contracts/api.js';
import { parseQuery } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import { adminInventoryService } from '../../services/admin/inventory.service.js';
import {
  queryInventoryBalancesSchema,
  queryStockLedgerSchema,
} from '../../validations/admin/inventory.schema.js';

export const adminInventoryRouter = Router();

adminInventoryRouter.use(adminAuthMiddleware);

adminInventoryRouter.get('/balances', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryInventoryBalancesSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminInventoryService.getBalances(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminInventoryRouter.get('/balances/:stockQuantId/ledger', async (request, response, next): Promise<void> => {
  try {
    const stockQuantId = request.params.stockQuantId;
    const correlationId = response.locals.correlationId as string;
    const result = await adminInventoryService.getQuantLedger(stockQuantId);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminInventoryRouter.get('/ledger', async (request, response, next): Promise<void> => {
  try {
    const query = parseQuery(queryStockLedgerSchema, request.query);
    const correlationId = response.locals.correlationId as string;
    const result = await adminInventoryService.getLedgerEntries(query);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminInventoryRouter.post('/quarantine', async (request, response, next): Promise<void> => {
  try {
    const { parseBody } = await import('../../lib/request.js');
    const { quarantineStockSchema } = await import('../../validations/admin/inventory.schema.js');
    const payload = parseBody(quarantineStockSchema, request.body);
    const correlationId = response.locals.correlationId as string;
    const adminUserId = response.locals.adminUser?.id as string | undefined;
    const result = await adminInventoryService.quarantineStock(payload, adminUserId);
    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});
