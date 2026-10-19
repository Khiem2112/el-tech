import { Router } from 'express';
import { z } from 'zod';
import { success } from '../contracts/api.js';
import { parseBody } from '../lib/request.js';
import { reviewService } from '../services/review.service.js';

const createSchema = z.object({ verificationId: z.string().uuid(), orderLineId: z.string().uuid(), rating: z.number().int().min(1).max(5), text: z.string().trim().min(10).max(2000) });
export const reviewRouter = Router();
reviewRouter.post('/reviews', async (request, response, next): Promise<void> => { try { response.status(201).json(success(await reviewService.create(parseBody(createSchema, request.body)), response.locals.correlationId as string)); } catch (error: unknown) { next(error); } });
reviewRouter.get('/products/:productSlug/reviews', async (request, response, next): Promise<void> => { try { response.json(success(await reviewService.list(request.params.productSlug), response.locals.correlationId as string)); } catch (error: unknown) { next(error); } });
