import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDatabase } from './db/db';
import router from './routes/index';
import errorHandler from './middleware/errorHandler';
import { loggerMiddleware } from './middleware/loggerMiddleware';
import { globalLimiter } from './middleware/rateLimit';
import { swaggerSpec, swaggerUi } from '../src/docs/swagger';
import './utils/redis'; // Redis 연결

// 환경변수 로드
dotenv.config();
// Express 앱 초기화
const app = express();

// Database 연결
connectDatabase();

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
