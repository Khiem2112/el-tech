import { Router } from 'express';
import { z } from 'zod';
import { success } from '../contracts/api.js';
import { parseBody } from '../lib/request.js';
import { cartService } from '../services/cart.service.js';

const lineSchema = z.object({ skuId: z.number().int().positive(), quantity: z.number().int().min(1).max(99) });
const quantitySchema = z.object({ quantity: z.number().int().min(0).max(99) });
const tokenFrom = (value: string | undefined): string | undefined => value?.trim() || undefined;

export const cartRouter = Router();

cartRouter.get('/cart', async (request, response, next): Promise<void> => {
  try { response.json(success(await cartService.read(tokenFrom(request.header('X-Cart-Token'))), response.locals.correlationId as string)); } catch (error: unknown) { next(error); }
});
cartRouter.post('/cart/lines', async (request, response, next): Promise<void> => {
  try { response.json(success(await cartService.add(tokenFrom(request.header('X-Cart-Token')), parseBody(lineSchema, request.body)), response.locals.correlationId as string)); } catch (error: unknown) { next(error); }
});
cartRouter.patch('/cart/lines/:itemId', async (request, response, next): Promise<void> => {
  try { response.json(success(await cartService.changeQuantity(tokenFrom(request.header('X-Cart-Token')) ?? '', request.params.itemId, parseBody(quantitySchema, request.body).quantity), response.locals.correlationId as string)); } catch (error: unknown) { next(error); }
});
cartRouter.delete('/cart/lines/:itemId', async (request, response, next): Promise<void> => {
  try { response.json(success(await cartService.remove(tokenFrom(request.header('X-Cart-Token')) ?? '', request.params.itemId), response.locals.correlationId as string)); } catch (error: unknown) { next(error); }
});
