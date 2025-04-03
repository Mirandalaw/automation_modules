import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();

import { authRoutes } from './routes/authRoutes';
import { connectDatabase } from './db/db';
import errorHandler from './middleware/errorHandler';
import { loggerMiddleware } from './middleware/loggerMiddleware';
import { globalLimiter } from './middleware/rateLimit';
import './utils/redis';


const app = express();

// TypeORM 연결
connectDatabase();

app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);
app.use(globalLimiter);
app.use('/auth', authRoutes);

app.use(errorHandler);

export default app;
