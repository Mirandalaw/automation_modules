import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.routes';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());
app.use(cookieParser());

// 요청 로깅
app.use((req, res, next) => {
  logger.info(`[Request] ${req.method} ${req.originalUrl}`);
  next();
});

// 라우팅
app.use(userRoutes);

// 에러 핸들링 미들웨어
app.use(errorHandler);


export default app;