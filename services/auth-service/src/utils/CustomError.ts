import logger from './logger';

interface CustomErrorOptions {
  details?: string;
  path?: string;
  userId?: string;
  reqId?: string;
}

export class CustomError extends Error {
  public readonly statusCode: number;
  public readonly details?: string;
  public readonly timestamp: string;
  public readonly path?: string;
  public readonly userId?: string;
  public readonly reqId?: string;

  constructor(
    statusCode: number,
    message: string,
    options: CustomErrorOptions = {}
  ) {
    super(message);

    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.details = options.details;
    this.path = options.path;
    this.userId = options.userId;
    this.reqId = options.reqId;
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
      stack: this.stack,
    });
  }
}
