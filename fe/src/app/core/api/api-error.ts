import { HttpErrorResponse } from '@angular/common/http';
import { DomainError } from './api.types';

const FALLBACK_ERROR: DomainError = { code: 'NETWORK_ERROR', messageKey: 'error.network', retryable: true, correlationId: 'unavailable' };

export const toDomainError = (error: unknown): DomainError => {
  if (error instanceof HttpErrorResponse && isDomainError(error.error)) return error.error.error;
  return FALLBACK_ERROR;
};

const isDomainError = (value: unknown): value is { success: false; error: DomainError } => typeof value === 'object' && value !== null && 'success' in value && (value as { success?: unknown }).success === false && 'error' in value;
