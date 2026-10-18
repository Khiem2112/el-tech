import { NextFunction, Request, Response } from 'express';
import { failure } from '../contracts/api.js';

export const correlationId = (_request: Request, response: Response, next: NextFunction): void => {
  const id = crypto.randomUUID();
  response.locals.correlationId = id;
  response.setHeader('X-Correlation-Id', id);
  next();
};

export const errorHandler = (error: unknown, _request: Request, response: Response, _next: NextFunction): void => {
  const correlationId = response.locals.correlationId as string;
  console.error({ correlationId, error });
  response.status(500).json(failure(correlationId));
};
