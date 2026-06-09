export class DataLayerError extends Error {
  readonly code: string;

  constructor(code: string, message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "DataLayerError";
    this.code = code;

    if (options?.cause) {
      this.cause = options.cause;
    }
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
