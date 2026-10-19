import { Router } from 'express';
import { z } from 'zod';
import { success } from '../contracts/api.js';
import { parseBody } from '../lib/request.js';
import { checkoutService } from '../services/checkout.service.js';

const otpRequestSchema = z.object({ contactType: z.enum(['EMAIL', 'PHONE']), identifier: z.string().trim().min(3).max(160) });
const otpVerifySchema = z.object({ verificationId: z.string().uuid(), code: z.string().regex(/^\d{6}$/) });
const quoteSchema = z.object({ cartToken: z.string().uuid(), fulfillmentMethod: z.enum(['PICKUP', 'DELIVERY']), deliveryAreaCode: z.string().trim().min(1).max(40).optional() });

export const checkoutRouter = Router();
checkoutRouter.post('/checkout/otp', async (request, response, next): Promise<void> => { try { response.json(success(await checkoutService.requestOtp(parseBody(otpRequestSchema, request.body)), response.locals.correlationId as string)); } catch (error: unknown) { next(error); } });
checkoutRouter.post('/checkout/otp/verify', async (request, response, next): Promise<void> => { try { const input = parseBody(otpVerifySchema, request.body); response.json(success(await checkoutService.verifyOtp(input.verificationId, input.code), response.locals.correlationId as string)); } catch (error: unknown) { next(error); } });
checkoutRouter.post('/checkout/quote', async (request, response, next): Promise<void> => { try { response.json(success(await checkoutService.quote(parseBody(quoteSchema, request.body)), response.locals.correlationId as string)); } catch (error: unknown) { next(error); } });
