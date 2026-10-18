import { HttpInterceptorFn } from '@angular/common/http';

export const correlationIdInterceptor: HttpInterceptorFn = (request, next) => next(request.clone({ setHeaders: { 'X-Correlation-Id': crypto.randomUUID() } }));
