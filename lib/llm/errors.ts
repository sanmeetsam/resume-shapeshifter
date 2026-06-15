export type LlmErrorCode =
  | "LLM_NOT_CONFIGURED"
  | "LLM_AUTH_FAILED"
  | "LLM_RATE_LIMIT"
  | "LLM_TIMEOUT"
  | "LLM_VALIDATION_FAILED"
  | "LLM_ERROR";

export class LlmError extends Error {
  readonly code: LlmErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    message: string,
    code: LlmErrorCode,
    status: number,
    details?: unknown
  ) {
    super(message);
    this.name = "LlmError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function isLlmError(err: unknown): err is LlmError {
  return err instanceof LlmError;
}
