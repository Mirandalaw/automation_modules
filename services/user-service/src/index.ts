import express from 'express';
import cookieParser from 'cookie-parser';
import userRoutes from './routes';
import logger from '../src/common/logger';
import { errorHandler } from './common/middlewares/errorHandler';

const app = express();


app.use(express.json());
app.use(cookieParser());

// 요청 로깅
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection]', reason);
});

app.use((req, res, next) => {
  logger.info(`[Request] ${req.method} ${req.originalUrl}`);
  next();
});

// 라우팅
app.use('/user',userRoutes);

// 에러 핸들링 미들웨어
app.use(errorHandler);


export default app;