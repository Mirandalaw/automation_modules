import { Request, Response, NextFunction } from 'express';
import logger from '../../common/logger';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const method = req.method;
  const path = req.originalUrl;
  const userId = req.headers['x-user-id'] || 'Guest';
  const role = req.headers['x-role'] || 'none';
  const ip = req.ip;

  logger.info(`${ip} ${method} ${path} | user: ${userId} (${role})`);
  next();
};