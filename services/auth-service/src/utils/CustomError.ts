export class CustomError extends Error {
  public statusCode: number;
  public message: string;
  public details?: string;

  constructor(statusCode: number, message: string, details?: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}