import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import router from './routes/index';
import errorHandler from './common/errors/errorHandler';
import { loggerMiddleware } from './common/middlewares/loggerMiddleware';
import { globalLimiter } from './common/middlewares/rateLimit';
import { swaggerSpec, swaggerUi } from '../src/docs/swagger';

// 환경변수 로드
dotenv.config();
// Express 앱 초기화
const app = express();

// 기본 미들웨어 등록
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);
app.use(globalLimiter);

// Route 등록
app.use('/', router);

// 에러 핸들러
app.use(errorHandler);

export default app;
