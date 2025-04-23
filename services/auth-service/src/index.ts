import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

import { authRoutes } from './routes/auth.routes';
import { connectDatabase } from './db/db';
import errorHandler from './middleware/errorHandler';
import { loggerMiddleware } from './middleware/loggerMiddleware';
import { globalLimiter } from './middleware/rateLimit';

import './utils/redis';


const app = express();

// TypeORM 연결
connectDatabase();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // 만약 쿠키 등도 쓸 거면
}));

app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);
app.use(globalLimiter);
app.use(authRoutes);


app.use(errorHandler);

export default app;
