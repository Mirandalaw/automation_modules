import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
// 트래픽 제한
export const globalLimiter = rateLimit({
  windowMs : 60 * 100, // 1분
  max : 100, // IP당 1분에 최대 100회
  message: (req:Request, res:Response) => {
    return {
      success: false,
      message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      timestamp: new Date().toISOString(),
    };
  },
  handler: (req:Request,res:Response,next:NextFunction,options:any) => {
    console.warn(`[RATE_LIMIT] ${req.ip} blocked for ${req.originalUrl}`);
    res.status(429).json({
      message: 'Rate limit exceeded',
    });
  }
})