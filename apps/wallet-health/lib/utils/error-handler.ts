/**
 * Error Handler
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): { message: string; code: string } {
  if (error instanceof AppError) {
    return { message: error.message, code: error.code };
  }

  if (error instanceof Error) {
    return { message: error.message, code: 'UNKNOWN_ERROR' };
  }

  return { message: 'An unknown error occurred', code: 'UNKNOWN_ERROR' };
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('network') || error.message.includes('fetch');
  }
  return false;
}

