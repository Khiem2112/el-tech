import cors from 'cors';
import express from 'express';
import { environment } from './config.js';
import { success } from './contracts/api.js';
import { correlationId, errorHandler } from './middleware/error-handler.js';
import { catalogRouter } from './routes/catalog.routes.js';
import { cartRouter } from './routes/cart.routes.js';

const app = express();
app.use(cors({ origin: environment.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(correlationId);
app.get('/health', (_request, response): void => { response.json(success({ status: 'ok' }, response.locals.correlationId as string)); });
app.use('/v1', catalogRouter);
app.use('/v1', cartRouter);
app.use(errorHandler);

app.listen(environment.PORT, (): void => { console.info(`EL-TECH API listening on port ${environment.PORT}`); });
