import logger from './logger';

export class CustomError extends Error {
  public statusCode: number;
  public details?: string;
  public timestamp: string;
  public path?: string;
  public userId?: string;
  public reqId?: string;

  constructor(
    statusCode: number,
    message: string,
    options?: {
      details?: string;
      path?: string;
      userId?: string;
      reqId?: string;
    }
  ) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.message = message;
    this.details = options?.details;
    this.path = options?.path;
    this.userId = options?.userId;
    this.reqId = options?.reqId;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      statusCode: this.statusCode,
      message: this.message,
      details: this.details,
      path: this.path,
      userId: this.userId,
      reqId: this.reqId,
      timestamp: this.timestamp,
    };
  }

  log() {
    logger.error({
      name: this.name,
      statusCode: this.statusCode,
      message: this.message,
      details: this.details,
      path: this.path,
      userId: this.userId,
      reqId: this.reqId,
      timestamp: this.timestamp,
      stack: this.stack
    });
  }
}