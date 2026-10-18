export type ApiSuccess<T> = { success: true; data: T; meta?: { correlationId: string } };
export type ApiFailure = { success: false; error: { code: string; ruleId?: string; messageKey: string; details?: Record<string, unknown>; retryable: boolean; correlationId: string } };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type DomainError = ApiFailure['error'];
