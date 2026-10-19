export type ApiSuccess<T> = { success: true; data: T; meta?: { correlationId: string } };
export type ApiFailure = { success: false; error: { code: string; ruleId?: string; messageKey: string; details?: Record<string, unknown>; retryable: boolean; correlationId: string } };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
export type FailureOptions = Omit<ApiFailure['error'], 'correlationId'>;

export const success = <T>(data: T, correlationId: string): ApiSuccess<T> => ({ success: true, data, meta: { correlationId } });
export const failure = (correlationId: string, options: FailureOptions = { code: 'INTERNAL_ERROR', messageKey: 'error.internal', retryable: false }): ApiFailure => ({ success: false, error: { ...options, correlationId } });
