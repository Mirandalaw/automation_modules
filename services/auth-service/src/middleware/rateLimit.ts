import rateLimit from 'express-rate-limit';

// 트래픽 제한
export const globalLimiter = rateLimit({
  windowMs : 60 * 100, // 1분
  max : 100, // IP당 1분에 최대 100회
  message: (req, res) => {
    return {
      success: false,
      message: 'Too many requests. Please wait a minute.',
      timestamp: new Date().toISOString(),
    };
  },
  handler: (req,res,next,options) => {
    console.warn(`[RATE_LIMIT] ${req.ip} blocked for ${req.originalUrl}`);
    res.status(429).json({
      message: 'Rate limit exceeded',
    });
  }
})