export type DomainErrorOptions = {
  readonly ruleId?: string;
  readonly messageKey: string;
  readonly details?: Record<string, unknown>;
  readonly retryable?: boolean;
  readonly status?: number;
};

export class DomainError extends Error {
  readonly code: string;
  readonly ruleId?: string;
  readonly messageKey: string;
  readonly details?: Record<string, unknown>;
  readonly retryable: boolean;
  readonly status: number;

  constructor(code: string, options: DomainErrorOptions) {
    super(code);
    this.name = 'DomainError';
    this.code = code;
    this.ruleId = options.ruleId;
    this.messageKey = options.messageKey;
    this.details = options.details;
    this.retryable = options.retryable ?? false;
    this.status = options.status ?? 400;
  }
}
