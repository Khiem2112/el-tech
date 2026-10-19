import { Router } from 'express';
import { z } from 'zod';
import { success } from '../contracts/api.js';
import { parseBody } from '../lib/request.js';
import { orderLookupService } from '../services/order-lookup.service.js';

const requestSchema = z.object({ code: z.string().trim().min(4).max(32), identifier: z.string().trim().min(3).max(160) });
const verifySchema = z.object({ verificationId: z.string().uuid(), code: z.string().regex(/^\d{6}$/) });
const sessionSchema = z.object({ sessionToken: z.string().uuid() });

export const orderLookupRouter = Router();
orderLookupRouter.post('/orders/lookup/request', async (request, response, next): Promise<void> => { try { const input = parseBody(requestSchema, request.body); response.json(success(await orderLookupService.request(input.code, input.identifier), response.locals.correlationId as string)); } catch (error: unknown) { next(error); } });
orderLookupRouter.post('/orders/lookup/verify', async (request, response, next): Promise<void> => { try { const input = parseBody(verifySchema, request.body); response.json(success(await orderLookupService.verify(input.verificationId, input.code), response.locals.correlationId as string)); } catch (error: unknown) { next(error); } });
orderLookupRouter.post('/orders/lookup/session', async (request, response, next): Promise<void> => { try { const input = parseBody(sessionSchema, request.body); response.json(success(await orderLookupService.getBySession(input.sessionToken), response.locals.correlationId as string)); } catch (error: unknown) { next(error); } });
