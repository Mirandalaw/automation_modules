import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import logger from '../../common/logger';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    logger.warn(`[CustomError] ${err.statusCode} - ${err.message}`);
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof TokenExpiredError) {
    logger.warn('[JWT] Token expired');
    return res.status(401).json({ message: 'Access token expired' });
  }

  if (err instanceof JsonWebTokenError) {
    logger.warn('[JWT] Invalid token');
    return res.status(401).json({ message: 'Invalid access token' });
  }

  if (err instanceof Error) {
    logger.error(`[Unhandled Error] ${err.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }

  logger.error(`[Unknown Error]`, err);
  return res.status(500).json({ message: 'Unexpected server error' });
};
