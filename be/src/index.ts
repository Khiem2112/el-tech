import cors from 'cors';
import express from 'express';
import { environment } from './config.js';
import { success } from './contracts/api.js';
import { correlationId, errorHandler } from './middleware/error-handler.js';
import { catalogRouter } from './routes/catalog.routes.js';
import { cartRouter } from './routes/cart.routes.js';
import { checkoutRouter } from './routes/checkout.routes.js';
import { orderRouter } from './routes/order.routes.js';
import { paymentRouter } from './routes/payment.routes.js';
import { orderLookupRouter } from './routes/order-lookup.routes.js';
import { reviewRouter } from './routes/review.routes.js';
import { pcBuildRouter } from './routes/pc-build.routes.js';
import { adminAuthRouter } from './routes/admin/admin-auth.routes.js';
import { adminBranchRouter } from './routes/admin/branch.routes.js';
import { adminCategoryRouter } from './routes/admin/category.routes.js';

const app = express();
const corsOrigin = environment.CORS_ORIGIN === '*' ? true : environment.CORS_ORIGIN;
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(correlationId);
app.get('/health', (_request, response): void => { response.json(success({ status: 'ok' }, response.locals.correlationId as string)); });
app.use('/v1', catalogRouter);
app.use('/v1', cartRouter);
app.use('/v1', checkoutRouter);
app.use('/v1', orderRouter);
app.use('/v1', paymentRouter);
app.use('/v1', orderLookupRouter);
app.use('/v1', reviewRouter);
app.use('/v1', pcBuildRouter);
app.use('/api/admin/auth', adminAuthRouter);
app.use('/v1/admin/auth', adminAuthRouter);
app.use('/api/admin/branches', adminBranchRouter);
app.use('/v1/admin/branches', adminBranchRouter);
app.use('/api/admin/categories', adminCategoryRouter);
app.use('/v1/admin/categories', adminCategoryRouter);
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(environment.PORT, (): void => {
    console.info(`EL-TECH API listening on port ${environment.PORT}`);
  });
}

export default app;
