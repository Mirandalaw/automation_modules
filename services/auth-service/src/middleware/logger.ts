import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const method = req.method;
  const path = req.originalUrl;
  const userId = req.headers['x-user-id'] || 'Guest';
  const role = req.headers['x-role'] || 'none';
  const ip = req.ip;

  console.log(`[${new Date().toISOString()}] ${ip} ${method} ${path} | user: ${userId} (${role})`);

  next();
};
